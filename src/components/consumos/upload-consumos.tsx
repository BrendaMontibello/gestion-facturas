"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "../ui/file-upload";
import { Button } from "../ui/button";
import { crearConsumosExtra } from "@/lib/services/consumos.service";
import { parsearExcelConsumoExtra } from "@/lib/excel-parser";
import { descargarPlantillaConsumos } from "@/lib/excel-templates";

export function UploadConsumos() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      const extras = await parsearExcelConsumoExtra(file);
      const extrasCreados = await crearConsumosExtra(extras);
      toast({
        title: "Éxito",
        description: `Se han cargado ${extrasCreados.length} consumos extras`,
      });
      router.refresh();
    } catch (error) {
      console.error("Error uploading extras:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al cargar los extras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={descargarPlantillaConsumos}
        >
          <Download className="mr-2 h-4 w-4" />
          Plantilla Excel
        </Button>
      </div>
      <FileUpload
        onUpload={handleFileUpload}
        isLoading={isLoading}
        accept=".xlsx, .xls"
        helpText="Formato esperado: Codigo, Nombre"
        buttonText="Seleccionar archivo Excel"
        loadingText="Procesando..."
      />
    </div>
  );
}
