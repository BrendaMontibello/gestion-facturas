import { read, utils } from "xlsx";

import { formatearFechaInicial } from "./date";
import {
  assertExcelHeaders,
  CONSUMOS_APLICAR_EXCEL_HEADERS,
  CONSUMOS_EXCEL_HEADERS,
  consumoExtraAplicarExcelSchema,
  consumoExtraExcelSchema,
  facturaExcelSchema,
  usuarioExcelSchema,
} from "./excel-schemas";
import { FacturaCsv } from "./types/csv";
import { NuevoConsumoExtra, NuevoConsumoExtraAAplicar } from "./types/consumos";
import { NuevoUsuario, UserType } from "./types/users";
import { numberToTwoDecimal } from "./utils";

async function sheetRows(file: File): Promise<Record<string, unknown>[]> {
  const xlsxBuffer = await file.arrayBuffer();
  const workbook = read(xlsxBuffer, {});
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return utils.sheet_to_json<Record<string, unknown>>(sheet);
}

export async function parsearUsuariosExcel(
  file: File
): Promise<NuevoUsuario[]> {
  const data = await sheetRows(file);
  if (data.length === 0) {
    throw new Error("El archivo de usuarios está vacío.");
  }

  assertExcelHeaders(data[0], ["Legajo", "Nombre", "Apellido"], "usuarios");

  return data.map((raw, index) => {
    const parsed = usuarioExcelSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Fila ${index + 2} de usuarios inválida: ${parsed.error.issues[0]?.message}`
      );
    }

    const row = parsed.data;
    return {
      legajo: row["Legajo"]?.toString().toLowerCase().trim() || "",
      cuil: row["Cuil"]?.toString().toLowerCase().trim() || "",
      certificado: row["Certificado"]?.toString().toLowerCase().trim() || "",
      entidad: row["Entidad"]?.toString().toLowerCase().trim() || "",
      fecha: formatearFechaInicial(
        row["Fecha"]?.toString().trim().padStart(8, "0") || "".padStart(8, "0")
      ),
      disponible: numberToTwoDecimal(Number(row["Disponible"])) || 0,
      rem_mens: numberToTwoDecimal(Number(row["Rem mens"])) || 0,
      nombre: row["Nombre"]?.toString().toLowerCase().trim() || "",
      apellido: row["Apellido"]?.toString().toLowerCase().trim() || "",
      userType:
        (row["Estado"]?.toString().trim().toLowerCase() as UserType) ?? "other",
    };
  });
}

export async function parsearExcelFacturas(file: File): Promise<FacturaCsv[]> {
  const data = await sheetRows(file);
  if (data.length === 0) {
    throw new Error("El archivo de facturas está vacío.");
  }

  assertExcelHeaders(
    data[0],
    ["Nro Linea", "Legajo", "Monto total linea"],
    "facturas"
  );

  return data.map((raw, index) => {
    const parsed = facturaExcelSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Fila ${index + 2} de facturas inválida: ${parsed.error.issues[0]?.message}`
      );
    }

    const row = parsed.data;
    return {
      nro_linea: parseInt(String(row["Nro Linea"]), 10),
      legajo: row["Legajo"].toString().trim() || "",
      plan: row["Plan"]?.toString().trim() || "",
      monto_valor: numberToTwoDecimal(Number(row["Monto valor plan"])) || 0,
      monto_servic:
        numberToTwoDecimal(Number(row["Monto servicios adicionales"])) || 0,
      monto_bonifi:
        numberToTwoDecimal(Number(row["Monto bonificaciones"])) || 0,
      monto_llama:
        numberToTwoDecimal(Number(row["Monto llamadas locales nac"])) || 0,
      monto_llamcd:
        numberToTwoDecimal(Number(row["Monto llamdas internacionales"])) || 0,
      monto_roami: numberToTwoDecimal(Number(row["Monto roaming"])) || 0,
      monto_mens: numberToTwoDecimal(Number(row["Monto mensajes"])) || 0,
      monto_datos: numberToTwoDecimal(Number(row["Monto datos"])) || 0,
      monto_otros:
        numberToTwoDecimal(Number(row["Monto otros cargos "])) || 0,
      monto_total: numberToTwoDecimal(Number(row["Monto total linea"])) || 0,
    };
  });
}

export async function parsearExcelConsumoExtra(
  file: File
): Promise<NuevoConsumoExtra[]> {
  const data = await sheetRows(file);
  if (data.length === 0) {
    throw new Error("El archivo de consumos está vacío.");
  }

  assertExcelHeaders(data[0], [...CONSUMOS_EXCEL_HEADERS], "consumos");

  return data.map((raw, index) => {
    const parsed = consumoExtraExcelSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Fila ${index + 2} de consumos inválida: ${parsed.error.issues[0]?.message}`
      );
    }

    const row = parsed.data;
    return {
      descripcion: row["Nombre"].toString().trim() || "",
      codigo: row["Codigo"].toString().padStart(2, "0") || "",
    };
  });
}

export async function parsearExcelConsumoExtraAplicar(
  file: File
): Promise<NuevoConsumoExtraAAplicar[]> {
  const data = await sheetRows(file);
  if (data.length === 0) {
    throw new Error("El archivo de consumos a aplicar está vacío.");
  }

  assertExcelHeaders(
    data[0],
    [...CONSUMOS_APLICAR_EXCEL_HEADERS],
    "consumos a aplicar"
  );

  return data.map((raw, index) => {
    const parsed = consumoExtraAplicarExcelSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Fila ${index + 2} de consumos a aplicar inválida: ${parsed.error.issues[0]?.message}`
      );
    }

    const row = parsed.data;
    return {
      legajo: row["Legajo"].toString().trim() || "",
      codigo: row["Codigo"].toString().padStart(2, "0") || "",
      monto: numberToTwoDecimal(Number(row["Monto"])) || 0,
    };
  });
}
