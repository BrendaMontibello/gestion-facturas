"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { FacturaCompleta } from "@/lib/types/facturas";
import { formatearMonto } from "@/lib/utils";

export function FacturasDetalleTable({
  factura,
}: Readonly<{ factura: FacturaCompleta }>) {
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
                  <TableCell>{formatearMonto(factura.monto_valor)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_servic)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_bonifi)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_llama)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_llamcd)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_roami)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_mens)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_datos)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_otros)}</TableCell>
                  <TableCell>{formatearMonto(factura.monto_total)}</TableCell>
                  <TableCell>{formatearMonto(factura.impuestos)}</TableCell>
                  <TableCell>{formatearMonto(factura.gestion_de)}</TableCell>
                  <TableCell className="font-bold">
                    {formatearMonto(factura.total)}
                  </TableCell>
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
                  <TableCell>{formatearMonto(extra.monto)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
