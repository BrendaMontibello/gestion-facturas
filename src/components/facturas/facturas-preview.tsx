"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "../ui/button";
import { NuevaFactura } from "@/lib/types/facturas";
import { formatearMonto } from "@/lib/utils";

interface FacturasPreviewProps {
  facturas: Record<string, NuevaFactura[]>;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function FacturasPreview({
  facturas,
  onConfirm,
  isLoading,
}: Readonly<FacturasPreviewProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const facturasPerPage = 50;

  const totalPages = Math.ceil(Object.keys(facturas).length / facturasPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const paginatedFacturas = Object.entries(facturas).slice(
    (currentPage - 1) * facturasPerPage,
    currentPage * facturasPerPage
  );

  const handleConfirm = async () => {
    onConfirm();
  };

  return (
    <div className="relative">
      <Accordion type="multiple">
        {paginatedFacturas.map(([legajo, userFacturas]) => (
          <AccordionItem key={legajo} value={legajo}>
            <AccordionTrigger>
              <h3 className="text-lg font-semibold flex items-center">
                {`${userFacturas[0].nombre} - Legajo: ${userFacturas[0].legajo} - Planes: ${userFacturas.length}`}
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Línea</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>M. Valor</TableHead>
                    <TableHead>M. Serv.</TableHead>
                    <TableHead>M. Bonif.</TableHead>
                    <TableHead>M. Llamada</TableHead>
                    <TableHead>M. Llamada Int.</TableHead>
                    <TableHead>M. Roaming</TableHead>
                    <TableHead>M. Mensaje</TableHead>
                    <TableHead>M. Datos</TableHead>
                    <TableHead>M. Otros</TableHead>
                    <TableHead>M. Total</TableHead>
                    <TableHead>Impuestos</TableHead>
                    <TableHead>Gestión</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userFacturas.map((factura) => (
                    <TableRow key={factura.legajo + factura.nro_linea}>
                      <TableCell>{factura.nro_linea}</TableCell>
                      <TableCell>{factura.plan}</TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_valor)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_servic)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_bonifi)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_llama)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_llamcd)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_roami)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_mens)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_datos)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_otros)}
                      </TableCell>
                      <TableCell>
                        {formatearMonto(factura.monto_total)}
                      </TableCell>
                      <TableCell>{formatearMonto(factura.impuestos)}</TableCell>
                      <TableCell>
                        {formatearMonto(factura.gestion_de)}
                      </TableCell>
                      <TableCell>{formatearMonto(factura.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "Cargando..." : "Confirmar carga"}
        </Button>
      </div>
    </div>
  );
}
