import { startOfMonth } from "date-fns";
import { createClient as supabase } from "../db/client/supabase-client";
import {
  ConsumoExtra,
  ConsumoExtraAplicado,
  NuevoConsumoExtraAAplicar,
} from "../types/consumos";

import { crearFacturaMensual } from "./factura.service";

export async function obtenerConsumoExtra(): Promise<ConsumoExtra[]> {
  const { data, error } = await supabase()
    .from("extras")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) throw error;
  return data;
}

export async function crearConsumosExtra(
  extras: Omit<ConsumoExtra, "id">[]
): Promise<ConsumoExtra[]> {
  const extrasCreados: ConsumoExtra[] = [];
  for (const extra of extras) {
    try {
      const extraCreado = await crearConsumoExtra(extra);
      extrasCreados.push(extraCreado);
    } catch (error) {
      console.error("Error creating extra:", extra.codigo, error);
      continue;
    }
  }
  return extrasCreados;
}

export async function crearConsumoExtra(extra: Omit<ConsumoExtra, "id">) {
  const { data, error } = await supabase()
    .from("extras")
    .insert(extra)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error inserting extra:", error);
    throw error;
  }
  return data;
}

export async function insertarConsumoExtra(
  extra: Omit<ConsumoExtraAplicado, "id" | "factura_id">,
  factura_id: string
): Promise<ConsumoExtraAplicado> {
  const { data, error } = await supabase()
    .from("bill_extras")
    .insert({
      ...extra,
      factura_id,
    })
    .select();

  if (error) {
    console.error("Error inserting extra:", error);
    throw error;
  }
  return data[0];
}

export async function actualizarConsumoExtra(
  id: number,
  extra: Omit<ConsumoExtra, "id">
) {
  const { data, error } = await supabase()
    .from("extras")
    .update(extra)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating extra:", error);
    throw error;
  }
  return data;
}

export async function eliminarConsumoExtra(id: number) {
  const { error } = await supabase().from("extras").delete().eq("id", id);

  if (error) {
    console.error("Error deleting extra:", error);
    throw error;
  }
  return true;
}

export async function aplicarConsumoExtraAFacturas(
  extras: NuevoConsumoExtraAAplicar[],
  fecha: Date
) {
  const extrasAplicados: ConsumoExtraAplicado[] = [];
  const errores: string[] = [];

  for (const extra of extras) {
    try {
      // Check if the legajo has a contract
      const { data: contract, error: contractError } = await supabase()
        .from("contracts")
        .select("id, users!inner(legajo)")
        .eq("users.legajo", extra.legajo)
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (contractError || !contract) {
        errores.push(`No se encontró contrato para el legajo ${extra.legajo}`);
        continue;
      }

      // Check if there's a factura_mensual for this month
      const { data: facturaMensual, error: facturaError } = await supabase()
        .from("bills_mensuales")
        .select("id")
        .eq("contract_id", contract.id)
        .eq("fecha", startOfMonth(fecha).toISOString())
        .maybeSingle();

      if (facturaError) {
        errores.push(`Error al buscar factura para el legajo ${extra.legajo}`);
        continue;
      }

      // If no factura_mensual exists, create one
      let facturaId: string = "";

      if (!facturaMensual) {
        facturaId = await crearFacturaMensual(contract.id, fecha);
      } else {
        facturaId = facturaMensual.id;
      }

      // Verify the discount code exists
      const { data: descuentoExistente, error: descuentoError } =
        await supabase()
          .from("extras")
          .select("*")
          .eq("codigo", extra.codigo)
          .maybeSingle();

      if (descuentoError || !descuentoExistente) {
        errores.push(`Código de descuento inválido: ${extra.codigo}`);
        continue;
      }

      // Apply the discount
      const extraAplicado = await insertarConsumoExtra(
        {
          codigo: extra.codigo,
          monto: extra.monto,
        },
        facturaId
      );

      extrasAplicados.push(extraAplicado);
    } catch (error) {
      console.error("Error applying discount:", error);
      errores.push(`Error al aplicar descuento para legajo ${extra.legajo}`);
    }
  }

  return {
    aplicados: extrasAplicados,
    errores,
  };
}
