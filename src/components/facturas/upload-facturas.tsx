"use client";

import { Download, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startOfMonth } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  FacturaOmitida,
  insertarFacturasBatch,
  obtenerFacturasConNombre,
} from "@/lib/services/factura.service";
import { numbersToEnglish, numberToTwoDecimal } from "@/lib/utils";
import { MonthYearPicker } from "../ui/month-year-picker";
import { FacturasPreview } from "./facturas-preview";
import { NuevaFactura } from "@/lib/types/facturas";
import { useBlockingLoading } from "@/hooks/use-blocking-loading";
import { parsearExcelFacturas } from "@/lib/excel-parser";
import { descargarPlantillaFacturas } from "@/lib/excel-templates";

export function UploadFacturas() {
  const [isLoading, setIsLoading] = useState(false);
  const [facturas, setFacturas] = useState<Record<string, NuevaFactura[]>>({});
  const [omitidos, setOmitidos] = useState<FacturaOmitida[]>([]);
  const [listos, setListos] = useState<string[]>([]);
  const [fecha, setFecha] = useState<Date>(startOfMonth(new Date()));
  const [impuestos, setImpuestos] = useState<string>("0");
  const [gestionDe, setGestionDe] = useState<string>("0");
  const { toast } = useToast();
  const router = useRouter();
  const { startLoading, stopLoading } = useBlockingLoading();

  const handleFileUpload = async (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo.",
        variant: "destructive",
      });
      return;
    }
    if (impuestos === "0" || gestionDe === "0") {
      toast({
        title: "Error",
        description: "Impuestos y Gestión de Servicio no pueden ser 0.",
        variant: "destructive",
      });
      return;
    }

    startLoading("Procesando archivo...");
    setIsLoading(true);
    try {
      const parsedFacturas = await parsearExcelFacturas(file);
      const facturasWithExtras = parsedFacturas.map((factura) => {
        const taxes = numberToTwoDecimal(
          factura.monto_total * (numbersToEnglish(impuestos) / 100)
        );
        const total = numberToTwoDecimal(
          factura.monto_total + taxes + numbersToEnglish(gestionDe)
        );

        return {
          ...factura,
          fecha: fecha.toISOString(),
          impuestos: taxes,
          gestion_de: numbersToEnglish(gestionDe),
          total: total,
        };
      });

      const groupedFacturas = facturasWithExtras
        .toSorted((a, b) => a.legajo.localeCompare(b.legajo))
        .reduce(
          (acc, factura) => {
            const legajo = `${factura.legajo}`;
            if (!acc[legajo]) acc[legajo] = [];
            acc[legajo].push(factura);
            return acc;
          },
          {} as Record<string, NuevaFactura[]>
        );

      const result = await obtenerFacturasConNombre(groupedFacturas, fecha);
      setFacturas(result.facturasConNombre);
      setOmitidos(result.omitidos);
      setListos(result.listos);

      toast({
        title: "Archivo procesado",
        description: `${parsedFacturas.length} líneas · ${result.listos.length} listos · ${result.omitidos.length} omitidos. Al confirmar se reemplazan las facturas del mes.`,
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al procesar el archivo. Verifique el formato.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    startLoading("Reemplazando facturas del mes...");
    setIsLoading(true);
    try {
      const { uploaded, notUploaded, omitidos: omitidosFinal } =
        await insertarFacturasBatch(facturas, fecha, listos);

      toast({
        title: "Carga finalizada",
        description: `Se cargaron ${uploaded} líneas. No cargadas: ${notUploaded}. Omitidos: ${omitidosFinal.length}.`,
      });
      setFacturas({});
      setOmitidos([]);
      setListos([]);
      router.push("/facturas");
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas.",
        variant: "destructive",
      });
    } finally {
      stopLoading();
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Cargar Facturas
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={descargarPlantillaFacturas}
          >
            <Download className="mr-2 h-4 w-4" />
            Plantilla Excel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          <MonthYearPicker
            onChange={(month, year) => {
              setFecha(new Date(year, month - 1, 1));
            }}
          />
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              <Label
                htmlFor="impuestos"
                className="text-sm font-medium text-gray-700"
              >
                Impuestos (%)
              </Label>
              <Input
                id="impuestos"
                type="text"
                placeholder="Impuestos"
                value={impuestos}
                onChange={(e) => setImpuestos(e.target.value.replace(".", ","))}
              />
            </div>
            <div className="flex flex-col">
              <Label
                htmlFor="gestionDe"
                className="text-sm font-medium text-gray-700"
              >
                Gestión de Servicio
              </Label>
              <Input
                id="gestionDe"
                type="text"
                placeholder="Gestión de Servicio"
                value={gestionDe}
                onChange={(e) => setGestionDe(e.target.value)}
              />
            </div>
          </div>
        </div>
        <FileUpload
          onUpload={handleFileUpload}
          isLoading={isLoading}
          accept=".xlsx, .xls"
          helpText="Formato esperado: Nro Linea, Usuario, Legajo, Plan, Monto... Al confirmar se reemplazan las líneas del mes."
          buttonText="Seleccionar archivo Excel"
          loadingText="Procesando..."
        />

        {Object.keys(facturas).length > 0 && (
          <FacturasPreview
            facturas={facturas}
            omitidos={omitidos}
            listos={listos}
            onConfirm={handleConfirmUpload}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
