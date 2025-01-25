import { UserType } from "./users";

export type NuevoContrato = {
  fecha_inicio: string;
  entidad?: string;
  certificado?: string;
  disponible?: number;
  rem_mens?: number;
  estado: "activo" | "vencido" | "cobranza manual";
  tipo: UserType;
};

export interface Contrato {
  id?: string;
  user_id: string;
  fecha_inicio: string;
  fecha_final?: string;
  entidad?: string;
  certificado?: string;
  disponible?: number;
  rem_mens?: number;
  // estado: "activo" | "vencido" | "cobranza manual";
  tipo: UserType;
}
