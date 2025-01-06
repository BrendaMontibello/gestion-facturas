import { FacturasDetalleTable } from '@/components/facturas/facturas-detalle-table';
import { obtenerFacturasPorFacturaMensualId } from '@/lib/services/factura.service';

export default async function FacturasPage({ 
  params 
}: Readonly<{ 
  params: Promise<{ facturaMensualId: string }>  
}>) {
  const {facturaMensualId} = await params;
  const facturas = await obtenerFacturasPorFacturaMensualId(facturaMensualId);
  console.log("🚀 ~ facturas:", facturas)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Detalle de Facturas</h1>
      <FacturasDetalleTable facturas={facturas} />
    </div>
  );
} 