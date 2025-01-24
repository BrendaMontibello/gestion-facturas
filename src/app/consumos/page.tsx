/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";

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
import { ConsumoExtra } from "@/lib/types/consumos";
import { useBlockingLoading } from "@/hooks/use-blocking-loading";

export default function ConsumosPage() {
  const [extras, setExtras] = useState<ConsumoExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useBlockingLoading();

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const extras = await obtenerConsumoExtra();
        setExtras(extras);
        setLoading(false);
        stopLoading();
      } catch (error) {
        console.error("Error fetching extras:", error);
        setLoading(false);
        stopLoading();
      }
    };
    startLoading();
    fetchExtras();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Consumos Extra</h1>
      <Card>
        <CardHeader>
          <CardTitle>Consumos Extra Disponibles</CardTitle>
          <CardDescription>
            Gestiona los tipos de consumos extra disponibles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadConsumos />
          <div className="mb-8 w-full">
            {loading ? null : <ConsumoExtraTable extrasIniciales={extras} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
