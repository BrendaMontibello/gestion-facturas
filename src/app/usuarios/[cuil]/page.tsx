"use client";

import { UserCog } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioForm } from '@/components/usuarios/usuarios-form';
import { useToast } from '@/hooks/use-toast';
import { obtenerUsuarioPorCuil } from '@/lib/services/usuarios.service';
import { Usuario } from '@/lib/types';

export default function EditarUsuarioPage() {
  const { cuil } = useParams<{ cuil: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const data = await obtenerUsuarioPorCuil(cuil);
        if (data) {
          setUsuario(data);
        }
      } catch (error) {
        console.log("🚀 ~ fetchUsuario ~ error:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
    fetchUsuario();
  }, [cuil, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p>Usuario no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Editar Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioForm usuario={usuario} />
        </CardContent>
      </Card>
    </div>
  );
}
