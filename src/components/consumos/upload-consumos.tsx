"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "../ui/file-upload";
import { crearConsumosExtra } from "@/lib/services/consumos.service";
import { parsearExcelConsumoExtra } from "@/lib/excel-parser";

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
        description: "Hubo un error al cargar los extras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <FileUpload
      onUpload={handleFileUpload}
      isLoading={isLoading}
      accept=".xlsx, .xls"
      helpText="Formato esperado: codigo, nombre"
      buttonText="Seleccionar archivo Excel"
      loadingText="Procesando..."
    />
  );
}
