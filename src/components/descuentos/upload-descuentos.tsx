"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { procesarArchivoDescuentos } from '@/lib/csv-parser';
import { crearDescuentos } from '@/lib/services/descuentos.service';
import { FileUpload } from '../ui/file-upload';



export function UploadDescuentos() {
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
      const descuentos = await procesarArchivoDescuentos(file);
      const descuentosCreados = await crearDescuentos(descuentos);
      toast({
        title: "Éxito",
        description: `Se han cargado ${descuentosCreados.length} descuentos`,
      });
      router.refresh();
    } catch (error) {
      console.error('Error uploading discounts:', error);
      toast({
        title: "Error",
        description: "Hubo un error al cargar los descuentos",
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