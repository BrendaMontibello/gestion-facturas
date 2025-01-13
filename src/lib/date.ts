export function parsearFecha(fechaStr: string): string {
  // Expecting format: "ddmmyyyy"
  if (!fechaStr || fechaStr.length !== 8) {
    throw new Error("Formato de fecha inválido. Debe ser ddmmyyyy");
  }

  const dia = parseInt(fechaStr.substring(0, 2), 10);
  const mes = parseInt(fechaStr.substring(2, 4), 10);
  const año = parseInt(fechaStr.substring(4, 8), 10);

  // Validate the date components
  if (
    isNaN(dia) ||
    isNaN(mes) ||
    isNaN(año) ||
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12 ||
    año < 1900 ||
    año > 2100
  ) {
    throw new Error("Fecha inválida");
  }

  // Format as YYYY-MM-DD for PostgreSQL
  return `${año}-${mes.toString().padStart(2, "0")}-${dia
    .toString()
    .padStart(2, "0")}`;
}

export function formatearFechaParaMostrar(fecha: string): string {
  const date = new Date(fecha);
  if (!fecha) return "";
  const dia = date.getDate() + 1;
  const mes = date.getMonth() + 1;
  const año = date.getFullYear();
  return `${dia.toString().padStart(2, "0")}/${mes.toString().padStart(2, "0")}/${año}`;
}

export function calcularCuotaActual(fechaInicio: string): number {
  if (!fechaInicio) return 0;
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  const diferenciaMeses =
    (hoy.getFullYear() - inicio.getFullYear()) * 12 +
    (hoy.getMonth() - inicio.getMonth());
  return (diferenciaMeses % 12) + 1;
}

export function calcularFechaFinContrato(fechaInicio: string): string {
  const inicio = new Date(fechaInicio);
  inicio.setFullYear(inicio.getFullYear() + 1);
  return inicio.toISOString().split("T")[0];
}

export function determinarEstadoContrato(
  fechaInicio: string
): "Activo" | "Renovar" | "Vencido" {
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  const finContrato = new Date(inicio);
  finContrato.setFullYear(inicio.getFullYear() + 1);

  const mesesRestantes = Math.floor(
    (finContrato.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (mesesRestantes > 2) return "Activo";
  if (mesesRestantes >= 0) return "Renovar";
  return "Vencido";
}
