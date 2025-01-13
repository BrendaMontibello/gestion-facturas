"use client";

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FacturaCompleta } from '@/lib/types/facturas';
import { calcularCuotaActual, formatearFechaParaMostrar } from '@/lib/date';
import { getFacturaExtras, getFacturaGestion, getFacturaImpuestos, getFacturaSubTotal } from '@/lib/services/factura.service';

export function FacturasMensualesTable({ 
  facturasMensuales 
}: Readonly<{ 
  facturasMensuales: FacturaCompleta[]
}>) {


  if (facturasMensuales.length === 0) return <div>No hay facturas mensuales</div>;

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
            <TableCell>{formatearFechaParaMostrar(facturaMensual.fecha)}</TableCell>
            <TableCell>{facturaMensual.contracts.estado === 'activo' ? calcularCuotaActual(facturaMensual.contracts.fecha_inicio) : ''}</TableCell>
            <TableCell>{facturaMensual.contracts.disponible ? facturaMensual.contracts.disponible.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'}) : ''}</TableCell>
            <TableCell>{getFacturaSubTotal(facturaMensual).toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'})}</TableCell>
            <TableCell>{getFacturaImpuestos(facturaMensual).toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'})}</TableCell>
            <TableCell>{getFacturaGestion(facturaMensual).toLocaleString('es', {currencyDisplay: 'narrowSymbol',signDisplay: 'negative', minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'})}</TableCell>
            <TableCell>{(getFacturaSubTotal(facturaMensual) + getFacturaGestion(facturaMensual) + getFacturaImpuestos(facturaMensual)).toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'})}</TableCell>
            <TableCell>{getFacturaExtras(facturaMensual).toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'ARS'})}</TableCell>
            <TableCell>{(getFacturaSubTotal(facturaMensual) + getFacturaGestion(facturaMensual) + getFacturaImpuestos(facturaMensual) + getFacturaExtras(facturaMensual)).toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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