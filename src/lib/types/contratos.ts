import { UserType } from "./users";

export type NuevoContrato = {
  fecha_inicio: Date;
  fecha_final?: Date;
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
