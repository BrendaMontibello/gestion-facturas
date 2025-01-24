"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { FacturaCompleta } from '@/lib/types/facturas';


export function FacturasDetalleTable({ factura }: Readonly<{ factura: FacturaCompleta }>) {
  return (
    <div className="container mx-auto py-6 md:px-4 px-1">
      <Card>
        <CardContent>

      <Table>
        <TableHeader>
          <TableRow>
          <TableHead>Nro Línea</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Monto Valor</TableHead>
          <TableHead>Monto Servicio</TableHead>
          <TableHead>Bonificación</TableHead>
          <TableHead>Llamadas</TableHead>
          <TableHead>Llamadas Int.</TableHead>
          <TableHead>Roaming</TableHead>
          <TableHead>Mensajes</TableHead>
          <TableHead>Datos</TableHead>
          <TableHead>Otros</TableHead>
          <TableHead>MontoTotal</TableHead>
          <TableHead>Impuestos</TableHead>
          <TableHead>Gestión de Servicio</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {factura.bills.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell>{factura.nro_linea}</TableCell>
            <TableCell>{factura.plan}</TableCell>
            <TableCell>${factura.monto_valor.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_servic.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_bonifi.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_llama.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_llamcd.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_roami.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_mens.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_datos.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_otros.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.monto_total.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.impuestos.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell>${factura.gestion_de.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
            <TableCell className="font-bold">${factura.total.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
 <Separator className="my-6" />
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Consumos Extras</TableHead>
          <TableHead>Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {factura.extras?.map((extra) => (
          <TableRow key={extra.extras.descripcion}>
            <TableCell>{extra.extras.descripcion}</TableCell>
            <TableCell>${extra.monto.toLocaleString('es', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </CardContent>
    </Card>
    </div>
  );
} 