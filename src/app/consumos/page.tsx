
import { obtenerConsumoExtra } from '@/lib/services/consumos.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadConsumos } from '@/components/consumos/upload-consumos';
import { ConsumoExtraTable } from '@/components/consumos/consumos-table';
import { UploadConsumosAplicar } from '@/components/consumos/upload-consumos-aplicar';

export default async function ConsumosPage() {
  const extras = await obtenerConsumoExtra();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Descuentos</h1>
      
      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Lista de Descuentos</TabsTrigger>
          <TabsTrigger value="aplicar">Aplicar Descuentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista">
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
        </TabsContent>
        
        <TabsContent value="aplicar">
          <Card>
            <CardHeader>
              <CardTitle>Aplicar Descuentos</CardTitle>
              <CardDescription>
                Aplica descuentos a las facturas actuales de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadConsumosAplicar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 