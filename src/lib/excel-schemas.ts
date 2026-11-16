import { z } from "zod";

const numericCell = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}, z.number());

export const usuarioExcelSchema = z.object({
  Legajo: z.union([z.string(), z.number()]),
  Cuil: z.union([z.string(), z.number()]).optional().nullable(),
  Certificado: z.union([z.string(), z.number()]).optional().nullable(),
  Entidad: z.union([z.string(), z.number()]).optional().nullable(),
  Fecha: z.union([z.string(), z.number()]).optional().nullable(),
  Disponible: z.union([z.string(), z.number()]).optional().nullable(),
  "Rem mens": z.union([z.string(), z.number()]).optional().nullable(),
  Nombre: z.union([z.string(), z.number()]).optional().nullable(),
  Apellido: z.union([z.string(), z.number()]).optional().nullable(),
  Estado: z.union([z.string(), z.number()]).optional().nullable(),
});

export const facturaExcelSchema = z.object({
  "Nro Linea": z.union([z.string(), z.number()]),
  Legajo: z.union([z.string(), z.number()]),
  Usuario: z.union([z.string(), z.number()]).optional().nullable(),
  Plan: z.union([z.string(), z.number()]).optional().nullable(),
  "Monto valor plan": numericCell.optional(),
  "Monto servicios adicionales": numericCell.optional(),
  "Monto bonificaciones": numericCell.optional(),
  "Monto llamadas locales nac": numericCell.optional(),
  "Monto llamdas internacionales": numericCell.optional(),
  "Monto roaming": numericCell.optional(),
  "Monto mensajes": numericCell.optional(),
  "Monto datos": numericCell.optional(),
  "Monto otros cargos ": numericCell.optional(),
  "Monto total linea": numericCell.optional(),
});

export const consumoExtraExcelSchema = z.object({
  Nombre: z.union([z.string(), z.number()]),
  Codigo: z.union([z.string(), z.number()]),
});

export const consumoExtraAplicarExcelSchema = z.object({
  Legajo: z.union([z.string(), z.number()]),
  Codigo: z.union([z.string(), z.number()]),
  Monto: numericCell,
});

export const USUARIOS_EXCEL_HEADERS = [
  "Legajo",
  "Cuil",
  "Certificado",
  "Entidad",
  "Fecha",
  "Disponible",
  "Rem mens",
  "Nombre",
  "Apellido",
  "Estado",
] as const;

export const FACTURAS_EXCEL_HEADERS = [
  "Nro Linea",
  "Usuario",
  "Legajo",
  "Plan",
  "Monto valor plan",
  "Monto servicios adicionales",
  "Monto bonificaciones",
  "Monto llamadas locales nac",
  "Monto llamdas internacionales",
  "Monto roaming",
  "Monto mensajes",
  "Monto datos",
  "Monto otros cargos ",
  "Monto total linea",
] as const;

export const CONSUMOS_EXCEL_HEADERS = ["Codigo", "Nombre"] as const;

export const CONSUMOS_APLICAR_EXCEL_HEADERS = [
  "Legajo",
  "Codigo",
  "Monto",
] as const;

export function assertExcelHeaders(
  row: Record<string, unknown>,
  required: readonly string[],
  tipo: string
) {
  const missing = required.filter((header) => !(header in row));
  if (missing.length > 0) {
    throw new Error(
      `El archivo de ${tipo} no tiene las columnas esperadas: ${missing.join(", ")}`
    );
  }
}
