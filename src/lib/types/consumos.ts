
export type ConsumoExtra = {
    id: number;
    codigo: string;
    descripcion: string;
  }

  export type NuevoConsumoExtra = Omit<ConsumoExtra, "id">;
  
  export type ConsumoExtraAplicado = {
    id: number;
    factura_id: string;
    codigo: string;
    monto: number;
  }

  export type NuevoConsumoExtraAAplicar = {
    legajo: string;
    codigo: string;
    monto: number;
  }
  