"use client";

import { useState } from "react";
import { startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  deleteAllData,
  deleteBillExtrasByMonth,
  deleteBillsByMonth,
  deleteFacturasMensualesByMonth,
  deleteTable,
} from "@/lib/services/database.service";

type PendingAction =
  | { type: "all" }
  | { type: "table"; tableName: string; label: string };

export default function ResetDatabasePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const tables = [
    { name: "users", label: "Usuarios" },
    { name: "contracts", label: "Contratos" },
    { name: "bills_mensuales", label: "Facturas Mensuales" },
    { name: "bills", label: "Líneas de Facturas" },
    { name: "bill_extras", label: "Extras de Facturas" },
    { name: "extras", label: "Catálogo de Extras" },
  ];

  const requiresTypedConfirm =
    pending?.type === "all" ||
    (pending?.type === "table" &&
      ["users", "contracts", "extras"].includes(pending.tableName));

  const canConfirm = requiresTypedConfirm
    ? confirmText.trim().toUpperCase() === "ELIMINAR"
    : Boolean(pending);

  const runDelete = async () => {
    if (!pending) return;
    setLoading(true);
    try {
      if (pending.type === "all") {
        await deleteAllData();
        toast({
          title: "Éxito",
          description: "Todos los datos han sido eliminados.",
        });
      } else if (["bills", "bills_mensuales", "bill_extras"].includes(pending.tableName)) {
        if (pending.tableName === "bills") {
          await deleteBillsByMonth(selectedMonth);
        } else if (pending.tableName === "bills_mensuales") {
          await deleteFacturasMensualesByMonth(selectedMonth);
        } else {
          await deleteBillExtrasByMonth(selectedMonth);
        }
        toast({
          title: "Éxito",
          description: `${pending.label} del mes seleccionado eliminados.`,
        });
      } else {
        await deleteTable(pending.tableName);
        toast({
          title: "Éxito",
          description: `La tabla ${pending.label} ha sido eliminada.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Hubo un error al eliminar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPending(null);
      setConfirmText("");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Administrar Datos</h1>
      <p className="text-muted-foreground mb-6">
        Separá el borrado por mes (facturas/extras) del borrado de
        usuarios/contratos. Las acciones destructivas piden confirmación.
      </p>

      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-2 h-auto">
          {tables.map((table) => (
            <TabsTrigger key={table.name} value={table.name}>
              {table.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="todos">Toda la base</TabsTrigger>
        </TabsList>

        {tables.map((table) => (
          <TabsContent key={table.name} value={table.name} className="space-y-4">
            {["bills_mensuales", "bills", "bill_extras"].includes(table.name) ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Elimina solo los datos de facturación del mes elegido. No borra
                  usuarios ni contratos.
                </p>
                <MonthYearPicker
                  onChange={(month, year) =>
                    setSelectedMonth(new Date(year, month - 1, 1))
                  }
                />
                <Button
                  onClick={() =>
                    setPending({
                      type: "table",
                      tableName: table.name,
                      label: table.label,
                    })
                  }
                  disabled={loading}
                  variant="destructive"
                >
                  Eliminar {table.label} del mes
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Esta acción borra toda la tabla {table.label}. Para confirmar
                  deberás escribir ELIMINAR.
                </p>
                <Button
                  onClick={() =>
                    setPending({
                      type: "table",
                      tableName: table.name,
                      label: table.label,
                    })
                  }
                  disabled={loading}
                  variant="destructive"
                >
                  Eliminar tabla de {table.label}
                </Button>
              </>
            )}
          </TabsContent>
        ))}

        <TabsContent value="todos" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Borra usuarios, contratos, facturas y extras. Irreversible.
          </p>
          <Button
            onClick={() => setPending({ type: "all" })}
            disabled={loading}
            variant="destructive"
          >
            Eliminar toda la base de datos
          </Button>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) {
            setPending(null);
            setConfirmText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.type === "all"
                ? "Se eliminarán todos los datos del sistema."
                : `Se eliminará: ${pending?.label}.`}
              {requiresTypedConfirm
                ? ' Escribí ELIMINAR para confirmar.'
                : " Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {requiresTypedConfirm && (
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Confirmación</Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                autoComplete="off"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canConfirm || loading}
              onClick={(e) => {
                e.preventDefault();
                void runDelete();
              }}
            >
              {loading ? "Eliminando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
