"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { procesarArchivoConsumoExtra } from '@/lib/csv-parser';
import { FileUpload } from '../ui/file-upload';
import { crearConsumosExtra } from '@/lib/services/consumos.service';



export function UploadConsumos() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload =  async (file: File)  => {

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo CSV",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const extras = await procesarArchivoConsumoExtra(file);
      const extrasCreados = await crearConsumosExtra(extras);
      toast({
        title: "Éxito",
        description: `Se han cargado ${extrasCreados.length} consumos extras`,
      });
      router.refresh();
    } catch (error) {
      console.error('Error uploading extras:', error);
      toast({
        title: "Error",
        description: "Hubo un error al cargar los extras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
        <FileUpload
            onUpload={handleFileUpload}
            isLoading={isLoading}
            accept=".csv"
            helpText="Formato esperado: codigo, nombre"
            buttonText="Seleccionar archivo CSV"
            loadingText="Procesando..."
          />
        );
} 