import { ClassValue, clsx } from "clsx";
import { differenceInMonths, isAfter } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calcularFechaFinContrato(fechaInicio: Date): string {
  fechaInicio.setFullYear(fechaInicio.getFullYear() + 1);
  return fechaInicio.toISOString().split("T")[0];
}

export function determinarCuota(fechaFinal?: string): number {
  if (!fechaFinal) return 0;
  if (isAfter(new Date(), new Date(fechaFinal))) return 0;
  const fechaFinalDate = new Date(fechaFinal);
  const cuota = 12 - differenceInMonths(fechaFinalDate, new Date());
  return cuota > 12 ? 0 : cuota;
}

export function determinarEstadoContrato(
  fechaFinal: string | undefined
): "Activo" | "Renovar" | "Vencido" | "Pago Manual" {
  if (!fechaFinal) return "Pago Manual";

  if (isAfter(new Date(), new Date(fechaFinal))) return "Vencido";
  const mesesHastaFinal = determinarCuota(fechaFinal);

  if (mesesHastaFinal > 10) return "Renovar";
  return "Activo";
}

export function formatearFechaInicial(fecha: string): string {
  const dia = fecha.slice(0, 2);
  const mes = fecha.slice(2, 4);
  const año = fecha.slice(4, 8);
  return `${mes}/${dia}/${año}`;
}

export function formatearCuil(fecha: string): string {
  const primero = fecha.slice(0, 2);
  const dni = fecha.slice(2, 9);
  const ultimo = fecha.slice(9);
  return `${primero}-${dni}-${ultimo}`;
}

export function formatearFecha(fecha: string): string {
  const [dia, mes, año] = fecha.split("/");
  return `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "decimal",
    currency: "ARS",
  }).format(monto);
}

export function numbersToEnglish(number: string): number {
  // Replace the dot with an empty string and the comma with a dot
  const normalizedNumber = number?.replace(/\./g, "").replace(",", ".");
  const parsedNumber = normalizedNumber ? parseFloat(normalizedNumber) : 0;
  return numberToTwoDecimal(parsedNumber);
}

export function numberToTwoDecimal(number?: number): number {
  return number ? Math.round(number * 100) / 100 : 0;
}

export function capitalize(value: string): string {
  return value
    ?.toLowerCase()
    .replace(/(^\w)|(\s+\w)/g, (letter) => letter.toUpperCase());
}
