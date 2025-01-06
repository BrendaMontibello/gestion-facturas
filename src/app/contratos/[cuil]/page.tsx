import { obtenerContratosPorCuil } from '@/lib/services/contrato.service';
import { UsuarioInfo } from '@/components/usuarios/usuario-info';
import { ContratosTable } from '@/components/contratos/contratos-table';

export default async function ContratosPage({ params }: Readonly<{ params: Promise<{ cuil: string }> }>) {
    const {cuil} = await params;
  const { user, contracts } = await obtenerContratosPorCuil(cuil);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Contratos del Usuario</h1>
      <UsuarioInfo usuario={user} />
      <ContratosTable contratos={contracts} />
    </div>
  );
} 