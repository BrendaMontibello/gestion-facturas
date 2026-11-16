"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { startOfMonth } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FacturaCompleta } from "@/lib/types/facturas";
import {
  downloadBillsInExcelFileporLegajo,
  downloadBillsInTxtFile,
} from "@/lib/services/factura.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalize, determinarCuota, formatearMonto } from "@/lib/utils";
import { aplicarConsumoExtraAFacturas } from "@/lib/services/consumos.service";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "../ui/file-upload";
import { useBlockingLoading } from "@/hooks/use-blocking-loading";
import { parsearExcelConsumoExtraAplicar } from "@/lib/excel-parser";
import { descargarPlantillaConsumosAplicar } from "@/lib/excel-templates";
import {
  getFacturaExcedente,
  getFacturaExtras,
  getFacturaFinalTotal,
  getFacturaTotal,
} from "@/lib/factura-utils";

export function FacturasTable({
  facturas,
  allFacturas,
  loading,
  month,
  year,
  onRefresh,
}: Readonly<{
  facturas: FacturaCompleta[];
  allFacturas: FacturaCompleta[];
  loading: boolean;
  month: number;
  year: number;
  onRefresh?: () => Promise<void>;
}>) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { startLoading, stopLoading } = useBlockingLoading();
  const exportSource = allFacturas.length > 0 ? allFacturas : facturas;
  const referenciaMes = new Date(year, month - 1, 1);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    startLoading("Procesando consumos...");
    setIsUploading(true);
    try {
      const extras = await parsearExcelConsumoExtraAplicar(file);
      const resultado = await aplicarConsumoExtraAFacturas(
        extras,
        startOfMonth(referenciaMes)
      );

      if (resultado.errores.length > 0) {
        toast({
          title: "Advertencia",
          description: `Se aplicaron ${resultado.aplicados.length} extras, pero hubo ${resultado.errores.length} errores. Los extras del mes fueron reemplazados.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `Se aplicaron ${resultado.aplicados.length} extras (reemplazo del mes).`,
        });
      }

      await onRefresh?.();
    } catch (error) {
      console.error("Error applying extras:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al aplicar los extras",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      stopLoading();
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <FileUpload
            onUpload={handleFileUpload}
            isLoading={isUploading}
            accept=".xlsx, .xls"
            helpText="Formato: Legajo, Codigo, Monto. Reemplaza extras del mes."
            buttonText="Cargar Consumos Extras"
            loadingText="Aplicando consumos extras..."
          />
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 justify-start"
            onClick={descargarPlantillaConsumosAplicar}
          >
            Descargar plantilla de extras
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                downloadBillsInExcelFileporLegajo(exportSource, month, year)
              }
            >
              Excel (por legajo)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => downloadBillsInTxtFile(exportSource, month, year)}
            >
              TXT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left font-semibold text-black">
              Legajo
            </TableHead>
            <TableHead className="font-semibold text-black">Nombre</TableHead>
            <TableHead className="text-center font-semibold text-black">
              Cuota
            </TableHead>
            <TableHead className="text-right font-semibold text-black">
              Disponible
            </TableHead>
            <TableHead className="text-right font-semibold text-black">
              Factura Claro
            </TableHead>
            <TableHead className="text-right font-semibold text-black">
              Extras
            </TableHead>
            <TableHead className="text-right font-semibold text-black">
              Excedente
            </TableHead>
            <TableHead className="text-right font-semibold text-black">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((factura) => (
            <TableRow key={factura.id}>
              <TableCell className="text-left">
                {factura.contracts.users.legajo}
              </TableCell>
              <TableCell>
                {capitalize(
                  `${factura.contracts.users.apellido}, ${factura.contracts.users.nombre}`
                )}
              </TableCell>
              <TableCell className="text-center">
                {factura.contracts.tipo !== "activo"
                  ? "N/A"
                  : determinarCuota(
                      factura.contracts.fecha_inicio,
                      factura.contracts.fecha_final,
                      referenciaMes
                    )}
              </TableCell>
              <TableCell className="text-right">
                {factura.contracts.tipo !== "activo"
                  ? "N/A"
                  : formatearMonto(factura.contracts.disponible ?? 0)}
              </TableCell>
              <TableCell className="text-right">
                {formatearMonto(getFacturaTotal(factura))}
              </TableCell>
              <TableCell className="text-right">
                {formatearMonto(getFacturaExtras(factura))}
              </TableCell>
              <TableCell className="text-right">
                {factura.contracts.tipo !== "activo"
                  ? "N/A"
                  : formatearMonto(getFacturaExcedente(factura))}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatearMonto(getFacturaFinalTotal(factura))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
