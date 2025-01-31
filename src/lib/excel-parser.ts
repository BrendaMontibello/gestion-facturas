/* eslint-disable @typescript-eslint/no-explicit-any */
import { read, utils } from "xlsx";

import { numberToTwoDecimal } from "./utils";
import { FacturaCsv } from "./types/csv";
import { NuevoUsuario, UserType } from "./types/users";
import { NuevoConsumoExtraAAplicar, NuevoConsumoExtra } from "./types/consumos";

export async function parsearUsuariosExcel(
  file: File
): Promise<NuevoUsuario[]> {
  const xlsxBuffer = await file.arrayBuffer();
  const workbook = read(xlsxBuffer, {});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);

  const users = data.map((row: any) => ({
    legajo: row["LEGAJO"]?.toString().toLowerCase().trim() || "",
    cuil: row["CUIL"]?.toString().toLowerCase().trim() || "",
    certificado: row["CERTIFICADO"]?.toString().toLowerCase().trim() || "",
    entidad: row["ENTIDAD"]?.toString().toLowerCase().trim() || "",
    fecha:
      row["FECHA"]?.toString().trim().padStart(8, "0") || "".padStart(8, "0"),
    disponible: numberToTwoDecimal(row["DISPONIBLE"]) || 0,
    rem_mens: numberToTwoDecimal(row["REM MENS"]) || 0,
    nombre: row["NOMBRE"]?.toString().toLowerCase().trim() || "",
    apellido: row["APELLIDO"]?.toString().toLowerCase().trim() || "",
    userType:
      (row["ESTADO"]?.toString().trim().toLowerCase() as UserType) ?? "other",
  }));
  return users;
}

export async function parsearExcelFacturas(file: File): Promise<FacturaCsv[]> {
  const xlsxBuffer = await file.arrayBuffer();
  const workbook = read(xlsxBuffer, {});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);

  const facturas = data.map((row: any) => ({
    nro_linea: parseInt(row["Nro Linea"]),
    legajo: row["legajo"].toString().trim() || "",
    usuario: row["Usuario"].toString().trim() || "",
    plan: row["Plan"]?.toString().trim() || "",
    monto_valor: numberToTwoDecimal(row["Monto valor plan"]) || 0,
    monto_servic: numberToTwoDecimal(row["Monto servicios adicionales"]) || 0,
    monto_bonifi: numberToTwoDecimal(row["Monto bonificaciones"]) || 0,
    monto_llama: numberToTwoDecimal(row["Monto llamadas locales nac"]) || 0,
    monto_llamcd: numberToTwoDecimal(row["Monto llamdas internacionales"]) || 0,
    monto_roami: numberToTwoDecimal(row["Monto roaming"]) || 0,
    monto_mens: numberToTwoDecimal(row["Monto mensajes"]) || 0,
    monto_datos: numberToTwoDecimal(row["Monto datos"]) || 0,
    monto_otros: numberToTwoDecimal(row["Monto otros cargos "]) || 0,
    monto_total: numberToTwoDecimal(row["Monto total linea"]) || 0,
  }));
  console.log(
    "🚀 ~ file: excel-parser.ts:61 ~ parsearExcelFacturas ~ facturas:",
    facturas
  );
  return facturas;
}

export async function parsearExcelConsumoExtra(
  file: File
): Promise<NuevoConsumoExtra[]> {
  const xlsxBuffer = await file.arrayBuffer();
  const workbook = read(xlsxBuffer, {});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);

  const consumos = data.map((row: any) => ({
    descripcion: row["nombre"].toString().trim() || "",
    codigo: row["codigo"].toString().padStart(2, "0") || "",
  }));

  return consumos;
}

export async function parsearExcelConsumoExtraAplicar(
  file: File
): Promise<NuevoConsumoExtraAAplicar[]> {
  const xlsxBuffer = await file.arrayBuffer();
  const workbook = read(xlsxBuffer, {});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);

  const consumos = data.map((row: any) => ({
    legajo: row["LEGAJO"].toString().trim() || "",
    codigo: row["CODIGO"].toString().padStart(2, "0") || "",
    monto: numberToTwoDecimal(row["MONTO"]) || 0,
  }));

  return consumos;
}
