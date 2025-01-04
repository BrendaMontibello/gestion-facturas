"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { obtenerContratosPorCuil } from '@/lib/services/contrato.service';
import { ContratoConFacturas } from '@/lib/types';
import { capitalize } from '@/lib/utils';

export default function ContratoPage() {
  const { cuil } = useParams<{ cuil: string }>();
  const [data, setData] = useState<ContratoConFacturas>();
  console.log("🚀 ~ ContratoPage ~ data:", data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cuil) {
      const fetchContratos = async () => {
        setLoading(true);
        try {
          const response = await obtenerContratosPorCuil(cuil);
          setData(response);
        } catch (error) {
          console.error("Error fetching contracts with bills:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchContratos();
    }
  }, [cuil]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Contratos de: {capitalize(data?.user.nombre ?? '')} {capitalize(data?.user.apellido ?? '')}</h1>
      <h2 className="text-xl font-bold mb-4">CUIL: {cuil}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.contracts
          .sort(
            (a, b) =>
              new Date(b.fecha_inicio).getTime() -
              new Date(a.fecha_inicio).getTime()
          )
          .map((contract) => (
            <Card
              key={contract.id}
              className={`hover:shadow-lg transition-shadow ${
                contract.estado === "vencido" ? "bg-red-400" : "bg-slate-300"
              }`}
            >
              <CardHeader>
                <CardTitle>
                  {`${new Date(
                    contract.fecha_inicio
                  ).toLocaleDateString()} - ${contract.fecha_final ? new Date(
                    contract.fecha_final
                  ).toLocaleDateString() : 'indefinido'}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Entidad: {contract.entidad}</p>
                <p>Certificado: {contract.certificado}</p>
                <p>Estado: {contract.estado}</p>
                <p>Tipo: {contract.tipo}</p>
                <Link
                  href={`/facturas/${contract.id}`}
                  className={`${contract.estado === "vencido" ? "text-white" : "text-blue-500"} hover:underline`}
                >
                  Ver Facturas
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
