"use client";

import { Upload } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { UsuariosPreview } from '@/components/usuarios/usuarios-preview';
import { useToast } from '@/hooks/use-toast';
import { parsearUsuariosCSV } from '@/lib/csv-parser';
import { NuevoUsuario } from '@/lib/types/users';

export default function CargarUsuarios() {
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<NuevoUsuario[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedUsuarios = await parsearUsuariosCSV(file);
      setUsuarios(parsedUsuarios);
      toast({
        title: "Archivo procesado",
        description: `Se han encontrado ${parsedUsuarios.length} usuarios para cargar.`,
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast({
        title: "Error",
        description:
          "Hubo un error al procesar el archivo. Verifique el formato.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setUsuarios([]);
    toast({
      title: "Éxito",
      description: "Usuarios cargados correctamente.",
    });
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Cargar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUpload={handleFileUpload}
            isLoading={isLoading}
            accept=".csv"
            helpText="Formato esperado: legajo, cuil, certificado, entidad, fecha, cuota, disponible, ret mens, apellido y nombre"
            buttonText="Seleccionar archivo CSV"
            loadingText="Procesando..."
          />
          {usuarios.length > 0 && (
            <UsuariosPreview usuarios={usuarios} onConfirm={handleConfirm} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
