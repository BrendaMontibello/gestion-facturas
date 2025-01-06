"use client";

import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    downloadBillsInCsvFile, downloadBillsInExcelFile, downloadBillsInTxtFile
} from '@/lib/services/factura.service';
import { FacturadDelMes } from '@/lib/types/facturas';
import { capitalize } from '@/lib/utils';

interface FacturasTableProps {
  facturas: FacturadDelMes[];
  loading: boolean;
  month: number;
  year: number;
}

export function FacturasTable({
  facturas,
  loading,
  month,
  year,
}: Readonly<FacturasTableProps>) {
  console.log("🚀 ~ facturas:", facturas)
  const handleDownload = (format: "excel" | "txt" | "csv") => {
    if (format === "excel") {
      downloadBillsInExcelFile(facturas, month, year);
    } else if (format === "txt") {
      downloadBillsInTxtFile(facturas, month, year);
    } else if (format === "csv") {
      downloadBillsInCsvFile(facturas, month, year);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {facturas.length > 0 && (
        <div className="flex justify-start gap-2 mb-4">
          <Button onClick={() => handleDownload("excel")} className="mb-4">
            Descargar Excel
          </Button>
          <Button onClick={() => handleDownload("csv")} className="mb-4">
            Descargar CSV
          </Button>
          <Button onClick={() => handleDownload("txt")} className="mb-4">
            Descargar TXT
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Legajo</TableHead>
            <TableHead className='text-center'>Nombre</TableHead>
            <TableHead className='text-center'>Apellido</TableHead>
            <TableHead className='text-center'>Cuota</TableHead>
            <TableHead className='text-center'>Monto Total</TableHead>
            <TableHead className='text-center'>Impuestos</TableHead>
            <TableHead className='text-center'>Gestión</TableHead>
            <TableHead className='text-center'>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((factura) => (
            <TableRow key={factura.id}>
              <TableCell className='text-center'>{factura.bills_mensuales.contracts.users.legajo}</TableCell>
              <TableCell className='text-center'>
                {capitalize(factura.bills_mensuales.contracts.users.nombre)}
              </TableCell>
              <TableCell className='text-center'>
                {capitalize(factura.bills_mensuales.contracts.users.apellido)}
              </TableCell>
              <TableCell className='text-center'>{factura.cuota}</TableCell>
              <TableCell className='text-right'>${factura.monto_total.toLocaleString("es")}</TableCell>
              <TableCell className='text-right'>${factura.impuestos.toLocaleString("es")}</TableCell>
              <TableCell className='text-right'>${factura.gestion_de.toLocaleString("es")}</TableCell>
              <TableCell className='text-right'>${factura.total.toLocaleString("es")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
