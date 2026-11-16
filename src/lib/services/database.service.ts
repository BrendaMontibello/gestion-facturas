import { endOfMonth, startOfMonth } from "date-fns";
import { createClient as supabase } from "../db/client/supabase-client";

const UUID_NEVER = "00000000-0000-0000-0000-000000000000";

/**
 * Borra en orden de dependencias (hijos → padres).
 * No agrega constraints nuevas; solo evita fallos de FK al wipe.
 */
export async function deleteAllData() {
  try {
    await deleteTable("bill_extras");
    await deleteTable("bills");
    await deleteTable("bills_mensuales");
    await deleteTable("contracts");
    await deleteTable("users");
    await deleteTable("extras");
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    throw error;
  }
}

export async function deleteTable(tableName: string) {
  const strategies: Record<
    string,
    { column: string; value: string }
  > = {
    users: { column: "id", value: UUID_NEVER },
    contracts: { column: "id", value: UUID_NEVER },
    bills: { column: "id", value: UUID_NEVER },
    bills_mensuales: { column: "id", value: UUID_NEVER },
    extras: { column: "codigo", value: "" },
    bill_extras: { column: "codigo", value: "" },
  };

  const filter = strategies[tableName];
  if (!filter) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  try {
    const { error } = await supabase()
      .from(tableName)
      .delete()
      .neq(filter.column, filter.value);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting table ${tableName}:`, error);
    throw error;
  }
}

export async function deleteFacturasMensualesByMonth(month: Date) {
  try {
    const start = startOfMonth(month).toISOString();
    const end = endOfMonth(month).toISOString();

    const { error } = await supabase()
      .from("bills_mensuales")
      .delete()
      .gte("fecha", start)
      .lte("fecha", end);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting facturas mensuales for month:`, error);
    throw error;
  }
}

export async function deleteBillsByMonth(month: Date) {
  try {
    const start = startOfMonth(month).toISOString();
    const end = endOfMonth(month).toISOString();

    const { data: billMensuales } = await supabase()
      .from("bills_mensuales")
      .select("id")
      .gte("fecha", start)
      .lte("fecha", end);

    const ids = billMensuales?.map((billMensual) => billMensual.id) || [];
    if (ids.length === 0) return true;

    const { error } = await supabase()
      .from("bills")
      .delete()
      .in("factura_mensual_id", ids);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting bills for month:`, error);
    throw error;
  }
}

export async function deleteBillExtrasByMonth(month: Date) {
  try {
    const start = startOfMonth(month).toISOString();
    const end = endOfMonth(month).toISOString();

    const { data: billMensuales } = await supabase()
      .from("bills_mensuales")
      .select("id")
      .gte("fecha", start)
      .lte("fecha", end);

    const ids = billMensuales?.map((billMensual) => billMensual.id) || [];
    if (ids.length === 0) return true;

    const { error } = await supabase()
      .from("bill_extras")
      .delete()
      .in("factura_id", ids);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting bill extras for month:`, error);
    throw error;
  }
}
