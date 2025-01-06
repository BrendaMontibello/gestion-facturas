import { DescuentosTable } from '@/components/descuentos/descuentos-table';
import { UploadDescuentos } from '@/components/descuentos/upload-descuentos';
import { obtenerDescuentos } from '@/lib/services/descuentos.service';


export default async function DescuentosPage() {
  const descuentos = await obtenerDescuentos();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Descuentos</h1>
      <div className="mb-8 w-full">
        <UploadDescuentos />
      </div>
      <DescuentosTable descuentosIniciales={descuentos} />
    </div>
  );
} 