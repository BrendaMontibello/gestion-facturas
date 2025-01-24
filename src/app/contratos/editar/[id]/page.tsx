import { obtenerContratoPorId } from '@/lib/services/contrato.service';

import { UsuarioInfo } from '@/components/usuarios/usuario-info';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContratoForm } from '@/components/contratos/contrato-form';

export default async function EditarContratoPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ id: string }> 
}>) {
  const { id } = await params;
  const contrato = await obtenerContratoPorId(id);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Contrato</h1>
      <div className="space-y-6">
        <UsuarioInfo usuario={contrato.user} />
        <Card>
          <CardHeader>
            <CardTitle>Datos del Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <ContratoForm contrato={contrato} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 