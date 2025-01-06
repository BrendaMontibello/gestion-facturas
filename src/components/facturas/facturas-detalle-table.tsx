"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FacturadDelMes } from '@/lib/types/facturas';

export function FacturasDetalleTable({ facturas }: { facturas: FacturadDelMes[] }) {
  return (
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
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturas.map((factura) => (
          <TableRow key={factura.id}>
            <TableCell>{factura.nro_linea}</TableCell>
            <TableCell>{factura.plan}</TableCell>
            <TableCell>${factura.monto_valor}</TableCell>
            <TableCell>${factura.monto_servic}</TableCell>
            <TableCell>${factura.monto_bonifi}</TableCell>
            <TableCell>${factura.monto_llama}</TableCell>
            <TableCell>${factura.monto_llamcd}</TableCell>
            <TableCell>${factura.monto_roami}</TableCell>
            <TableCell>${factura.monto_mens}</TableCell>
            <TableCell>${factura.monto_datos}</TableCell>
            <TableCell>${factura.monto_otros}</TableCell>
            <TableCell className="font-bold">${factura.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 