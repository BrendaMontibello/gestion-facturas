"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  deleteAllData,
  deleteBillExtrasByMonth,
  deleteBillsByMonth,
  deleteFacturasMensualesByMonth,
  deleteTable,
} from "@/lib/services/database.service";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { startOfMonth } from "date-fns";

export default function ResetDatabasePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date())
  );

  const tables = [
    { name: "users", label: "Usuarios" },
    { name: "contracts", label: "Contratos" },
    { name: "bills_mensuales", label: "Facturas Mensuales" },
    { name: "bills", label: "Facturas" },
    { name: "bill_extras", label: "Extras de Facturas Mensuales" },
    { name: "extras", label: "Extras" },
  ];

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await deleteAllData();
      toast({
        title: "Éxito",
        description: "Todos los datos han sido eliminados.",
      });
    } catch (error) {
      console.log("🚀 ~ handleDeleteAll ~ error:", error);
      toast({
        title: "Error",
        description: "Hubo un error al eliminar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableName: string) => {
    setLoading(true);
    try {
      if (tableName === "bills") {
        await deleteBillsByMonth(selectedMonth);
      } else if (tableName === "bills_mensuales") {
        await deleteFacturasMensualesByMonth(selectedMonth);
      } else if (tableName === "bill_extras") {
        await deleteBillExtrasByMonth(selectedMonth);
      } else {
        await deleteTable(tableName);
      }

      toast({
        title: "Éxito",
        description: `La tabla ${tableName} ha sido eliminada.`,
      });
    } catch (error) {
      console.log("🚀 ~ handleDeleteTable ~ error:", error);
      toast({
        title: "Error",
        description: `Hubo un error al eliminar la tabla ${tableName}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Administrar Base de Datos</h1>
      {/* <Button
        onClick={handleDeleteAll}
        disabled={loading}
        className="mb-4 bg-red-500 hover:bg-red-600"
      >
        {loading ? "Eliminando..." : "Eliminar Toda la Base de Datos"}
      </Button> */}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="flex w-full gap-2">
          {tables.map((table) => (
            <TabsTrigger key={table.name} value={table.name}>
              {table.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>

        {tables.map((table) => (
          <TabsContent key={table.name} value={table.name}>
            {["bills_mensuales", "bills", "bill_extras"].includes(
              table.name
            ) ? (
              <>
                <MonthYearPicker
                  onChange={(month, year) =>
                    setSelectedMonth(new Date(year, month - 1, 1))
                  }
                />
                <Button
                  onClick={() => handleDeleteTable(table.name)}
                  disabled={loading || !selectedMonth}
                  className="mt-4"
                >
                  {loading
                    ? "Eliminando..."
                    : `Eliminar ${table.label} del Mes`}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleDeleteTable(table.name)}
                disabled={loading}
                className="mt-4"
              >
                {loading ? "Eliminando..." : `Eliminar Tabla de ${table.label}`}
              </Button>
            )}
          </TabsContent>
        ))}
        <TabsContent value="todos">
          <Button onClick={handleDeleteAll} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar Toda la Base de Datos"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
