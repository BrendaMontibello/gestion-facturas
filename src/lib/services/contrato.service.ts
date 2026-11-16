import { isAfter } from "date-fns";

import { createClient as supabase } from "../db/client/supabase-client";
import {
  calcularFechaFinContrato,
  parseDateSafe,
} from "../date";

import { Contrato, NuevoContrato } from "../types/contratos";
import { NuevoUsuario, Usuario, UserType } from "../types/users";

export async function crearContrato(
  usuarioId: string,
  nuevoUsuario: NuevoUsuario
): Promise<Contrato> {
  let fechaInicio: Date;
  try {
    fechaInicio = nuevoUsuario.fecha
      ? parseDateSafe(nuevoUsuario.fecha)
      : new Date();
  } catch {
    fechaInicio = new Date();
  }

  const fechaFinal = calcularFechaFinContrato(fechaInicio);

  const { data: existingContracts, error: contractCheckError } =
    await supabase()
      .from("contracts")
      .select("*")
      .eq("user_id", usuarioId)
      .order("fecha_inicio", { ascending: false });

  if (contractCheckError) throw contractCheckError;

  const latestContract = existingContracts[0];

  if (
    latestContract?.fecha_final &&
    isAfter(new Date(latestContract.fecha_final), fechaInicio)
  ) {
    throw new Error("Un contrato existente es válido");
  }

  function isValidUserType(userType: string): userType is UserType {
    return ["activo", "jubilado", "admin", "aduana", "other"].includes(
      userType
    );
  }

  const tipo = isValidUserType(nuevoUsuario.userType)
    ? nuevoUsuario.userType
    : "other";

  const contrato = {
    user_id: usuarioId,
    fecha_inicio: fechaInicio.toISOString(),
    fecha_final: tipo === "activo" ? fechaFinal.toISOString() : undefined,
    entidad: nuevoUsuario.entidad ?? undefined,
    certificado: nuevoUsuario.certificado ?? undefined,
    disponible: nuevoUsuario.disponible ?? undefined,
    rem_mens: nuevoUsuario.rem_mens ?? undefined,
    tipo,
  };

  const { data, error } = await insertarContrato(contrato);

  if (error) {
    console.error("Error inserting contract:", error);
    throw error;
  }

  return data;
}

export const insertarContrato = async (contrato: NuevoContrato) => {
  const { data, error } = await supabase()
    .from("contracts")
    .insert(contrato)
    .select()
    .maybeSingle();

  return { data, error };
};

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
