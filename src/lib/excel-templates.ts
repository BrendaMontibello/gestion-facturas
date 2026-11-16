import * as XLSX from "xlsx";

import {
  CONSUMOS_APLICAR_EXCEL_HEADERS,
  CONSUMOS_EXCEL_HEADERS,
  FACTURAS_EXCEL_HEADERS,
  USUARIOS_EXCEL_HEADERS,
} from "./excel-schemas";

function downloadTemplate(
  headers: readonly string[],
  filename: string,
  sampleRow?: Record<string, string | number>
) {
  const row = sampleRow ?? Object.fromEntries(headers.map((h) => [h, ""]));
  const worksheet = XLSX.utils.json_to_sheet([row], {
    header: [...headers],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
  XLSX.writeFile(workbook, filename);
}

export function descargarPlantillaUsuarios() {
  downloadTemplate(
    USUARIOS_EXCEL_HEADERS,
    "plantilla_usuarios.xlsx",
    {
      Legajo: "12345",
      Cuil: "20123456789",
      Certificado: "264915",
      Entidad: "499953",
      Fecha: "04092025",
      Disponible: 15000,
      "Rem mens": 0,
      Nombre: "Juan",
      Apellido: "Perez",
      Estado: "activo",
    }
  );
}

export function descargarPlantillaFacturas() {
  downloadTemplate(FACTURAS_EXCEL_HEADERS, "plantilla_facturas.xlsx", {
    "Nro Linea": 1111111111,
    Usuario: "Juan Perez",
    Legajo: "12345",
    Plan: "Plan Ejemplo",
    "Monto valor plan": 1000,
    "Monto servicios adicionales": 0,
    "Monto bonificaciones": 0,
    "Monto llamadas locales nac": 0,
    "Monto llamdas internacionales": 0,
    "Monto roaming": 0,
    "Monto mensajes": 0,
    "Monto datos": 0,
    "Monto otros cargos ": 0,
    "Monto total linea": 1000,
  });
}

export function descargarPlantillaConsumos() {
  downloadTemplate(CONSUMOS_EXCEL_HEADERS, "plantilla_consumos.xlsx", {
    Codigo: "01",
    Nombre: "Descuento ejemplo",
  });
}

export function descargarPlantillaConsumosAplicar() {
  downloadTemplate(
    CONSUMOS_APLICAR_EXCEL_HEADERS,
    "plantilla_consumos_aplicar.xlsx",
    {
      Legajo: "12345",
      Codigo: "01",
      Monto: 100,
    }
  );
}

export function exportarLegajosOmitidos(
  omitidos: { legajo: string; motivo: string; lineas?: number }[],
  filename = "legajos_omitidos.xlsx"
) {
  const worksheet = XLSX.utils.json_to_sheet(
    omitidos.map((item) => ({
      Legajo: item.legajo,
      Motivo: item.motivo,
      Lineas: item.lineas ?? "",
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Omitidos");
  XLSX.writeFile(workbook, filename);
}
