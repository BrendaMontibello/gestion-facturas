/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { createClient as supabase } from '../db/client/supabase-client';
import { FacturadDelMes, FacturaMensual, NuevaFactura, NuevaFacturaLinea } from '../types/facturas';


export async function obtenerFacturasDelMes(
  month: number,
  year: number
): Promise<FacturadDelMes[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  const { data, error } = await supabase()
  .from("bills")
  .select(
      `
      *,
      bills_mensuales: bills_mensuales!inner(
        fecha,
        contracts: contracts!inner(
          fecha_inicio,
          entidad,
          certificado,
          users: users!inner(
            legajo,
            nombre,
            apellido,
            cuil
          )
        )
      )
    `
    )
    .gte("bills_mensuales.fecha", startDate.toISOString())
    .lte("bills_mensuales.fecha", endDate.toISOString());

  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data.map((factura: FacturadDelMes) => {
    const contractStartDate = new Date(factura.bills_mensuales.contracts.fecha_inicio);
    const billDate = new Date(factura.bills_mensuales.fecha);
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

export async function obtenerFacturasMensualesPorContrato(
  contractId: string
): Promise<FacturaMensual[]> {
  console.log("🚀 ~ contractId:", contractId)
  const { data, error } = await supabase()
  .from("bills_mensuales")
  .select("*")
  .eq("contract_id", contractId);
  
  console.log("🚀 ~ data:", data)
  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data;
}

export async function obtenerFacturasPorFacturaMensualId(
facturaMensualId: string
): Promise<FacturadDelMes[]> {
console.log("🚀 ~ facturaMensualId:", facturaMensualId)

  const { data, error } = await supabase()
  .from("bills")
  .select(
     `
      *,
      bills_mensuales: bills_mensuales!inner(
        fecha,
        contracts: contracts!inner(
          fecha_inicio,
          entidad,
          certificado,
          users: users!inner(
            legajo,
            nombre,
            apellido,
            cuil
          )
          )
          )
          `
        )
        .eq("bills_mensuales.id", facturaMensualId)
        console.log("🚀 ~ data:", data)
        
  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }

  return data.map((factura: any) => {
    const contractStartDate = new Date(factura.bills_mensuales.contracts.fecha_inicio);
    const billDate = new Date(factura.bills_mensuales.fecha);
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

export async function insertarFacturasBatch(
  facturas: NuevaFactura[],
  fecha: Date
): Promise<{ uploaded: number; notUploaded: number }> {
  const errors: Record<string, Error> = {};
  let uploadedCount = 0;
  let notUploadedCount = 0;

  // Group facturas by nombre and apellido
  const groupedFacturas = facturas.reduce((acc, factura) => {
    const key = `${factura.nombre?.toLowerCase().trim()} ${factura.apellido?.toLowerCase().trim()}`;
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
        .select("id, legajo")
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

      if (contractError || !contract) {
        console.warn(`No contract found for ${key}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      }

      let facturaMensualId: string;

      const { data: facturaMensual, error: facturaMensualError } = await supabase()
      .from("bills_mensuales")
      .select("id")
      .eq("contract_id", contract.id)
      .eq("fecha", fecha.toISOString())
      .single();

      if (facturaMensualError && facturaMensualError.code !== 'PGRST116') {
        console.warn(`factura mensual errorfound for ${key}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      };

      if (!facturaMensual) {
        facturaMensualId = await crearFacturaMensual(contract.id, fecha);
      } else {
        facturaMensualId = facturaMensual.id;
      } 
      console.log("🚀 ~ facturaMensualId:", facturaMensualId)

      // Upload each factura to the found contract
      for (const factura of userFacturas) {
        await insertarFacturaPorFacturaMensualId(facturaMensualId, factura);
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

export async function crearFacturaMensual(contract_id: string, fecha: Date): Promise<string> {
  const { data, error } = await supabase()
    .from("bills_mensuales")
    .insert({ contract_id, fecha })
    .select()
    .single();

    if (error) throw error;

    return data.id;
}

export async function insertarFacturaPorFacturaMensualId(facturaMensualId: string, factura: NuevaFacturaLinea) {
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
      factura_mensual_id: facturaMensualId })
    .select()
    .single();

    if (error) throw error;

    return data.id;
}

export async function downloadBillsInCsvFile(
  facturas: any[],
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
  facturas: FacturadDelMes[],
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
  XLSX.writeFile(workbook, `facturas_${month}_${year}.xlsx`);
}

export async function downloadBillsInTxtFile(
  facturas: FacturadDelMes[],
  month: number,
  year: number
) {
  console.log("🚀 ~ facturas:", facturas)
  const data = facturas
    .map((factura) => {
      const fecha = new Date(factura.bills_mensuales.fecha);
      const fechaAlta = `${fecha.getDate()}${fecha.getMonth()}${fecha.getFullYear()}`;
      const fechaFacturacion = new Date(`${year}-${month}-01`);
      const fechaFactura = `10${fechaFacturacion.getMonth()}${fechaFacturacion.getFullYear()}`;
      const fechaVencimiento = `28${fechaFacturacion.getMonth()}${fechaFacturacion.getFullYear()}`;
      const fechaVencimientoPresentacion = `28${fechaFacturacion.getMonth()}${
        fechaFacturacion.getFullYear() + 1
      }`;
      const newCuota = factura.cuota.toString().padStart(3, "0");
      const newImporte = (Math.round(factura.monto_total * 100)).toString().padStart(13, "0");

      return `0000000000000000${fechaFactura}0000${factura.bills_mensuales.contracts.users.cuil}0000000000${newCuota}${newImporte}${fechaVencimiento}0000000000000000000000000000000000000000${factura.bills_mensuales.contracts.entidad}${newImporte}012${fechaAlta}0000000000000000001${fechaVencimientoPresentacion}${factura.bills_mensuales.contracts.certificado}00000000000000000000`;
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
