import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  calcularFechaFinContratoISO as calcularFechaFinContrato,
  determinarCuota,
  determinarEstadoContrato,
  formatearFechaInicial,
} from "./date";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearCuil(cuil: string): string {
  const primero = cuil.slice(0, 2);
  const dni = cuil.slice(2, 9);
  const ultimo = cuil.slice(9);
  return `${primero}-${dni}-${ultimo}`;
}

export function formatearFecha(fecha: string): string {
  // Acepta dd/mm/yyyy → yyyy-mm-dd
  const [dia, mes, anio] = fecha.split("/");
  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    trailingZeroDisplay: "auto",
    currencyDisplay: "narrowSymbol",
  }).format(monto);
}

export function numbersToEnglish(number: string | number): number {
  // Replace the dot with an empty string and the comma with a dot
  const normalizedNumber = number
    ?.toString()
    .replace(/\./g, "")
    .replace(",", ".");
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
