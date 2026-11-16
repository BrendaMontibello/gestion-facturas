import { describe, expect, it } from "vitest";

import {
  getFacturaExcedente,
  getFacturaExtras,
  getFacturaFinalTotal,
  getFacturaTotal,
} from "./factura-utils";
import { FacturaCompleta } from "./types/facturas";

function makeFactura(
  overrides: Partial<FacturaCompleta> & {
    bills: FacturaCompleta["bills"];
    contracts: FacturaCompleta["contracts"];
  }
): FacturaCompleta {
  return {
    id: "1",
    fecha: "2026-10-01T00:00:00.000Z",
    extras: [],
    ...overrides,
  };
}

describe("factura-utils liquidación", () => {
  it("calcula total, extras y excedente para activo", () => {
    const factura = makeFactura({
      bills: [
        {
          id: "b1",
          factura_mensual_id: "1",
          nro_linea: 1,
          plan: "x",
          monto_valor: 0,
          monto_servic: 0,
          monto_bonifi: 0,
          monto_llama: 0,
          monto_llamcd: 0,
          monto_roami: 0,
          monto_mens: 0,
          monto_datos: 0,
          monto_otros: 0,
          monto_total: 1000,
          impuestos: 210,
          gestion_de: 50,
          total: 1260,
        },
      ],
      extras: [{ monto: 100, extras: { descripcion: "extra" } }],
      contracts: {
        user_id: "u1",
        fecha_inicio: "2025-09-04",
        fecha_final: "2026-09-04",
        disponible: 1000,
        tipo: "activo",
        users: {
          id: "u1",
          legajo: "1",
          cuil: "20123456789",
          apellido: "perez",
          nombre: "juan",
          usertype: "activo",
        },
      },
    });

    expect(getFacturaTotal(factura)).toBe(1260);
    expect(getFacturaExtras(factura)).toBe(100);
    // excedente = 1260 + 100 - 1000 = 360
    expect(getFacturaExcedente(factura)).toBe(360);
    // final activo = totals + extras - excedente = 1260 + 100 - 360 = 1000
    expect(getFacturaFinalTotal(factura)).toBe(1000);
  });

  it("para no activo no resta excedente", () => {
    const factura = makeFactura({
      bills: [
        {
          id: "b1",
          factura_mensual_id: "1",
          nro_linea: 1,
          plan: "x",
          monto_valor: 0,
          monto_servic: 0,
          monto_bonifi: 0,
          monto_llama: 0,
          monto_llamcd: 0,
          monto_roami: 0,
          monto_mens: 0,
          monto_datos: 0,
          monto_otros: 0,
          monto_total: 500,
          impuestos: 0,
          gestion_de: 0,
          total: 500,
        },
      ],
      extras: [{ monto: 50, extras: { descripcion: "extra" } }],
      contracts: {
        user_id: "u1",
        fecha_inicio: "2025-09-04",
        tipo: "jubilado",
        users: {
          id: "u1",
          legajo: "2",
          cuil: "20123456789",
          apellido: "lopez",
          nombre: "ana",
          usertype: "jubilado",
        },
      },
    });

    expect(getFacturaFinalTotal(factura)).toBe(550);
  });
});
