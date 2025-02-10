import { endOfMonth, startOfMonth } from "date-fns";
import { createClient as supabase } from "../db/client/supabase-client";

export async function deleteAllData() {
  try {
    await deleteTable("extras");
    await deleteTable("bill_extras");
    await deleteTable("bills");
    await deleteTable("bills_mensuales");
    await deleteTable("contracts");
    await deleteTable("users");
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    throw error;
  }
}

export async function deleteTable(tableName: string) {
  const filter = {
    users: "legajo",
    bills: "nro_linea",
    bills_mensuales: "fecha",
    contracts: "entidad",
    extras: "codigo",
    bill_extras: "codigo",
  }[tableName];

  if (!filter) {
    console.error(`Invalid table name: ${tableName}`);
    throw new Error(`Invalid table name: ${tableName}`);
  }

  try {
    const isUuidColumn = tableName === "bills_mensuales"; // Extend for other UUID columns as needed

    const { error } = await supabase()
      .from(tableName)
      .delete()
      .neq(filter, isUuidColumn ? new Date(1970, 0, 1).toISOString() : "");
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

    const { error } = await supabase()
      .from("bills")
      .delete()
      .in(
        "factura_mensual_id",
        billMensuales?.map((billMensual) => billMensual.id) || []
      );

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

    const { error } = await supabase()
      .from("bill_extras")
      .delete()
      .in(
        "factura_id",
        billMensuales?.map((billMensual) => billMensual.id) || []
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting bill extras for month:`, error);
    throw error;
  }
}
