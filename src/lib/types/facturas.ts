import { Contrato } from "./contratos";
import { ConsumoExtraAplicado } from "./consumos";
import { Usuario } from "./users";

export type NuevaFactura = {
    legajo: string;
    nombre?: string;
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
    impuestos: number;
    gestion_de: number;
    total: number;
  };
  
  export type FacturaMensual = {
    id: string;
    legajo: string;
    contract_id: string;
    cuota: number;
    fecha: string;
    extras?: ConsumoExtraAplicado[];
  };
  
  export type NuevaFacturaMensual = Omit<FacturaMensual, "id" >;

  export type NuevaFacturaLinea = Omit<FacturaLinea, "id" | "factura_mensual_id">;
  
  export type FacturaLinea = {
    id: string;
    factura_mensual_id: string;
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
    impuestos: number;
    gestion_de: number;
    total: number;
  }

  export type FacturadDelMes = FacturaLinea & {
    cuota: number;
    totalExtras: number;
    totalConExtras: number;
    bills_mensuales: FacturaMensual & {
      extras?: ConsumoExtraAplicado[];
      contracts: Contrato & {
        users: Usuario;
      };
    };
  }

  export type FacturaCompleta = {
    id: string;
    fecha: string;
    bills: FacturaLinea[];
    extras?: {monto: number, extras: {descripcion: string}}[];
    contracts: Contrato & {
      users: Usuario;
    };
  }
