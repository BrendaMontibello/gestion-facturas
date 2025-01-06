"use client";

import { format } from 'date-fns';
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
import { FacturaMensual } from '@/lib/types/facturas';

export function FacturasMensualesTable({ 
  facturasMensuales 
}: Readonly<{ 
  facturasMensuales: FacturaMensual[] 
}>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Legajo</TableHead>
          <TableHead>Ver Facturas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturasMensuales.map((facturaMensual) => (
          <TableRow key={facturaMensual.id}>
            <TableCell>{format(new Date(facturaMensual.fecha), 'dd/MM/yyyy')}</TableCell>
            <TableCell>{facturaMensual.legajo}</TableCell>
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