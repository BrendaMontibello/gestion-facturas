import { Contrato } from "./contratos";
import { Usuario } from "./users";

export type NuevaFactura = {
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
    bills_mensuales: FacturaMensual & {
      contracts: Contrato & {
        users: Usuario;
      };
    };
  }