import { UserType } from "./users";

export type UserCsv = {
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

export type FacturaCsv = {
    nombre: string;
    apellido: string;
    nro_linea: number;
    plan: string;
    monto_valor: number;
    monto_servic: number;
    monto_bonifi: number;
    monto_llama: number;
    monto_llamcd: number;
    monto_roami: number;
    monto_mens: number;
    monto_datos: number;
    monto_otros: number;
    monto_total: number;
}
