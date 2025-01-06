
export type UserType = "activo" | "jubilado" | "admin" | "aduana" | "other";

export interface NuevoUsuario {
  legajo: string;
  cuil: string;
  certificado: string;
  entidad: string;
  fecha: string;
  disponible: number;
  ret_mens: number;
  apellido: string;
  nombre: string;
  userType: UserType;
}

export interface Usuario {
  id: string;
  legajo: string;
  cuil: string;
  apellido: string;
  nombre: string;
  observaciones?: string;
  usertype: UserType;
}
