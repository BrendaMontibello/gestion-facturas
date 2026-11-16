import { describe, expect, it } from "vitest";

import {
  calcularCuotaActual,
  determinarEstadoContrato,
  formatearFechaInicial,
  formatearFechaParaMostrar,
  mesFacturacionISO,
} from "./date";

describe("date helpers", () => {
  it("formatearFechaInicial usa YYYY-MM-DD", () => {
    expect(formatearFechaInicial("04092025")).toBe("2025-09-04");
  });

  it("formatearFechaParaMostrar no resta un día en medianoche UTC", () => {
    expect(formatearFechaParaMostrar("2025-09-04T00:00:00.000Z")).toBe(
      "04/09/2025"
    );
  });

  it("mesFacturacionISO es estable para oct-dic", () => {
    expect(mesFacturacionISO(new Date(2026, 9, 1))).toBe(
      "2026-10-01T00:00:00.000Z"
    );
    expect(mesFacturacionISO(new Date(2026, 10, 1))).toBe(
      "2026-11-01T00:00:00.000Z"
    );
  });

  it("calcularCuotaActual cubre 12 meses", () => {
    expect(calcularCuotaActual("2025-09-04", new Date(2025, 8, 1))).toBe(1);
    expect(calcularCuotaActual("2025-09-04", new Date(2026, 7, 1))).toBe(12);
    expect(calcularCuotaActual("2025-09-04", new Date(2026, 8, 1))).toBe(0);
  });

  it("determinarEstadoContrato marca renovar en cuotas 11-12", () => {
    // junio = cuota 10 → Activo; julio = cuota 11 → Renovar
    expect(
      determinarEstadoContrato(
        "2025-09-04",
        "2026-09-04",
        new Date(2026, 5, 1)
      )
    ).toBe("Activo");
    expect(
      determinarEstadoContrato(
        "2025-09-04",
        "2026-09-04",
        new Date(2026, 6, 1)
      )
    ).toBe("Renovar");
  });
});
