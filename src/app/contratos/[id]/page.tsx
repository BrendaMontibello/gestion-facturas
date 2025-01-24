import { Plus } from 'lucide-react';
import Link from 'next/link';
import { obtenerContratosPorUserId } from '@/lib/services/contrato.service';
import { UsuarioInfo } from '@/components/usuarios/usuario-info';
import { ContratosTable } from '@/components/contratos/contratos-table';
import { Button } from '@/components/ui/button';

export default async function ContratosPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
    const {id} = await params;
  const { user, contracts } = await obtenerContratosPorUserId(id);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos del Usuario</h1>
        <Link href={`/contratos/${id}/crear`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>
      <UsuarioInfo usuario={user} />
      <ContratosTable contratos={contracts} />
    </div>
  );
} 