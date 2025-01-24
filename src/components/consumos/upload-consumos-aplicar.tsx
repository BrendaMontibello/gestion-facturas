"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '../ui/file-upload';
import { procesarArchivoConsumoExtraAplicar } from '@/lib/csv-parser';
import { aplicarConsumoExtraAFacturas } from '@/lib/services/consumos.service';

export function UploadConsumosAplicar() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  

  const handleFileUpload = async (file: File) => {
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
      const extras = await procesarArchivoConsumoExtraAplicar(file);
      const resultado = await aplicarConsumoExtraAFacturas(extras);

      if (resultado.errores.length > 0) {
        toast({
          title: "Advertencia",
          description: `Se aplicaron ${resultado.aplicados.length} extras, pero hubo ${resultado.errores.length} errores`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `Se aplicaron ${resultado.aplicados.length} extras correctamente`,
        });
      }

      router.refresh();
    } catch (error) {
      console.error('Error applying extras:', error);
      toast({
        title: "Error",
        description: "Hubo un error al aplicar los extras",
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
      helpText="Formato esperado: legajo, codigo, monto"
      buttonText="Seleccionar archivo de extras"
      loadingText="Aplicando extras..."
    />
  );
} 