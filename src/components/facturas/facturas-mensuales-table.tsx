"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacturaCompleta } from "@/lib/types/facturas";
import { calcularCuotaActual, formatearFechaParaMostrar } from "@/lib/date";
import { formatearMonto } from "@/lib/utils";
import {
  getFacturaExtras,
  getFacturaGestion,
  getFacturaImpuestos,
  getFacturaSubTotal,
} from "@/lib/factura-utils";

export function FacturasMensualesTable({
  facturasMensuales,
}: Readonly<{
  facturasMensuales: FacturaCompleta[];
}>) {
  if (facturasMensuales.length === 0)
    return <div>No hay facturas mensuales</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Cuota</TableHead>
          <TableHead>Disponible</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Impuestos</TableHead>
          <TableHead>Gestión de Servicio</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead>Consumos Extras</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Ver Facturas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturasMensuales.map((facturaMensual) => (
          <TableRow key={facturaMensual.id}>
            <TableCell>
              {formatearFechaParaMostrar(facturaMensual.fecha)}
            </TableCell>
            <TableCell>
              {facturaMensual.contracts.tipo === "activo"
                ? calcularCuotaActual(facturaMensual.contracts.fecha_inicio)
                : ""}
            </TableCell>
            <TableCell>
              {facturaMensual.contracts.disponible
                ? formatearMonto(facturaMensual.contracts.disponible)
                : ""}
            </TableCell>
            <TableCell>
              {formatearMonto(getFacturaSubTotal(facturaMensual))}
            </TableCell>
            <TableCell>
              {formatearMonto(getFacturaImpuestos(facturaMensual))}
            </TableCell>
            <TableCell>
              {formatearMonto(getFacturaGestion(facturaMensual))}
            </TableCell>
            <TableCell>
              {formatearMonto(
                getFacturaSubTotal(facturaMensual) +
                  getFacturaGestion(facturaMensual) +
                  getFacturaImpuestos(facturaMensual)
              )}
            </TableCell>
            <TableCell>
              {formatearMonto(getFacturaExtras(facturaMensual))}
            </TableCell>
            <TableCell>
              {formatearMonto(
                getFacturaSubTotal(facturaMensual) +
                  getFacturaGestion(facturaMensual) +
                  getFacturaImpuestos(facturaMensual) +
                  getFacturaExtras(facturaMensual)
              )}
            </TableCell>
            <TableCell>
              <Link href={`/facturas/${facturaMensual.id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
