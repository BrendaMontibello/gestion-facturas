export interface NuevoUsuario {
  legajo: string;
  cuil: string;
  certificado: string;
  entidad: string;
  fecha: string;
  disponible: number;
  apellido: string;
  nombre: string;
  retMens: number;
  userType?: "activo" | "jubilado" | "admin" | "aduana" | "other";
}

export interface Usuario {
  id: string;
  legajo: string;
  cuil: string;
  apellido: string;
  nombre: string;
  observaciones?: string;
  userType?: "activo" | "jubilado" | "admin" | "aduana" | "other";
}

export interface Contrato {
  id?: string;
  user_id: string;
  fecha_inicio: string;
  fecha_final?: string;
  entidad?: string;
  certificado?: string;
  disponible?: number;
  ret_mens?: number;
  estado: "activo" | "vencido" | "fuera de norma";
  tipo: "activo" | "jubilado" | "admin" | "aduana" | "other";
}

export type NuevaFactura = {
  nro_linea: number;
  nombre: string;
  apellido: string;
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
  impuestos: number;
  gestion_de: number;
  total: number;
  fecha: string;
};

export type Factura = NuevaFactura & {
  id: string;
  legajo: string;
  contract_id: string;
  cuota: number;
};

export interface Descuento {
  id: number;
  codigo: string;
  descripcion: string;
  porcentaje: number;
  activo: boolean;
}

export interface ContratoConFacturas {
  user: Usuario;
  contracts: Contrato[];
  // bills: Factura[];
}

export interface FacturasPorMes extends Factura {
  contracts: Contrato & {
    users: Usuario;
  };
}
