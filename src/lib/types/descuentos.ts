
export type Descuento = {
    id: number;
    codigo: string;
    descripcion: string;
  }

  export type NuevoDescuento = Omit<Descuento, "id">;
  
  export type DescuentoAplicado = {
    id: number;
    factura_id: string;
    codigo: string;
    monto: number;
  }
  