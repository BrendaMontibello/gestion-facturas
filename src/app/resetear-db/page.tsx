"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteAllData, deleteTable } from "@/lib/services/database.service";

export default function ResetDatabasePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      await deleteTable(tableName);
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
      <Button
        onClick={handleDeleteAll}
        disabled={loading}
        className="mb-4 bg-red-500 hover:bg-red-600"
      >
        {loading ? "Eliminando..." : "Eliminar Toda la Base de Datos"}
      </Button>
      <div className="flex flex-row flex-wrap gap-2">
        {tables.map((table) => (
          <Button
            key={table.name}
            onClick={() => handleDeleteTable(table.name)}
            disabled={loading}
            className="mb-4"
          >
            {loading ? "Eliminando..." : `Eliminar Tabla de ${table.label}`}
          </Button>
        ))}
      </div>
    </div>
  );
}
