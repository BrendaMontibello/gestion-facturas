/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { startOfMonth, endOfMonth } from 'date-fns';
import { createClient as supabase } from '../db/client/supabase-client';
import { FacturaCompleta, FacturadDelMes, NuevaFactura, NuevaFacturaLinea } from '../types/facturas';
import { obtenerUsuarioPorLegajo } from './usuarios.service';
import { calcularCuotaActual } from '../date';
import { numberToTwoDecimal } from '../utils';


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
      entidad,
      certificado,
      disponible,
      estado,
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
    .lte("fecha", endDate.toISOString())
    // .order('contracts.users.legajo', { ascending: true });
    
  if (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
  if (data.length === 0) return [];

  return data
}

export async function obtenerFacturasMensualesPorContrato(
  contractId: string
): Promise<FacturaCompleta[]> {

  const {data: billsMensuales, error: billsMensualesError} = await supabase()
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
       estado,
       users: users!inner(
         legajo,
         nombre,
         apellido,
         cuil
       )
     )
         `
       ) .eq("contracts.id", contractId)
    
    console.log("🚀 ~ billsMensuales:", billsMensuales)
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

export async function insertarFacturasBatch(
  facturas: Record<string, NuevaFactura[]>,
  fecha: Date
): Promise<{ uploaded: number; notUploaded: number; errors: Record<string, Error> }> {
  const errors: Record<string, Error> = {};
  let uploadedCount = 0;
  let notUploadedCount = 0;

  
  for (const [legajo, userFacturas] of Object.entries(facturas)) {
    try {
      const user = await obtenerUsuarioPorLegajo(legajo);
      if (!user) {
        console.warn(`User not found for ${legajo}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      }
      // Now find the latest contract for the user using user_id
      const { data: contract, error: contractError } = await supabase()
      .from("contracts")
      .select("id, users!inner(id)")
      .eq("users.id", user.id) // Use user.legajo to find the contract
      .order("fecha_inicio", { ascending: false })
      
      if (contractError || contract.length === 0) {
        console.warn(`No contract found for ${legajo}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      }

      let facturaMensualId: string;

      const { data: facturaMensual, error: facturaMensualError } = await supabase()
      .from("bills_mensuales")
      .select("id")
      .eq("contract_id", contract[0].id)
      .eq("fecha", fecha.toISOString())


      if (facturaMensualError && facturaMensualError.code !== 'PGRST116') {
        console.warn(`factura mensual errorfound for ${legajo}. Skipping.`);
        notUploadedCount += userFacturas.length;
        continue;
      };

      if (!facturaMensual || facturaMensual.length === 0) {
        facturaMensualId = await crearFacturaMensual(contract[0].id, fecha);
      } else {
        facturaMensualId = facturaMensual[0].id;
      } 

      // Upload each factura to the found contract
      for (const factura of userFacturas) {
        await insertarFacturaPorFacturaMensualId(facturaMensualId, factura);
        uploadedCount++;
      }
    } catch (error) {
      console.error(`Error inserting facturas for ${legajo}:`, error);
      errors[legajo] = error as Error;
      notUploadedCount += userFacturas.length;
    }
  }

  if (Object.keys(errors).length > 0) {
    console.error("Some facturas could not be uploaded:", errors);
  }

  return { uploaded: uploadedCount, notUploaded: notUploadedCount, errors: errors };
}

export async function crearFacturaMensual(contract_id: string, fecha: Date): Promise<string> {
  console.log("🚀 ~ crearFacturaMensual ~ fecha:", fecha)
  console.log("🚀 ~ crearFacturaMensual ~ contract_id:", contract_id)
  const { data, error } = await supabase()
    .from("bills_mensuales")
    .insert({ contract_id, fecha })
    .select('id')
    .maybeSingle();

    if (error) throw error;

    return data?.id;
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
    .select('id')


    if (error) throw error;

    return data[0].id;
}

export const getFacturaSubTotal = (factura: FacturaCompleta) => {
  const subtotal = factura.bills.map(bill => bill.monto_total).reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(subtotal);
}

export const getFacturaExtras = (factura: FacturaCompleta) => {
  const extras = factura.extras?.map(extra => extra.monto).reduce((a, b) => a + b, 0) ?? 0;
  return numberToTwoDecimal(extras);
}

export const getFacturaImpuestos = (factura: FacturaCompleta) => {
  const impuestos = factura.bills.map(bill => bill.impuestos).reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(impuestos);
}

export const getFacturaGestion = (factura: FacturaCompleta) => {
  const gestion = factura.bills.map(bill => bill.gestion_de).reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(gestion);
}

export const getFacturaExcedente = (factura: FacturaCompleta) => {
  const disponible = factura.contracts.disponible ?? 0;
  const subtotal = getFacturaSubTotal(factura);
  const extras = getFacturaExtras(factura);
  const excedente = (subtotal + extras) - disponible;
  return Math.max(0, numberToTwoDecimal(excedente));
}

export const getFacturaTotal = (factura: FacturaCompleta) => {
  const subtotal = getFacturaSubTotal(factura);
  const impuestos = getFacturaImpuestos(factura);
  const gestion = getFacturaGestion(factura);
  const extras = getFacturaExtras(factura);
  let total = subtotal + extras + impuestos + gestion - getFacturaExcedente(factura);
  if (factura.contracts.estado === 'cobranza manual') {
    total = subtotal + extras + impuestos + gestion;
  }
  return numberToTwoDecimal(total);
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
  XLSX.writeFile(workbook, `facturas_${month.toString().padStart(2, '0')}_${year}.xlsx`);
}

export async function downloadBillsInExcelFileporLegajo(
  facturas: FacturaCompleta[],
  month: number,
  year: number
) {

  const data = facturas.toSorted((a, b) => a.contracts.users.legajo.padStart(8, '0').localeCompare(b.contracts.users.legajo.padStart(8, '0'))).map(( factura) => {
    const isActivo = factura.contracts.estado === 'activo';
    const subtotal = getFacturaSubTotal(factura);
    const impuestos = getFacturaImpuestos(factura);
    const gestion = getFacturaGestion(factura);
    const extras = getFacturaExtras(factura);
    const disponible = factura.contracts.disponible;
    const excedente = getFacturaExcedente(factura);
    const total = getFacturaTotal(factura);
    return {
      Legajo: factura.contracts.users.legajo,
      Nombre: factura.contracts.users.nombre,
      Apellido: factura.contracts.users.apellido,
      Cuil: factura.contracts.users.cuil,
      Cuota: isActivo ? calcularCuotaActual(factura.contracts.fecha_inicio) : 'N/A',
      Disponible: isActivo ? numberToTwoDecimal(disponible) : 'N/A',
      Subtotal: numberToTwoDecimal(subtotal),
      Impuestos: numberToTwoDecimal(impuestos),
      Gestion: numberToTwoDecimal(gestion),
      Extras: numberToTwoDecimal(extras),
      Excedente: isActivo ? numberToTwoDecimal(excedente) : 'N/A',
      Total: numberToTwoDecimal(total),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas");
  XLSX.writeFile(workbook, `facturas_legajos_${month.toString().padStart(2, '0')}_${year}.xlsx`);
}

export async function downloadBillsInTxtFile(
  facturas: FacturaCompleta[],
  month: number,
  year: number
) {
  const data = facturas.filter(factura => factura.contracts.estado === 'activo')
    .map((factura) => {
      const newImporte = (Math.round(getFacturaTotal(factura) * 100)).toString().padStart(13, "0");
      if (parseInt(newImporte) <= 0) return;
      const fecha = new Date(factura.fecha);
      const fechaAlta = `${fecha.getDate() + 1}${(fecha.getMonth() + 1).toString().padStart(2, "0")}${fecha.getFullYear()}`;
      const fechaFacturacion = new Date(`${year}-${month}-01`);
      const fechaFactura = `10${(fechaFacturacion.getMonth() + 1).toString().padStart(2, "0")}${fechaFacturacion.getFullYear()}`;
      const fechaVencimiento = `28${(fechaFacturacion.getMonth() + 1).toString().padStart(2, "0")}${fechaFacturacion.getFullYear()}`;
      const fechaVencimientoPresentacion = `28${(fechaFacturacion.getMonth() + 1).toString().padStart(2, "0")}${
        fechaFacturacion.getFullYear() + 1
      }`;
      const newCuota = calcularCuotaActual(factura.contracts.fecha_inicio).toString().padStart(3, "0");

      return `0000000000000000${fechaFactura}0000${factura.contracts.users.cuil}0000000000${newCuota}${newImporte}${fechaVencimiento}0000000000000000000000000000000000000000${factura.contracts.entidad}${newImporte}012${fechaAlta}0000000000000000001${fechaVencimientoPresentacion}${factura.contracts.certificado}00000000000000000000`;
    })
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facturas_${month.toString().padStart(2, '0')}_${year}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
