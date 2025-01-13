import { UserCog } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioForm } from '@/components/usuarios/usuarios-form';
import { obtenerUsuarioPorId } from '@/lib/services/usuarios.service';


export default async function EditarUsuarioPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  const usuario = await obtenerUsuarioPorId(id);

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
