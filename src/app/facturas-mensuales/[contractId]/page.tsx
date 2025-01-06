import { FacturasMensualesTable } from '@/components/facturas/facturas-mensuales-table';
import { obtenerFacturasMensualesPorContrato } from '@/lib/services/factura.service';

export default async function FacturasMensualesPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ contractId: string }>    
}>) {
  const {contractId} = await params;
  const facturasMensuales = await obtenerFacturasMensualesPorContrato(contractId);
  console.log("🚀 ~ facturasMensuales:", facturasMensuales)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Facturas Mensuales</h1>
      <FacturasMensualesTable facturasMensuales={facturasMensuales} />
    </div>
  );
} 