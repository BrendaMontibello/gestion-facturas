import { FacturasDetalleTable } from "@/components/facturas/facturas-detalle-table";
import { obtenerFacturasPorFacturaMensualId } from "@/lib/services/factura.service";
import { formatearFechaParaMostrar } from "@/lib/date";
import { formatearMonto } from "@/lib/utils";

export default async function FacturasPage({
  params,
}: Readonly<{
  params: Promise<{ facturaMensualId: string }>;
}>) {
  const { facturaMensualId } = await params;
  const factura = await obtenerFacturasPorFacturaMensualId(facturaMensualId);
  const total =
    factura.bills.reduce((acc, bill) => acc + bill.total, 0) +
    (factura.extras?.reduce((acc, extra) => acc + extra.monto, 0) ?? 0);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:justify-between gap-1 mb-6">
        <h1 className="text-lg md:text-2xl font-bold ">Detalle de Facturas</h1>
        <h2 className="text-lg md:text-2xl font-bold ">
          {formatearFechaParaMostrar(factura.fecha)}
        </h2>
        <h2 className="text-lg md:text-2xl font-bold ">
          Total: {formatearMonto(total)}
        </h2>
      </div>
      <FacturasDetalleTable factura={factura} />
    </div>
  );
}
