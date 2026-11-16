import { UserType } from "./users";

export type NuevoContrato = {
  user_id?: string;
  fecha_inicio: string | Date;
  fecha_final?: string | Date;
  entidad?: string;
  certificado?: string;
  disponible?: number;
  rem_mens?: number;
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
  tipo: UserType;
}
