import {
  addYears,
  differenceInMonths,
  endOfMonth,
  startOfMonth,
} from "date-fns";

export type EstadoContrato = "Activo" | "Renovar" | "Vencido" | "Pago Manual";

/** Convierte ddmmyyyy → Date local (sin ambigüedad de timezone). */
export function parseFechaDdmmyyyy(fechaStr: string): Date {
  const padded = (fechaStr || "").trim().padStart(8, "0");
  if (padded.length !== 8 || !/^\d{8}$/.test(padded)) {
    throw new Error("Formato de fecha inválido. Debe ser ddmmyyyy");
  }

  const dia = parseInt(padded.substring(0, 2), 10);
  const mes = parseInt(padded.substring(2, 4), 10);
  const anio = parseInt(padded.substring(4, 8), 10);

  if (
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12 ||
    anio < 1900 ||
    anio > 2100
  ) {
    throw new Error("Fecha inválida");
  }

  const date = new Date(anio, mes - 1, dia);
  if (
    date.getFullYear() !== anio ||
    date.getMonth() !== mes - 1 ||
    date.getDate() !== dia
  ) {
    throw new Error("Fecha inválida");
  }

  return date;
}

/** ddmmyyyy → YYYY-MM-DD (para inputs/storage sin hora). */
export function formatearFechaInicial(fecha: string): string {
  try {
    const date = parseFechaDdmmyyyy(fecha);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return "";
  }
}

/** ISO/date string → dd/mm/yyyy usando componentes UTC si viene en medianoche UTC. */
export function formatearFechaParaMostrar(fecha: string): string {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return "";

  // Si es fecha "date-only" o medianoche UTC, preferir UTC para no restar un día.
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0;

  const dia = isUtcMidnight ? date.getUTCDate() : date.getDate();
  const mes = (isUtcMidnight ? date.getUTCMonth() : date.getMonth()) + 1;
  const anio = isUtcMidnight ? date.getUTCFullYear() : date.getFullYear();

  return `${dia.toString().padStart(2, "0")}/${mes
    .toString()
    .padStart(2, "0")}/${anio}`;
}

/** Contrato: exactamente 1 año desde la fecha de inicio. */
export function calcularFechaFinContrato(fechaInicio: string | Date): Date {
  const inicio =
    typeof fechaInicio === "string" ? parseDateSafe(fechaInicio) : fechaInicio;
  return addYears(inicio, 1);
}

export function calcularFechaFinContratoISO(fechaInicio: string | Date): string {
  return calcularFechaFinContrato(fechaInicio).toISOString();
}

/**
 * Cuota 1–12 según meses calendario desde el inicio.
 * 0 = aún no empezó o ya venció (>= 12 meses).
 */
export function determinarCuota(
  fechaInicio: string,
  fechaFinal?: string,
  referencia: Date = new Date()
): number {
  if (!fechaInicio) return 0;
  // Sin fecha_final (jubilado/admin/etc.) no aplica cuota 1–12
  if (!fechaFinal) return 0;

  const inicio = startOfMonth(parseDateSafe(fechaInicio));
  const ref = startOfMonth(referencia);
  const fin = parseDateSafe(fechaFinal);
  const diff = differenceInMonths(ref, inicio);

  if (diff < 0 || diff >= 12) return 0;
  if (ref > endOfMonth(fin) || ref < inicio) return 0;

  return diff + 1;
}

/**
 * Cuota para liquidación/export: usa solo fecha de inicio (contratos activos).
 * No exige fecha_final porque el TXT/Excel ya filtran tipo === "activo".
 */
export function calcularCuotaActual(
  fechaInicio: string,
  referencia: Date = new Date()
): number {
  if (!fechaInicio) return 0;
  const inicio = startOfMonth(parseDateSafe(fechaInicio));
  const ref = startOfMonth(referencia);
  const diff = differenceInMonths(ref, inicio);
  if (diff < 0 || diff >= 12) return 0;
  return diff + 1;
}

export function determinarEstadoContrato(
  fechaInicio: string,
  fechaFinal?: string,
  referencia: Date = new Date()
): EstadoContrato {
  if (!fechaFinal) return "Pago Manual";

  const fin = parseDateSafe(fechaFinal);
  if (referencia > fin) return "Vencido";

  const cuota = determinarCuota(fechaInicio, fechaFinal, referencia);
  if (cuota === 0) return "Vencido";
  if (cuota > 10) return "Renovar";
  return "Activo";
}

/** Normaliza cualquier Date al día 1 del mes en UTC (estable para bills_mensuales.fecha). */
export function mesFacturacionISO(fecha: Date): string {
  return new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), 1)
  ).toISOString();
}

export function mesFacturacionDate(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/** Parsea YYYY-MM-DD o ISO evitando el bug de meses 10-12 con strings sin pad. */
export function parseDateSafe(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Fecha inválida: ${value}`);
  }
  return date;
}
