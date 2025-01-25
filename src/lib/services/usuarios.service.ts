import { createClient as supabase } from "../db/client/supabase-client";
import { Contrato } from "../types/contratos";
import { PaginatedResponse, PaginationParams } from "../types/pagination";
import { NuevoUsuario, Usuario } from "../types/users";
import { addMonths } from "date-fns";

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

    if (userError) throw userError;
    usuario = newUser as Usuario;
  } else {
    usuario = existingUser;
  }

  return usuario;
}

export async function obtenerUsuariosPaginados(
  params: PaginationParams
): Promise<PaginatedResponse<Usuario & { contracts?: Contrato[] }>> {
  const { page, pageSize, search, sortBy, sortOrder, estado, tipo } = params;
  const start = (page - 1) * pageSize;

  // Base query - only include contracts if we're filtering by estado or tipo
  let query = supabase()
    .from("users")
    .select("*, contracts(*)", { count: "exact" });

  // Apply search filter
  if (search) {
    const searchLower = search?.toLowerCase();
    query = query.or(
      `apellido.ilike.%${searchLower}%,nombre.ilike.%${searchLower}%,legajo.ilike.%${searchLower}%,cuil.ilike.%${searchLower}%`
    );
  }

  // Apply contract status filter
  if (estado) {
    console.log("🚀 ~ file: usuarios.service.ts:65 ~ estado:", estado);
    if (estado === "activo") {
      query = query
        .not("contracts", "is", null) // Only include users with contracts
        .lte("contracts.fecha_inicio", new Date().toISOString())
        .gte("contracts.fecha_final", new Date().toISOString());
    } else if (estado === "renovar") {
      const twoMonthsBeforeEnd = addMonths(new Date(), 2).toISOString();
      query = query
        .not("contracts", "is", null) // Only include users with contracts
        .lte("contracts.fecha_inicio", new Date().toISOString())
        .lte("contracts.fecha_final", twoMonthsBeforeEnd)
        .gte("contracts.fecha_final", new Date().toISOString());
    } else if (estado === "vencido") {
      query = query
        .not("contracts", "is", null) // Only include users with contracts
        .lt("contracts.fecha_final", new Date().toISOString());
    } else {
      query = query.not("contracts", "is", null);
    }
  }

  // Apply contract type filter
  if (tipo) {
    query = query
      .not("contracts", "is", null) // Only include users with contracts
      .eq("contracts.tipo", tipo?.toLowerCase());
  }

  // Apply sorting
  if (sortBy) {
    query = query.order(sortBy, { ascending: sortOrder === "asc" });
  } else {
    query = query.order("apellido", { ascending: true });
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
