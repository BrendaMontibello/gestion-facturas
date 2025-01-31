import { FacturaCompleta } from "./types/facturas";
import { numberToTwoDecimal } from "./utils";

export const getFacturaSubTotal = (factura: FacturaCompleta) => {
  const subtotal = factura.bills
    .map((bill) => bill.monto_total)
    .reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(subtotal);
};

export const getFacturaExtras = (factura: FacturaCompleta) => {
  const extras =
    factura.extras?.map((extra) => extra.monto).reduce((a, b) => a + b, 0) ?? 0;
  return numberToTwoDecimal(extras);
};

export const getFacturaImpuestos = (factura: FacturaCompleta) => {
  const impuestos = factura.bills
    .map((bill) => bill.impuestos)
    .reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(impuestos);
};

export const getFacturaGestion = (factura: FacturaCompleta) => {
  const gestion = factura.bills
    .map((bill) => bill.gestion_de)
    .reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(gestion);
};

export const getFacturaExcedente = (factura: FacturaCompleta) => {
  const disponible = factura.contracts.disponible ?? 0;
  const subtotal = getFacturaSubTotal(factura);
  const extras = getFacturaExtras(factura);
  const excedente = subtotal + extras - disponible;
  return Math.max(0, numberToTwoDecimal(excedente));
};

export const getFacturaTotal = (factura: FacturaCompleta) => {
  const total = factura.bills
    .map((bill) => bill.total)
    .reduce((a, b) => a + b, 0);
  return numberToTwoDecimal(total);
};
export const getFacturaFinalTotal = (factura: FacturaCompleta) => {
  const totals = getFacturaTotal(factura);
  const extras = getFacturaExtras(factura);
  const excedente = getFacturaExcedente(factura);

  let total = totals + extras - excedente;
  if (factura.contracts.tipo !== "activo") {
    total = totals + extras;
  }

  return numberToTwoDecimal(total);
};
