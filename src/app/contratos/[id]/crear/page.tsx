import { obtenerUsuarioPorId } from '@/lib/services/usuarios.service';
import { UsuarioInfo } from '@/components/usuarios/usuario-info';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrearContratoForm } from '@/components/contratos/crear-contrato-form';

export default async function CrearContratoPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ id: string }> 
}>) {
  const { id } = await params;
  const usuario = await obtenerUsuarioPorId(id);

  if (!usuario) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Contrato</h1>
      <div className="space-y-6">
        <UsuarioInfo usuario={usuario} />
        <Card>
          <CardHeader>
            <CardTitle>Datos del Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <CrearContratoForm usuario={usuario} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 