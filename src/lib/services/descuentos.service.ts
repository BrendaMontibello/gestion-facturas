import { createClient as supabase } from "../db/client/supabase-client";
import { Descuento, DescuentoAplicado } from "../types/descuentos";

export async function obtenerDescuentos(): Promise<Descuento[]> {
  const { data, error } = await supabase()
    .from("discounts")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) throw error;
  return data;
}

export async function crearDescuentos(descuentos: Omit<Descuento, "id">[]): Promise<Descuento[]> {
    const descuentosCreados: Descuento[] = [];
    for (const descuento of descuentos) {
        try {
            const  descuentoCreado = await crearDescuento(descuento);
            descuentosCreados.push(descuentoCreado);
        } catch (error) {
            console.error("Error creating descuento:", descuento.codigo, error);
            continue;
        }
    }
    return descuentosCreados;
}

export async function crearDescuento(descuento: Omit<Descuento, "id">) {
    const { data, error } = await supabase()
    .from("discounts")
    .insert(descuento)
    .select()
    .single()

    if (error) {
        console.error("Error inserting descuento:", error);
        throw error;
    }
    return data;
}

export async function insertarDescuento(descuento: Omit<DescuentoAplicado, "id" | "factura_id">, factura_id: string): Promise<DescuentoAplicado> {
    const { data, error } = await supabase()
    .from("bill_discounts")
    .insert({
        ...descuento,
        factura_id: factura_id
    })
    .select()
    .single()

    if (error) {
        console.error("Error inserting descuento:", error);
        throw error;
    }
    return data;
}

export async function actualizarDescuento(id: number, descuento: Omit<Descuento, "id">) {
    const { data, error } = await supabase()
    .from("discounts")
    .update(descuento)
    .eq("id", id)
    .select()
    .single()

    if (error) {
        console.error("Error updating descuento:", error);
        throw error;
    }
    return data;
}

export async function eliminarDescuento(id: number) {
    const { error } = await supabase()
    .from("discounts")
    .delete()
    .eq("id", id);

    if (error) {
        console.error("Error deleting descuento:", error);
        throw error;
    }
    return true;
}

