/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';

import { NuevaFactura, NuevoUsuario } from './types';
import { numbersToEnglish } from './utils';

export function parsearUsuariosCSV(file: File): Promise<NuevoUsuario[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const usuarios = results.data
          .filter((row: any) => row.legajo && row.cuil)
          .map((row: any) => ({
            legajo: row.legajo?.toString().trim(),
            cuil: row.cuil?.toString().trim(),
            certificado: row.certificado?.toString().trim(),
            entidad: row.entidad?.toString().trim(),
            fecha: row.fecha?.toString().trim().padStart(8, '0'),
            disponible:
              parseFloat(row.disponible?.toString().replace(",", ".")) || 0,
            retMens: parseFloat(row.retMens?.toString().replace(",", ".")) || 0,
            nombre: row.nombre?.toString().trim(),
            apellido: row.apellido?.toString().trim(),
            observaciones: row.observaciones?.toString().trim(),
            userType: row.estado?.toString().trim().toLowerCase(),
          }));
        resolve(usuarios);
      },
      error: (error) => reject(error),
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        const headerMap: { [key: string]: string } = {
          CUIL: "cuil",
          legajo: "legajo",
          certificado: "certificado",
          entidad: "entidad",
          FECHA: "fecha",
          estado: "estado",
          DISPONIB: "disponible",
          "RET MENS": "retMens",
          Nombre: "nombre",
          Apellido: "apellido",
          Observaciones: "observaciones",
        };
        return headerMap[header] || header.toLowerCase();
      },
    });
  });
}

export function parsearCSVFacturas(
  file: File
): Promise<
  Omit<NuevaFactura, "fecha" | "impuestos" | "gestion_de" | "total">[]
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
            .filter((row: any) => row.nro_linea && row.usuario)
            .map((row: any) => {
              return {
                nro_linea: parseInt(row.nro_linea),
                nombre: row.usuario
                  ?.split(",")[1]
                  ?.toString()
                  .toLowerCase()
                  .trim(),
                apellido: row.usuario
                  ?.split(", ")[0]
                  ?.toString()
                  .toLowerCase()
                  .trim(),
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
          resolve(facturas);
        } catch (error) {
          reject(new Error(String(error)));
        }
      },
      error: (error) => reject(error),
    });
  });
}
