"use client";

import { obtenerFacturasMensualesPorContrato } from '@/lib/services/factura.service';
import { FacturaMensual } from '@/lib/types/facturas';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// import { obtenerFacturasPorContrato } from '@/lib/services/factura.service';
// import { Factura } from '@/lib/types';

export default function FacturasPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [facturas, setFacturas] = useState<FacturaMensual[]>([]);
  console.log("🚀 ~ FacturasPage ~ facturas:", facturas);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contractId) {
      const fetchFacturas = async () => {
        setLoading(true);
        try {
          const response = await obtenerFacturasMensualesPorContrato(contractId);
          setFacturas(response);
        } catch (error) {
          console.error("Error fetching bills:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFacturas();
    }
  }, [contractId]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">
        Facturas para el contrato: {contractId}
      </h1>
      <div className="grid grid-cols-1 gap-4">
        {facturas.map((factura) => (
          <div key={factura.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-2">
              Factura #{factura.id}
            </h2>
            <p>
              <strong>Línea:</strong> {factura.nro_linea}
            </p>
            <p>
              <strong>Nombre:</strong> {factura.nombre} {factura.apellido}
            </p>
            <p>
              <strong>Plan:</strong> {factura.plan}
            </p>
            <p>
              <strong>Monto Valor:</strong>{" "}
              {factura.monto_valor.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Servicio:</strong>{" "}
              {factura.monto_servic.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Bonificación:</strong>{" "}
              {factura.monto_bonifi.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Llamada:</strong>{" "}
              {factura.monto_llama.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Llamada Internacional:</strong>{" "}
              {factura.monto_llamcd.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Roaming:</strong>{" "}
              {factura.monto_roami.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Mensaje:</strong>{" "}
              {factura.monto_mens.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Datos:</strong>{" "}
              {factura.monto_datos.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Otros:</strong>{" "}
              {factura.monto_otros.toLocaleString("es")}
            </p>
            <p>
              <strong>Monto Total:</strong>{" "}
              {factura.monto_total.toLocaleString("es")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
