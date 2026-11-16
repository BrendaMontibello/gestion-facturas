"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { NuevaFactura } from "@/lib/types/facturas";
import { FacturaOmitida } from "@/lib/services/factura.service";
import { formatearMonto } from "@/lib/utils";
import { exportarLegajosOmitidos } from "@/lib/excel-templates";
import { cn } from "@/lib/utils";

interface FacturasPreviewProps {
  facturas: Record<string, NuevaFactura[]>;
  omitidos: FacturaOmitida[];
  listos: string[];
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function FacturasPreview({
  facturas,
  omitidos,
  listos,
  onConfirm,
  isLoading,
}: Readonly<FacturasPreviewProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const facturasPerPage = 50;

  const omitidosMap = new Map(omitidos.map((item) => [item.legajo, item]));
  const totalPages = Math.max(
    1,
    Math.ceil(Object.keys(facturas).length / facturasPerPage)
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

  const statusClass = (legajo: string) => {
    const omitido = omitidosMap.get(legajo);
    if (!omitido) return "border-l-4 border-l-green-500";
    if (omitido.reason === "sin_usuario") return "border-l-4 border-l-red-500 bg-red-50";
    if (omitido.reason === "sin_contrato")
      return "border-l-4 border-l-amber-500 bg-amber-50";
    return "border-l-4 border-l-red-500 bg-red-50";
  };

  return (
    <div className="relative mt-6">
      <Alert className="mb-4">
        Se reemplazarán las líneas de facturas del mes seleccionado. Los
        consumos extras del mes se mantienen. Listos: {listos.length}. Omitidos:{" "}
        {omitidos.length}.
      </Alert>

      {omitidos.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="destructive">{omitidos.length} legajos omitidos</Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              exportarLegajosOmitidos(
                omitidos.map((o) => ({
                  legajo: o.legajo,
                  motivo: o.motivo,
                  lineas: o.lineas,
                }))
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar omitidos
          </Button>
        </div>
      )}

      <Accordion type="multiple">
        {paginatedFacturas.map(([legajo, userFacturas]) => {
          const omitido = omitidosMap.get(legajo);
          return (
            <AccordionItem
              key={legajo}
              value={legajo}
              className={cn("px-2", statusClass(legajo))}
            >
              <AccordionTrigger>
                <h3 className="text-lg font-semibold flex flex-wrap items-center gap-2">
                  <span>
                    {`${userFacturas[0].nombre} — Legajo: ${userFacturas[0].legajo} — Planes: ${userFacturas.length}`}
                  </span>
                  {omitido ? (
                    <Badge variant="destructive">{omitido.motivo}</Badge>
                  ) : (
                    <Badge>Listo</Badge>
                  )}
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
                      <TableRow key={`${factura.legajo}-${factura.nro_linea}`}>
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
                        <TableCell>
                          {formatearMonto(factura.impuestos)}
                        </TableCell>
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
          );
        })}
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
          onClick={() => onConfirm()}
          disabled={isLoading || listos.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading
            ? "Cargando..."
            : `Confirmar carga (${listos.length} legajos)`}
        </Button>
      </div>
    </div>
  );
}
