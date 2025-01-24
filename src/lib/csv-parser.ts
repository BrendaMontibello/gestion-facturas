/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';

import { numbersToEnglish, numberToTwoDecimal } from './utils';
import { FacturaCsv } from './types/csv';
import { NuevoUsuario, UserType } from './types/users';
import { NuevoConsumoExtraAAplicar, NuevoConsumoExtra } from './types/consumos';

export function parsearUsuariosCSV(file: File): Promise<NuevoUsuario[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results: { data: NuevoUsuario[] }) => {
        const usuarios = results.data
          .filter((row) => row.legajo)
          .map((row) => ({
            legajo: row.legajo?.toString().trim(),
            cuil: row.cuil?.toString().trim() || "",
            certificado: row.certificado?.toString().trim() || "",
            entidad: row.entidad?.toString().trim() || "",
            fecha: row.fecha?.toString().trim().padStart(8, '0'),
            disponible:
              parseFloat(row.disponible?.toString().replace(",", ".")) || 0,
            rem_mens: parseFloat(row.rem_mens?.toString().replace(",", ".")) || 0,
            nombre: row.nombre?.toString().trim(),
            apellido: row.apellido?.toString().trim(),
            userType: row.userType?.toString().trim().toLowerCase() as UserType ?? "other",
          }));
        resolve(usuarios);
      },
      error: (error) => reject(error),
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: { [key: string]: string } = {
          CUIL: "cuil",
          LEGAJO: "legajo",
          CERTIFICADO: "certificado",
          ENTIDAD: "entidad",
          FECHA: "fecha",
          ESTADO: "userType",
          DISPONIBLE: "disponible",
          "REM MENS": "rem_mens",
          NOMBRE: "nombre",
          APELLIDO: "apellido",
          OBSERVACIONES: "observaciones",
        };
        return headerMap[header] || header.toLowerCase();
      },
    });
  });
}

export function parsearCSVFacturas(
  file: File
): Promise<
FacturaCsv[]
> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: { [key: string]: string } = {
          "Nro Linea": "nro_linea",
          Usuario: "usuario",
          Plan: "plan",
          legajo: "legajo",
          "Monto valor plan": "monto_valor",
          "Monto servicios adicionales": "monto_servic",
          "Monto bonificaciones": "monto_bonifi",
          "Monto llamadas locales nac": "monto_llama",
          "Monto llamdas internacionales": "monto_llamcd",
          "Monto roaming": "monto_roami",
          "Monto mensajes": "monto_mens",
          "Monto datos": "monto_datos",
          "Monto otros cargos ": "monto_otros",
          "Monto total linea": "monto_total",
        };
        return headerMap[header] || header.toLowerCase();
      },
      complete: (results) => {
        try {
          const facturas = results.data
            .filter((row: any) => row.nro_linea && row.legajo)
            .map((row: any) => {
              return {
                nro_linea: parseInt(row.nro_linea),
                legajo: row.legajo,
                plan: row.plan?.toString().trim(),
                monto_valor: numbersToEnglish(row.monto_valor),
                monto_servic: numbersToEnglish(row.monto_servic),
                monto_bonifi: numbersToEnglish(row.monto_bonifi),
                monto_llama: numbersToEnglish(row.monto_llama),
                monto_llamcd: numbersToEnglish(row.monto_llamcd),
                monto_roami: numbersToEnglish(row.monto_roami),
                monto_mens: numbersToEnglish(row.monto_mens),
                monto_datos: numbersToEnglish(row.monto_datos),
                monto_otros: numbersToEnglish(row.monto_otros),
                monto_total: numbersToEnglish(row.monto_total),
              };
            });
          console.log("🚀 ~ file: csv-parser.ts:102 ~ Papa.parse ~ facturas:", facturas.length)
          resolve(facturas);
        } catch (error) {
          reject(new Error(String(error)));
        }
      },
      error: (error) => reject(error),
    });
  });
}

export async function procesarArchivoConsumoExtra(file: File): Promise<NuevoConsumoExtra[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: { [key: string]: string } = {
         codigo: "codigo",
         nombre: "descripcion",
        };
        return headerMap[header] || header.toLowerCase();
      },
      complete: (results) => {
        try {
          const descuentos = results.data.map((row: any) => ({
            codigo: row.codigo.padStart(2, '0'),
            descripcion: row.descripcion,
          }));
         
          resolve(descuentos);
        } catch (error) {
          reject(new Error(String(error)));
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function procesarArchivoConsumoExtraAplicar(file: File): Promise<NuevoConsumoExtraAAplicar[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: { [key: string]: string } = {
         legajo: "legajo",
         codigo: "codigo",
         monto: "monto",
        };
        return headerMap[header] || header.toLowerCase();
      },
      complete: (results: { data: { legajo: string; codigo: string; monto: string }[] }) => {
        try {
          const descuentos = results.data.map((row: { legajo: string; codigo: string; monto: string }) => ({
            legajo: row.legajo,
            codigo: row.codigo?.padStart(2, '0'),
            monto: numberToTwoDecimal(numbersToEnglish(row.monto)),
          }));
          resolve(descuentos);
        } catch (error) {
          reject(new Error(String(error)));
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};