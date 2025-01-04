import { createClient as supabase } from "../db/client/supabase-client";

export async function deleteAllData() {
  try {
    const { error: userError } = await supabase()
      .from("users")
      .delete()
      .neq("legajo", "");
    const { error: billError } = await supabase()
      .from("bills")
      .delete()
      .neq("nombre", "");
    const { error: contractError } = await supabase()
      .from("contracts")
      .delete()
      .neq("entidad", "");

    if (userError || billError || contractError) {
      console.log("🚀 ~ deleteAllData ~ userError:", userError);
      console.log("🚀 ~ deleteAllData ~ billError:", billError);
      console.log("🚀 ~ deleteAllData ~ contractError:", contractError);
      throw userError ?? billError ?? contractError;
    }
    return true;
  } catch (error) {
    console.error("Error deleting all data:", error);
    throw error;
  }
}

export async function deleteTable(tableName: string) {
  const filter =
    tableName === "users"
      ? "legajo"
      : tableName === "bills"
      ? "nombre"
      : "entidad";
  try {
    const { error } = await supabase().from(tableName).delete().neq(filter, "");
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting table ${tableName}:`, error);
    throw error;
  }
}
