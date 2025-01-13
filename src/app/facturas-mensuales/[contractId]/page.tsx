import { FacturasMensualesTable } from '@/components/facturas/facturas-mensuales-table';
import { Card, CardContent } from '@/components/ui/card';
import { obtenerFacturasMensualesPorContrato } from '@/lib/services/factura.service';

export default async function FacturasMensualesPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ contractId: string }>    
}>) {
  const {contractId} = await params;
  const facturasMensuales = await obtenerFacturasMensualesPorContrato(contractId);
  return (
    <div className="container mx-auto py-6">
      {facturasMensuales.length === 0 ? <Card><CardContent><div className="text-center text-lg font-bold my-6">No hay facturas mensuales</div></CardContent></Card> : (
        <>
          <h1 className="text-2xl font-bold mb-6">Facturas Mensuales</h1>
          <FacturasMensualesTable facturasMensuales={facturasMensuales} />
        </>
      )}
    </div>
  );
} 