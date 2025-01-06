import { createClient as supabase } from "../db/client/supabase-client";

export async function deleteAllData() {
  try {
    await deleteTable("users");
    await deleteTable("bills_mensuales");
    await deleteTable("bills");
    await deleteTable("contracts");
    await deleteTable("discounts");
    await deleteTable("bill_discounts");
    return true;

  } catch (error) {
    console.error("Error deleting all data:", error);
    throw error;
  }
}

export async function deleteTable(tableName: string) {
  const filter = {
    users: "legajo",
    bills: "nombre",
    bills_mensuales: "nombre",
    contracts: "entidad",
    discounts: "codigo",
    bill_discounts: "codigo",
  }[tableName];

  if (!filter) {
    console.error(`Invalid table name: ${tableName}`);
    throw new Error(`Invalid table name: ${tableName}`);
  }

  try {
    const { error } = await supabase().from(tableName).delete().neq(filter, "");
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting table ${tableName}:`, error);
    throw error;
  }
}
