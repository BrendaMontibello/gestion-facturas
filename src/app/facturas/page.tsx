"use client";

import { Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FacturasFilter } from "@/components/facturas/facturas-filter";
import { FacturasTable } from "@/components/facturas/facturas-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { obtenerFacturasDelMes } from "@/lib/services/factura.service";
import { FacturaCompleta } from "@/lib/types/facturas";
import { formatearMonto } from "@/lib/utils";

const PAGE_SIZE = 50;

export default function FacturasPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [facturas, setFacturas] = useState<FacturaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [page, setPage] = useState(1);

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
        setPage(1);
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [month, year]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return facturas.filter((factura) => {
      if (tipo && factura.contracts.tipo !== tipo) return false;
      if (!term) return true;
      const { legajo, nombre, apellido } = factura.contracts.users;
      return (
        legajo.toLowerCase().includes(term) ||
        nombre.toLowerCase().includes(term) ||
        apellido.toLowerCase().includes(term)
      );
    });
  }, [facturas, search, tipo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalSum = filtered.reduce(
    (sum, factura) =>
      sum + factura.bills.reduce((billSum, bill) => billSum + bill.total, 0),
    0
  );
  const totalExtras = filtered.reduce(
    (sum, factura) =>
      sum + (factura.extras?.reduce((extraSum, extra) => extraSum + extra.monto, 0) ?? 0),
    0
  );

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
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
            <MonthYearPicker
              onChange={(selectedMonth, selectedYear) => {
                setMonth(selectedMonth);
                setYear(selectedYear);
              }}
            />
            <div>
              <h2 className="text-xl font-bold">Resumen del Mes</h2>
              <p>Total de Facturas: {filtered.length}</p>
              <p>
                Total de Facturas Activos:{" "}
                {
                  filtered.filter(
                    (factura) => factura.contracts.tipo === "activo"
                  ).length
                }
              </p>
              <p>Gran Total: {formatearMonto(totalSum)}</p>
              <p>Total de Extras: {formatearMonto(totalExtras)}</p>
              <p>Total con Extras: {formatearMonto(totalSum + totalExtras)}</p>
            </div>
          </div>

          <FacturasFilter
            search={search}
            tipo={tipo}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onTipoChange={(value) => {
              setTipo(value);
              setPage(1);
            }}
            onReset={() => {
              setSearch("");
              setTipo("");
              setPage(1);
            }}
          />

          <FacturasTable
            facturas={paginated}
            allFacturas={filtered}
            loading={loading}
            month={month}
            year={year}
            onRefresh={async () => {
              const response = await obtenerFacturasDelMes(month, year);
              setFacturas(
                response.toSorted((a, b) =>
                  a.contracts.users.legajo
                    .padStart(8, "0")
                    .localeCompare(b.contracts.users.legajo.padStart(8, "0"))
                )
              );
            }}
          />

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages} ({filtered.length} resultados)
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
