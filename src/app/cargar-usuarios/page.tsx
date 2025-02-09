"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { UsuariosPreview } from "@/components/usuarios/usuarios-preview";
import { useToast } from "@/hooks/use-toast";
import { NuevoUsuario } from "@/lib/types/users";
import { parsearUsuariosExcel } from "@/lib/excel-parser";

export default function CargarUsuarios() {
  const [isLoading, setIsLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<NuevoUsuario[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setUsuarios([]);
      setIsLoading(true);
      const parsedUsuarios = await parsearUsuariosExcel(file);
      const legajoCount = parsedUsuarios.reduce<Record<string, number>>(
        (acc, usuario) => {
          acc[usuario.legajo] = (acc[usuario.legajo] || 0) + 1;
          return acc;
        },
        {}
      );

      const duplicateLegajos = Object.keys(legajoCount).filter(
        (legajo) => legajoCount[legajo] > 1
      );

      if (duplicateLegajos.length > 0) {
        alert(
          `Los siguientes legajos están duplicados: ${duplicateLegajos.join(
            ", "
          )}`
        );
      }

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
            accept=".xlsx, .xls"
            helpText="Formato esperado: Legajo, Cuil, Certificado, Entidad, Fecha, Cuota, Disponible, Rem mens, Apellido y Nombre"
            buttonText="Seleccionar archivo Excel"
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
