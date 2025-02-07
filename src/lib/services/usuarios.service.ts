import { createClient as supabase } from "../db/client/supabase-client";
import { Contrato } from "../types/contratos";
import { PaginatedResponse, PaginationParams } from "../types/pagination";
import { NuevoUsuario, Usuario } from "../types/users";
import { addMonths } from "date-fns";
import { crearContrato } from "./contrato.service";

export async function insertarMultiplesUsuarios(
  usuarios: NuevoUsuario[]
): Promise<{ errors: Record<string, boolean> }> {
  const errors: Record<string, boolean> = {};

  try {
    for (const usuario of usuarios) {
      try {
        if (
          usuario.userType === "activo" &&
          (!usuario.fecha ||
            !usuario.certificado ||
            !usuario.disponible ||
            !usuario.rem_mens ||
            !usuario.entidad ||
            !usuario.cuil ||
            !usuario.apellido ||
            !usuario.nombre ||
            !usuario.legajo)
        ) {
          errors[usuario.legajo] = true;
          continue;
        }

        const user = await insertarUsuario(usuario);
        await crearContrato(user.id, usuario);
        errors[usuario.legajo] = false;
      } catch (error) {
        console.error(`Error uploading usuario for ${usuario.legajo}:`, error);
        errors[usuario.legajo] = true;
      }
    }
  } catch (error) {
    console.error("Error uploading usuarios:", error);
    throw error;
  }

  return { errors };
}

export async function insertarUsuario(nuevoUsuario: NuevoUsuario) {
  if (!nuevoUsuario.legajo) throw new Error("Legajo is required");

  // Check if the user already exists
  const { data: existingUser, error: userCheckError } = await supabase()
    .from("users")
    .select("*")
    .eq("legajo", nuevoUsuario.legajo)
    .maybeSingle();

  if (userCheckError && userCheckError.code !== "PGRST116")
    throw userCheckError;

  let usuario: Usuario;
  if (!existingUser) {
    // Insert new user if not exists
    const { newUser, userError } = await insertarUnicoUsuario(nuevoUsuario);

    if (userError) throw userError;
    usuario = newUser as Usuario;
  } else {
    usuario = existingUser;
  }

  return usuario;
}

const insertarUnicoUsuario = async (nuevoUsuario: NuevoUsuario) => {
  const { data: newUser, error: userError } = await supabase()
    .from("users")
    .insert({
      legajo: nuevoUsuario.legajo,
      cuil: nuevoUsuario.cuil,
      apellido: nuevoUsuario.apellido.toLowerCase(),
      nombre: nuevoUsuario.nombre.toLowerCase(),
      usertype: nuevoUsuario.userType.toLowerCase(),
    })
    .select()
    .maybeSingle();
  return { newUser, userError };
};

export async function obtenerUsuariosPaginados(
  params: PaginationParams
): Promise<PaginatedResponse<Usuario & { contracts?: Contrato[] }>> {
  const { page, pageSize, search, estado, tipo } = params;
  const start = (page - 1) * pageSize;

  // Base query
  let query = supabase()
    .from("users")
    .select("*, contracts(*)", { count: "exact" })
    .order("apellido", { ascending: true })
    .not("contracts", "is", null) // Only include users with contracts
    .order("fecha_final", {
      ascending: false,
      referencedTable: "contracts",
    }) // Get latest contract first
    .limit(1, { referencedTable: "contracts" }); // Fetch only the latest contract per user

  // Apply search filter
  if (search) {
    const searchLower = search?.toLowerCase();
    query = query.or(
      `apellido.ilike.%${searchLower}%,nombre.ilike.%${searchLower}%,legajo.ilike.%${searchLower}%,cuil.ilike.%${searchLower}%`
    );
  }

  // Apply contract status filter
  const now = new Date().toISOString();
  if (estado) {
    if (estado === "activo") {
      query = query
        .lte("contracts.fecha_inicio", now)
        .gte("contracts.fecha_final", now);
    } else if (estado === "renovar") {
      const twoMonthsBeforeEnd = addMonths(new Date(), 2).toISOString();
      query = query
        .lte("contracts.fecha_inicio", now)
        .lte("contracts.fecha_final", twoMonthsBeforeEnd)
        .gte("contracts.fecha_final", now);
    } else if (estado === "vencido") {
      query = query
        .lt("contracts.fecha_final", now) // Contract is expired
        .not("contracts.fecha_final", "gte", now); // Ensure no newer active contract exists
    }
  }

  // Apply contract type filter
  if (tipo) {
    query = query.eq("contracts.tipo", tipo?.toLowerCase());
  }

  // Apply pagination
  const { data, error, count } = await query.range(start, start + pageSize - 1);

  if (error) throw error;

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return {
    data: data.map((item) => ({
      ...item,
    })) as (Usuario & { contracts?: Contrato[] })[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages,
  };
}

export async function obtenerUsuarioPorLegajo(legajo: string) {
  try {
    const { data, error } = await supabase()
      .from("users")
      .select("*")
      .eq("legajo", legajo)
      .maybeSingle();

    if (error) return null;
    return data as Usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function obtenerUsuarioPorId(id: string) {
  try {
    const { data, error } = await supabase()
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data as Usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function actualizarUsuario(
  cuil: string,
  usuario: Partial<Usuario>
) {
  try {
    // Ensure the date is in the correct format for PostgreSQL

    const { data, error } = await supabase()
      .from("usuarios")
      .update({
        legajo: usuario.legajo,
        apellido: usuario.apellido?.toLowerCase(),
        nombre: usuario.nombre?.toLowerCase(),
        observaciones: usuario.observaciones,
      })
      .eq("cuil", cuil)
      .select();

    if (error) throw error;
    return data[0] as Usuario;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}
