/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { createClient as supabase } from '../db/client/supabase-client';
import { Factura, FacturasPorMes, NuevaFactura } from '../types';
import { PaginationParams } from '../types/pagination';

interface FacturaFilters extends PaginationParams {
  userId?: string;
  contract_id?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function obtenerFacturasPaginadas(params: FacturaFilters) {
  const {
    page = 1,
    pageSize = 10,
    userId,
    contract_id,
    startDate,
    endDate,
  } = params;
  const start = (page - 1) * pageSize;

  let query = supabase()
    .from("bills")
    .select(
      `
      *,
      contracts!inner(
        id,
        entidad,
        users!inner(
          id,
          apellido,
          nombre
        )
      )
    `,
      { count: "exact" }
    );

  if (userId) {
    query = query.eq("contracts.users.id", userId);
  }

  if (contract_id) {
    query = query.eq("contract_id", contract_id);
  }

  if (startDate) {
    query = query.gte("fecha", startDate.toISOString());
  }

  if (endDate) {
    query = query.lte("fecha", endDate.toISOString());
  }

  const { data, error, count } = await query
    .range(start, start + pageSize - 1)
    .order("fecha", { ascending: false });
  console.log("🚀 ~ data:", data);

  if (error) throw error;

  return {
    data: data.map((item: Factura) => ({
      id: item.id,
      nro_linea: item.nro_linea,
      nombre: item.nombre.toLowerCase(),
      apellido: item.apellido.toLowerCase(),
      plan: item.plan,
      monto_valor: item.monto_valor,
      monto_servic: item.monto_servic,
      monto_bonifi: item.monto_bonifi,
      monto_llama: item.monto_llama,
      monto_llamcd: item.monto_llamcd,
      monto_roami: item.monto_roami,
      monto_mens: item.monto_mens,
      monto_datos: item.monto_datos,
      monto_otros: item.monto_otros,
      monto_total: item.monto_total,
      impuestos: item.impuestos,
      gestion_de: item.gestion_de,
      total: item.total,
      contract_id: item.contract_id,
    })),
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function insertarFacturaPorContratoId(
  contract_id: string,
  factura: NuevaFactura,
  fecha: Date
): Promise<
  Omit<
    Factura,
    "fecha" | "impuestos" | "gestion_de" | "total" | "legajo" | "cuota"
  >
> {
  console.log("🚀 ~ factura:", factura);

  const { data, error } = await supabase()
    .from("bills")
    .insert({
      nro_linea: factura.nro_linea,
      nombre: factura.nombre.toLowerCase(),
      apellido: factura.apellido.toLowerCase(),
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
      contract_id: contract_id,
      fecha,
      impuestos: factura.impuestos,
      gestion_de: factura.gestion_de,
      total: factura.total,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...factura,
    id: data.id,
    contract_id: data.contract_id,
  };
}

export async function insertarFacturaUsuarioBatch(facturas: NuevaFactura[], fecha: Date) {
  for (const factura of facturas) {
    try {
      // First, find the user by apellido and nombre
      const { data: user, error: userError } = await supabase()
        .from("users")
        .select("id")
        .ilike("apellido", factura.apellido?.toLowerCase())
        .ilike("nombre", factura.nombre?.toLowerCase())
        .single();

      if (userError || !user) {
        console.warn(`No user found for ${factura.apellido} ${factura.nombre}. Skipping.`);
        continue;
      }

      // Now find the latest contract for the user using user_id
      const { data: contract, error: contractError } = await supabase()
        .from("contracts")
        .select("id")
        .eq("user_id", user.id) // Use user.id to find the contract
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .single();

      console.log("🚀 ~ contract:", contract);
      if (contractError || !contract) {
        console.warn(`No contract found for ${factura.apellido} ${factura.nombre}. Skipping.`);
        continue;
      }

      // Upload each factura to the found contract
      await insertarFacturaPorContratoId(contract.id, factura, fecha);
    } catch (error) {
      console.error(`Error inserting facturas for ${factura.apellido} ${factura.nombre}:`, error);
    }
  }

}

export async function insertarFacturasBatch(
  facturas: NuevaFactura[],
  fecha: Date
): Promise<{ uploaded: number; notUploaded: number }> {
  const errors: Record<string, Error> = {};
  let uploadedCount = 0;
  let notUploadedCount = 0;

  // Group facturas by nombre and apellido
  const groupedFacturas = facturas.reduce((acc, factura) => {
    const key = `${factura.nombre?.toLowerCase()} ${factura.apellido?.toLowerCase()}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(factura);
    return acc;
  }, {} as Record<string, NuevaFactura[]>);

  for (const [key, userFacturas] of Object.entries(groupedFacturas)) {
    try {
      // First, find the user by apellido and nombre
      const { data: user, error: userError } = await supabase()
        .from("users")
        .select("id")
        .ilike("apellido", userFacturas[0].apellido?.toLowerCase())
        .ilike("nombre", userFacturas[0].nombre?.toLowerCase())
        .single();

      if (userError || !user) {
        console.warn(`No user found for ${key}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      }

      // Now find the latest contract for the user using user_id
      const { data: contract, error: contractError } = await supabase()
        .from("contracts")
        .select("id")
        .eq("user_id", user.id) // Use user.id to find the contract
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .single();

      console.log("🚀 ~ contract:", contract);
      if (contractError || !contract) {
        console.warn(`No contract found for ${key}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      }

      // Upload each factura to the found contract
      for (const factura of userFacturas) {
        await insertarFacturaPorContratoId(contract.id, factura, fecha);
        uploadedCount++;
      }
    } catch (error) {
      console.error(`Error inserting facturas for ${key}:`, error);
      errors[key] = error as Error;
      notUploadedCount += userFacturas.length;
    }
  }

  if (Object.keys(errors).length > 0) {
    console.error("Some facturas could not be uploaded:", errors);
  }

  return { uploaded: uploadedCount, notUploaded: notUploadedCount };
}

export async function obtenerFacturasPorContrato(
  contractId: string
): Promise<Factura[]> {
  const { data, error } = await supabase()
    .from("bills")
    .select("*")
    .eq("contract_id", contractId);

  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data;
}

export async function obtenerFacturasPorMes(
  month: number,
  year: number
): Promise<FacturasPorMes[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const { data, error } = await supabase()
    .from("bills")
    .select(
      `
      *,
      contracts!inner(
        fecha_inicio,
        entidad,
        certificado,
        users!inner(
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

  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data.map((factura: any) => {
    const contractStartDate = new Date(factura.contracts.fecha_inicio);
    const billDate = new Date(factura.fecha);
    const cuota =
      Math.floor(
        (billDate.getFullYear() - contractStartDate.getFullYear()) * 12 +
          billDate.getMonth() -
          contractStartDate.getMonth()
      ) + 1;

    return {
      ...factura,
      cuota,
    };
  });
}

export async function downloadBillsInCsvFile(
  facturas: FacturasPorMes[],
  month: number,
  year: number
) {
  // Map the data to match the headers
  const data = facturas.map((factura) => ({
    "Nro Linea": factura.nro_linea,
    Nombre: factura.nombre,
    Apellido: factura.apellido,
    Plan: factura.plan,
    Fecha: factura.fecha,
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

  const csv = Papa.unparse({
    fields: Object.keys(data[0]),
    data,
  });

  const blob = new Blob([csv], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturas_${month}_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadBillsInExcelFile(
  facturas: FacturasPorMes[],
  month: number,
  year: number
) {
  const data = facturas.map((factura) => ({
    Legajo: factura.contracts.users.legajo,
    Cuil: factura.contracts.users.cuil,
    Nombre: factura.nombre,
    Apellido: factura.apellido,
    "Nro Linea": factura.nro_linea,
    Plan: factura.plan,
    Fecha: factura.fecha,
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
  XLSX.writeFile(workbook, `facturas_${month}_${year}.xlsx`);
}

export async function downloadBillsInTxtFile(
  facturas: FacturasPorMes[],
  month: number,
  year: number
) {
  const data = facturas
    .map((factura) => {
      const fecha = new Date(factura.fecha);
      const fechaAlta = `${fecha.getDate()}${fecha.getMonth()}${fecha.getFullYear()}`;
      const fechaFacturacion = new Date(`${year}-${month}-01`);
      const fechaFactura = `10${fechaFacturacion.getMonth()}${fechaFacturacion.getFullYear()}`;
      const fechaVencimiento = `28${fechaFacturacion.getMonth()}${fechaFacturacion.getFullYear()}`;
      const fechaVencimientoPresentacion = `28${fechaFacturacion.getMonth()}${
        fechaFacturacion.getFullYear() + 1
      }`;
      const newCuota = factura.cuota.toString().padStart(3, "0");
      const newImporte = factura.monto_total.toString().padStart(13, "0");

      return `0000000000000000${fechaFactura}0000${factura.contracts.users.cuil}0000000000${newCuota}${newImporte}${fechaVencimiento}0000000000000000000000000000000000000000${factura.contracts.entidad}${newImporte}012${fechaAlta}0000000000000000001${fechaVencimientoPresentacion}${factura.contracts.certificado}00000000000000000000`;
    })
    .join("\n");

  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturas_${month}_${year}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
