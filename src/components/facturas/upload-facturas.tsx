"use client";

import { Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { parsearCSVFacturas } from '@/lib/csv-parser';
import { insertarFacturasBatch } from '@/lib/services/factura.service';
import { NuevaFactura } from '@/lib/types';
import { numbersToEnglish } from '@/lib/utils';

import { MonthYearPicker } from '../ui/month-year-picker';
import { FacturasPreview } from './facturas-preview';

export function UploadFacturas() {
  const [isLoading, setIsLoading] = useState(false);
  const [facturas, setFacturas] = useState<NuevaFactura[]>([]);
  const [fecha, setFecha] = useState<Date>(new Date());
  const [impuestos, setImpuestos] = useState<string>("0");
  const [gestionDe, setGestionDe] = useState<string>("0");
  const { toast } = useToast();
  const router = useRouter();

  const handleFileUpload = async (file: File) => {
    if (impuestos === "0" || gestionDe === "0") {
      toast({
        title: "Error",
        description: "Impuestos y Gestión de Servicio no pueden ser 0.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const parsedFacturas = await parsearCSVFacturas(file);
      const facturasWithExtras = parsedFacturas.map((factura) => {
        const taxes = parseFloat(
          (factura.monto_total * (numbersToEnglish(impuestos) / 100)).toFixed(2)
        );
        const total = factura.monto_total + taxes + numbersToEnglish(gestionDe);
        return {
          ...factura,
          fecha: fecha.toISOString(),
          impuestos: taxes,
          gestion_de: numbersToEnglish(gestionDe),
          total: total,
        };
      });
      setFacturas(facturasWithExtras);
      toast({
        title: "Archivo procesado",
        description: `Se han encontrado ${parsedFacturas.length} facturas para cargar.`,
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast({
        title: "Error",
        description:
          "Hubo un error al procesar el archivo. Verifique el formato.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    setIsLoading(true);
    try {
      const { uploaded, notUploaded } = await insertarFacturasBatch(facturas, fecha);
      toast({
        title: "Éxito",
        description: `Se han cargado ${uploaded} facturas correctamente. ${notUploaded} facturas no se pudieron cargar.`,
      });
      setFacturas([]);
      router.push("/cargar-facturas");
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          Cargar Facturas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          <MonthYearPicker
            onChange={(month, year) => {
              setFecha(new Date(year, month, 1));
            }}
          />
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              <Label
                htmlFor="impuestos"
                className="text-sm font-medium text-gray-700"
              >
                Impuestos (%)
              </Label>
              <Input
                id="impuestos"
                type="text"
                placeholder="Impuestos"
                value={impuestos}
                onChange={(e) => setImpuestos(e.target.value.replace(".", ","))}
              />
            </div>
            <div className="flex flex-col">
              <Label
                htmlFor="gestionDe"
                className="text-sm font-medium text-gray-700"
              >
                Gestión de Servicio
              </Label>
              <Input
                id="gestionDe"
                type="text"
                placeholder="Gestión de Servicio"
                value={gestionDe}
                onChange={(e) => setGestionDe(e.target.value)}
              />
            </div>
          </div>
        </div>
        <FileUpload
          onUpload={handleFileUpload}
          isLoading={isLoading}
          accept=".csv"
          helpText="Formato esperado: fecha, nro_linea, nombre, legajo, plan, montos..."
          buttonText="Seleccionar archivo CSV"
          loadingText="Procesando..."
        />

        {facturas.length > 0 && (
          <FacturasPreview
            facturas={facturas}
            onConfirm={handleConfirmUpload}
            isLoading={isLoading}
            fecha={fecha}
          />
        )}
      </CardContent>
    </Card>
  );
}
