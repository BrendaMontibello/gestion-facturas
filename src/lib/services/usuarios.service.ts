import { createClient as supabase } from '../db/client/supabase-client';
import { Contrato, NuevoUsuario, Usuario } from '../types';
import { PaginatedResponse, PaginationParams } from '../types/pagination';

export async function insertarUsuario(nuevoUsuario: NuevoUsuario, userType: "activo" | "jubilado" | "admin" | "aduana" | "other") {
  if (!nuevoUsuario.cuil) throw new Error("Cuil is required");
  
  // Check if the user already exists
  const { data: existingUser, error: userCheckError } = await supabase()
    .from("users")
    .select("*")
    .eq("cuil", nuevoUsuario.cuil)
    .single();

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
        userType: userType.toLowerCase(),
      })
      .select()
      .single();

    if (userError) throw userError;
    usuario = newUser as Usuario;
  } else {
    usuario = await actualizarUsuario(nuevoUsuario.cuil, nuevoUsuario);
  }

  return usuario;
}

export async function obtenerUsuariosPaginados(
  params: PaginationParams
): Promise<PaginatedResponse<Usuario & { contracts?: Contrato[] }>> {
  const { page, pageSize, search, sortBy, sortOrder, estado, tipo } = params;
  const start = (page - 1) * pageSize;

  // Base query - only include contracts if we're filtering by estado or tipo
  let query = supabase().from("users").select("*, contracts(*)" ,
    { count: "exact" }
  );

  // Apply search filter
  if (search) {
    const searchLower = search?.toLowerCase();
    query = query.or(
      `apellido.ilike.%${searchLower}%,nombre.ilike.%${searchLower}%,legajo.ilike.%${searchLower}%,cuil.ilike.%${searchLower}%`
    );
  }

  // Apply contract status filter
  if (estado) {
    query = query
      .not('contracts', 'is', null) // Only include users with contracts
      .eq('contracts.estado', estado?.toLowerCase());
  }

  // Apply contract type filter
  if (tipo) {
    query = query
      .not('contracts', 'is', null) // Only include users with contracts
      .eq('contracts.tipo', tipo?.toLowerCase());
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

export async function obtenerUsuarioPorCuil(cuil: string) {
  try {
    const { data, error } = await supabase()
      .from("users")
      .select("*")
      .eq("cuil", cuil)
      .single();

    if (error) throw error;
    return data as Usuario;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
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
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
}
