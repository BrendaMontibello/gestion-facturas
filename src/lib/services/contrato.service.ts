import { addYears, isAfter } from "date-fns";

import { createClient as supabase } from "../db/client/supabase-client";

import { formatearFechaInicial } from "../utils";
import { Contrato } from "../types/contratos";
import { NuevoUsuario, Usuario } from "../types/users";

export async function crearContrato(
  usuarioId: string,
  nuevoUsuario: NuevoUsuario
): Promise<Contrato> {
  const fechaFormateada = formatearFechaInicial(nuevoUsuario.fecha);
  const newDate = new Date(fechaFormateada);
  const fechaInicio = isNaN(newDate.getTime()) ? new Date() : newDate;
  const fechaFinal = isNaN(newDate.getTime())
    ? undefined
    : addYears(fechaInicio, 1);

  // Check for existing contracts
  const { data: existingContracts, error: contractCheckError } =
    await supabase()
      .from("contracts")
      .select("*")
      .eq("user_id", usuarioId)
      .order("fecha_inicio", { ascending: false });

  if (contractCheckError) throw contractCheckError;

  const latestContract = existingContracts[0];

  if (
    latestContract &&
    isAfter(new Date(latestContract.fecha_final), fechaInicio)
  ) {
    // If the latest contract is still valid, do nothing
    return latestContract as Contrato;
  } else {
    // let estado = 'activo';
    // if (nuevoUsuario.userType !== 'activo') {
    //   estado = "cobranza manual";
    // } else if (fechaFinal && isBefore(fechaFinal, new Date())) {
    //   estado = "vencido";
    // }

    const contrato = {
      user_id: usuarioId,
      fecha_inicio: fechaInicio ?? undefined,
      fecha_final: fechaFinal ?? undefined,
      entidad: nuevoUsuario.entidad ?? undefined,
      certificado: nuevoUsuario.certificado ?? undefined,
      disponible: nuevoUsuario.disponible ?? undefined,
      rem_mens: nuevoUsuario.rem_mens ?? undefined,
      // estado,
      tipo: nuevoUsuario.userType,
    };

    const { data, error } = await supabase()
      .from("contracts")
      .insert(contrato)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error inserting contract:", error);
      throw error;
    }

    return data;
  }
}

export async function obtenerContratosPorUserId(userId: string): Promise<{
  user: Usuario;
  contracts: Contrato[];
}> {
  const { data: userData, error: userError } = await supabase()
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("Error fetching users:", userError);
    throw userError;
  }

  const { data: contractData, error: contractError } = await supabase()
    .from("contracts")
    .select(`*`)
    .eq("user_id", userId)
    .order("fecha_inicio", { ascending: false });

  if (contractError) {
    console.error("Error fetching bills:", contractError);
    throw contractError;
  }

  return { user: userData, contracts: contractData };
}

export async function actualizarContrato(contrato: Contrato) {
  const { data, error } = await supabase()
    .from("contracts")
    .update(contrato)
    .eq("id", contrato.id);

  if (error) {
    console.error("Error updating contract:", error);
    throw error;
  }

  return data;
}

export async function obtenerContratoPorId(id: string) {
  const { data: contract, error: contractError } = await supabase()
    .from("contracts")
    .select(
      `
      *,
      users (
        id,
        legajo,
        nombre,
        apellido,
        cuil
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (contractError) throw contractError;

  return {
    contract,
    user: contract.users,
  };
}
