import * as XLSX from "xlsx";
import { endOfMonth, startOfMonth } from "date-fns";
import { createClient as supabase } from "../db/client/supabase-client";

import {
  FacturaCompleta,
  FacturaDelMes,
  NuevaFactura,
  NuevaFacturaLinea,
} from "../types/facturas";
import { obtenerUsuarioPorLegajo } from "./usuarios.service";
import { calcularCuotaActual, mesFacturacionISO } from "../date";
import { capitalize, numberToTwoDecimal } from "../utils";
import {
  getFacturaTotal,
  getFacturaExcedente,
  getFacturaImpuestos,
  getFacturaExtras,
  getFacturaGestion,
  getFacturaSubTotal,
  getFacturaFinalTotal,
} from "../factura-utils";
import { deleteBillsByMonth } from "./database.service";

export type FacturaOmitida = {
  legajo: string;
  motivo: string;
  reason: "sin_usuario" | "sin_contrato" | "error";
  lineas: number;
};

export async function obtenerFacturasDelMes(
  month: number,
  year: number
): Promise<FacturaCompleta[]> {
  const startDate = startOfMonth(new Date(year, month - 1, 1));
  const endDate = endOfMonth(new Date(year, month - 1, 1));

  const { data, error } = await supabase()
    .from("bills_mensuales")
    .select(
      `
    *,
    bills: bills(*),
    extras: bill_extras(
      monto,
      extras: extras(
        descripcion
      )
    ),
    contracts: contracts(
      fecha_inicio,
      fecha_final,
      entidad,
      certificado,
      disponible,
      tipo,
      users: users(
        legajo,
        nombre,
        apellido,
        cuil
      )
    )
    `
    )

    .gte("fecha", startDate.toISOString())
    .lte("fecha", endDate.toISOString());
  // .order('contracts.users.legajo', { ascending: true });

  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
  if (data.length === 0) return [];

  return data;
}

export async function obtenerFacturasMensualesPorContrato(
  contractId: string
): Promise<FacturaCompleta[]> {
  const { data: billsMensuales, error: billsMensualesError } = await supabase()
    .from("bills_mensuales")
    .select(
      `
     *,
     bills: bills(*),
     extras: bill_extras(
       monto,
       extras: extras(
         descripcion
       ) 
     ),
     contracts: contracts!inner(
       fecha_inicio,
       entidad,
       certificado,
       disponible,
       tipo,
       users: users!inner(
         legajo,
         nombre,
         apellido,
         cuil
       )
     )
         `
    )
    .eq("contracts.id", contractId);

  if (billsMensualesError) {
    console.error("Error fetching bills:", billsMensualesError);
    throw billsMensualesError;
  }

  return billsMensuales;
}

export async function obtenerFacturasPorFacturaMensualId(
  facturaMensualId: string
): Promise<FacturaCompleta> {
  const { data, error } = await supabase()
    .from("bills_mensuales")
    .select(
      `
      *,
      bills: bills(*),
      extras: bill_extras(
        monto,
        extras: extras(
          descripcion
        ) 
      ),
      contracts: contracts(
        fecha_inicio,
        entidad,
        certificado,
        tipo,
        users: users(
          legajo,
          nombre,
          apellido,
          cuil
        )
      )
          `
    )
    .eq("id", facturaMensualId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data;
}

export async function obtenerContratoVigenteEnMes(
  userId: string,
  fecha: Date
): Promise<{ id: string } | null> {
  const inicioMes = startOfMonth(fecha).toISOString();
  const finMes = endOfMonth(fecha).toISOString();

  const { data, error } = await supabase()
    .from("contracts")
    .select("id, fecha_inicio, fecha_final")
    .eq("user_id", userId)
    .lte("fecha_inicio", finMes)
    .or(`fecha_final.is.null,fecha_final.gte."${inicioMes}"`)
    .order("fecha_inicio", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function obtenerFacturasConNombre(
  groupedFacturas: Record<string, NuevaFactura[]>,
  fecha: Date
): Promise<{
  facturasConNombre: Record<string, NuevaFactura[]>;
  omitidos: FacturaOmitida[];
  listos: string[];
}> {
  const facturasConNombre: Record<string, NuevaFactura[]> = {};
  const omitidos: FacturaOmitida[] = [];
  const listos: string[] = [];

  for (const legajo of Object.keys(groupedFacturas)) {
    const lineas = groupedFacturas[legajo].length;
    const usuario = await obtenerUsuarioPorLegajo(legajo);

    if (!usuario) {
      omitidos.push({
        legajo,
        motivo: "Usuario no encontrado",
        reason: "sin_usuario",
        lineas,
      });
      facturasConNombre[legajo] = groupedFacturas[legajo].map((factura) => ({
        ...factura,
        nombre: "(sin usuario)",
      }));
      continue;
    }

    const contract = await obtenerContratoVigenteEnMes(usuario.id, fecha);
    const enriched = groupedFacturas[legajo].map((factura) => ({
      ...factura,
      nombre: capitalize(`${usuario.apellido}, ${usuario.nombre}`),
    }));
    facturasConNombre[legajo] = enriched;

    if (!contract) {
      omitidos.push({
        legajo,
        motivo: "Sin contrato vigente en el mes",
        reason: "sin_contrato",
        lineas,
      });
      continue;
    }

    listos.push(legajo);
  }

  return { facturasConNombre, omitidos, listos };
}

export async function insertarFacturasBatch(
  facturas: Record<string, NuevaFactura[]>,
  fecha: Date,
  legajosListos: string[]
): Promise<{
  uploaded: number;
  notUploaded: number;
  replaced: boolean;
  errors: Record<string, Error>;
  omitidos: FacturaOmitida[];
}> {
  const errors: Record<string, Error> = {};
  const omitidos: FacturaOmitida[] = [];
  let uploadedCount = 0;
  let notUploadedCount = 0;

  // Reemplaza líneas del mes (mantiene cabeceras/extras si existen).
  await deleteBillsByMonth(fecha);

  const inicioMes = startOfMonth(fecha).toISOString();
  const finMes = endOfMonth(fecha).toISOString();

  for (const legajo of legajosListos) {
    const userFacturas = facturas[legajo];
    if (!userFacturas?.length) continue;

    try {
      const user = await obtenerUsuarioPorLegajo(legajo);
      if (!user) {
        omitidos.push({
          legajo,
          motivo: "Usuario no encontrado",
          reason: "sin_usuario",
          lineas: userFacturas.length,
        });
        notUploadedCount += userFacturas.length;
        continue;
      }

      const contract = await obtenerContratoVigenteEnMes(user.id, fecha);
      if (!contract) {
        omitidos.push({
          legajo,
          motivo: "Sin contrato vigente en el mes",
          reason: "sin_contrato",
          lineas: userFacturas.length,
        });
        notUploadedCount += userFacturas.length;
        continue;
      }

      const { data: facturaMensual, error: facturaMensualError } =
        await supabase()
          .from("bills_mensuales")
          .select("id")
          .eq("contract_id", contract.id)
          .gte("fecha", inicioMes)
          .lte("fecha", finMes)
          .limit(1);

      if (facturaMensualError && facturaMensualError.code !== "PGRST116") {
        throw facturaMensualError;
      }

      let facturaMensualId: string;
      if (!facturaMensual || facturaMensual.length === 0) {
        facturaMensualId = await crearFacturaMensual(contract.id, fecha);
      } else {
        facturaMensualId = facturaMensual[0].id;
      }

      for (const factura of userFacturas) {
        await insertarFacturaPorFacturaMensualId(facturaMensualId, factura);
        uploadedCount++;
      }
    } catch (error) {
      console.error(`Error inserting facturas for ${legajo}:`, error);
      errors[legajo] = error as Error;
      omitidos.push({
        legajo,
        motivo: (error as Error).message || "Error al insertar",
        reason: "error",
        lineas: userFacturas.length,
      });
      notUploadedCount += userFacturas.length;
    }
  }

  return {
    uploaded: uploadedCount,
    notUploaded: notUploadedCount,
    replaced: true,
    errors,
    omitidos,
  };
}

export async function crearFacturaMensual(
  contract_id: string,
  fecha: Date
): Promise<string> {
  const { data, error } = await supabase()
    .from("bills_mensuales")
    .insert({ contract_id, fecha: mesFacturacionISO(fecha) })
    .select("id")
    .maybeSingle();

  if (error) throw error;

  return data?.id;
}

export async function insertarFacturaPorFacturaMensualId(
  facturaMensualId: string,
  factura: NuevaFacturaLinea
) {
  const { data, error } = await supabase()
    .from("bills")
    .insert({
      nro_linea: factura.nro_linea,
      plan: factura.plan,
      monto_valor: factura.monto_valor,
      monto_servic: factura.monto_servic,
      monto_bonifi: factura.monto_bonifi,
      monto_llama: factura.monto_llama,
      monto_llamcd: factura.monto_llamcd,
      monto_roami: factura.monto_roami,
      monto_mens: factura.monto_mens,
      monto_datos: factura.monto_datos,
      monto_otros: factura.monto_otros,
      monto_total: factura.monto_total,
      impuestos: factura.impuestos,
      gestion_de: factura.gestion_de,
      total: factura.total,
      factura_mensual_id: facturaMensualId,
    })
    .select("id");

  if (error) throw error;

  return data[0].id;
}

export async function downloadBillsInExcelFile(
  facturas: FacturaDelMes[],
  month: number,
  year: number
) {
  const data = facturas.map((factura) => ({
    Legajo: factura.bills_mensuales.contracts.users.legajo,
    Cuil: factura.bills_mensuales.contracts.users.cuil,
    Nombre: factura.bills_mensuales.contracts.users.nombre,
    Apellido: factura.bills_mensuales.contracts.users.apellido,
    "Nro Linea": factura.nro_linea,
    Plan: factura.plan,
    Fecha: factura.bills_mensuales.fecha,
    Cuota: factura.cuota,
    "Monto Valor": factura.monto_valor,
    "Monto Servicio": factura.monto_servic,
    "Monto Bonificación": factura.monto_bonifi,
    "Monto Llama": factura.monto_llama,
    "Monto Llamada Inter.": factura.monto_llamcd,
    "Monto Roaming": factura.monto_roami,
    "Monto Mens": factura.monto_mens,
    "Monto Datos": factura.monto_datos,
    "Monto Otros": factura.monto_otros,
    "Monto Total": factura.monto_total,
    Impuestos: factura.impuestos,
    "Gestión De Servicios": factura.gestion_de,
    Total: factura.total,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.writeFile(
    workbook,
    `facturas_${month.toString().padStart(2, "0")}_${year}.xlsx`
  );
}

export async function downloadBillsInExcelFileporLegajo(
  facturas: FacturaCompleta[],
  month: number,
  year: number
) {
  const data = facturas.map((factura) => {
    const isActivo = factura.contracts.tipo === "activo";
    const claro = getFacturaSubTotal(factura);
    const subtotal = getFacturaTotal(factura);
    const impuestos = getFacturaImpuestos(factura);
    const gestion = getFacturaGestion(factura);
    const extras = getFacturaExtras(factura);
    const disponible = factura.contracts.disponible;
    const excedente = getFacturaExcedente(factura);
    const total = getFacturaFinalTotal(factura);
    return {
      Legajo: factura.contracts.users.legajo,
      Nombre: factura.contracts.users.nombre,
      Apellido: factura.contracts.users.apellido,
      Cuil: factura.contracts.users.cuil,
      Cuota: isActivo
        ? calcularCuotaActual(
            factura.contracts.fecha_inicio,
            new Date(year, month - 1, 1)
          )
        : "N/A",
      Disponible: isActivo ? numberToTwoDecimal(disponible) : "N/A",
      Claro: numberToTwoDecimal(claro),
      Impuestos: numberToTwoDecimal(impuestos),
      Gestion: numberToTwoDecimal(gestion),
      Subtotal: numberToTwoDecimal(subtotal),
      Extras: numberToTwoDecimal(extras),
      Excedente: isActivo ? numberToTwoDecimal(excedente) : "N/A",
      Total: numberToTwoDecimal(total),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.writeFile(
    workbook,
    `facturas_legajos_${month.toString().padStart(2, "0")}_${year}.xlsx`
  );
}

export async function downloadBillsInTxtFile(
  facturas: FacturaCompleta[],
  month: number,
  year: number
) {
  const data = facturas
    .filter((factura) => factura.contracts.tipo === "activo")
    .map((factura) => {
      const newImporte = Math.round(getFacturaFinalTotal(factura) * 100)
        .toString()
        .padStart(13, "0");
      if (parseInt(newImporte) <= 0) return;
      // fecha_inicio llega como ISO UTC (ej. 2025-09-04T00:00:00.000Z);
      // usar UTC evita el desfase de timezone al armar ddmmyyyy.
      const fecha = new Date(factura.contracts.fecha_inicio);
      const fechaAlta = `${fecha.getUTCDate().toString().padStart(2, "0")}${(
        fecha.getUTCMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${fecha.getUTCFullYear()}`;
      // Usar month/year del picker directo: `new Date(`${year}-${month}-01`)`
      // rompe en oct-dic (ISO UTC → mes anterior en Argentina).
      const mes = month.toString().padStart(2, "0");
      const fechaFactura = `10${mes}${year}`;
      const fechaVencimiento = `28${mes}${year}`;
      const fechaVencimientoPresentacion = `28${mes}${year + 1}`;
      const newCuota = calcularCuotaActual(
        factura.contracts.fecha_inicio,
        new Date(year, month - 1, 1)
      )
        .toString()
        .padStart(3, "0");

      return `0000000000000000${fechaFactura}0000${factura.contracts.users.cuil}0000000000${newCuota}${newImporte}${fechaVencimiento}0000000000000000000000000000000000000000${factura.contracts.entidad}${newImporte}012${fechaAlta}0000000000000000001${fechaVencimientoPresentacion}${factura.contracts.certificado}00000000000000000000`;
    })
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturas_${month.toString().padStart(2, "0")}_${year}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
