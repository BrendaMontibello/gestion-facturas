"use client";

import { Receipt } from "lucide-react";
import { useEffect, useState } from "react";

import { FacturasTable } from "@/components/facturas/facturas-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { obtenerFacturasDelMes } from "@/lib/services/factura.service";
import { FacturaCompleta } from "@/lib/types/facturas";
import { determinarEstadoContrato } from "../../lib/date";
import { formatearMonto } from "@/lib/utils";

export default function FacturasPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [facturas, setFacturas] = useState<FacturaCompleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        const response = await obtenerFacturasDelMes(month, year);
        setFacturas(
          response.toSorted((a, b) =>
            a.contracts.users.legajo
              .padStart(8, "0")
              .localeCompare(b.contracts.users.legajo.padStart(8, "0"))
          )
        );
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [month, year]);

  const totalSum = facturas.reduce(
    (sum, factura) =>
      sum + factura.bills.reduce((sum, bill) => sum + bill.total, 0),
    0
  );
  const totalExtras = facturas.reduce(
    (sum, factura) =>
      sum + (factura.extras?.reduce((sum, extra) => sum + extra.monto, 0) ?? 0),
    0
  );
  const totalConExtras = totalSum + totalExtras;

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <MonthYearPicker
              onChange={(selectedMonth, selectedYear) => {
                setMonth(selectedMonth);
                setYear(selectedYear);
              }}
            />
            <div className="mb-4">
              <h2 className="text-xl font-bold">Resumen del Mes</h2>
              <p>Total de Facturas: {facturas.length}</p>
              <p>
                Total de Facturas Activos:{" "}
                {
                  facturas.filter(
                    (factura) =>
                      determinarEstadoContrato(
                        factura.contracts.fecha_inicio
                      ) === "Activo"
                  ).length
                }
              </p>
              <p>Gran Total: {formatearMonto(totalSum)}</p>
              <p>Total de Extras: {formatearMonto(totalExtras)}</p>
              <p>Total con Extras: {formatearMonto(totalConExtras)}</p>
            </div>
          </div>
          <FacturasTable
            facturas={facturas}
            loading={loading}
            month={month}
            year={year}
          />
        </CardContent>
      </Card>
    </div>
  );
}
