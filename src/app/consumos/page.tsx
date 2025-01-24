import { obtenerConsumoExtra } from "@/lib/services/consumos.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadConsumos } from "@/components/consumos/upload-consumos";
import { ConsumoExtraTable } from "@/components/consumos/consumos-table";

export default async function ConsumosPage() {
  const extras = await obtenerConsumoExtra();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Descuentos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Descuentos Disponibles</CardTitle>
          <CardDescription>
            Gestiona los tipos de descuentos disponibles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8 w-full">
            <UploadConsumos />
          </div>
          <ConsumoExtraTable extrasIniciales={extras} />
        </CardContent>
      </Card>
    </div>
  );
}
