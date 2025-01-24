"use client";

// import { AlertCircle } from "lucide-react";
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

interface FacturasPreviewProps {
  facturas: Record<string, NuevaFactura[]>;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  // fecha: Date;
}

export function FacturasPreview({
  facturas,
  onConfirm,
  isLoading,
  // fecha,
}: Readonly<FacturasPreviewProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const facturasPerPage = 50;

  const totalPages = Math.ceil(
    Object.keys(facturas).length / facturasPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const paginatedFacturas = Object.entries(facturas).slice(
    (currentPage - 1) * facturasPerPage,
    currentPage * facturasPerPage
  );

  // const handleUserUpload = async (
  //   nombre: string,
  //   userFacturas: NuevaFactura[]
  // ) => {
  //   setLoadingUsers((prev) => ({ ...prev, [nombre]: true }));
  //   try {
  //     await insertarFacturaUsuarioBatch(userFacturas, fecha);
  //     setErrorUsers((prev) => ({ ...prev, [nombre]: false }));
  //   } catch (error) {
  //     console.error(`Error uploading facturas for ${nombre}:`, error);
  //     setErrorUsers((prev) => ({ ...prev, [nombre]: true }));
  //   } finally {
  //     setLoadingUsers((prev) => ({ ...prev, [nombre]: false }));
  //   }
  // };

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
                {`${userFacturas[0].nombre} - ${userFacturas[0].legajo}`}
                {/* {errorUsers[nombre] && (
                  <AlertCircle className="ml-2 text-red-500" />
                )} */}
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
                    <TableRow key={factura.legajo+factura.nro_linea}>
                      <TableCell>{factura.nro_linea}</TableCell>
                      <TableCell>{factura.plan}</TableCell>
                      <TableCell>
                        ${factura.monto_valor.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_servic.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_bonifi.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_llama.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_llamcd.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_roami.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_mens.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_datos.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_otros.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                      <TableCell>
                        ${factura.monto_total.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                      <TableCell>
                        ${factura.impuestos.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                      <TableCell>
                        ${factura.gestion_de.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                      <TableCell>
                        ${factura.total.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* {errorUsers[nombre] && (
                // <Button
                //   onClick={() => handleUserUpload(nombre, userFacturas)}
                //   disabled={loadingUsers[nombre]}
                //   className="mt-2"
                // >
                //   Retry
                // </Button>
                <p className="text-red-500">Error al cargar las facturas</p>
              )} */}
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
