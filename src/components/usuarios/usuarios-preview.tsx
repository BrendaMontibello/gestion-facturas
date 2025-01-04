"use client";

import { useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { insertarContrato } from '@/lib/services/contrato.service';
import { insertarUsuario } from '@/lib/services/usuarios.service';
import { NuevoUsuario } from '@/lib/types';
import { capitalize, formatearFechaInicial } from '@/lib/utils';

interface UsuariosPreviewProps {
  usuarios: NuevoUsuario[];
  onConfirm: () => void;
}

export function UsuariosPreview({
  usuarios,
  onConfirm,
}: Readonly<UsuariosPreviewProps>) {
  const [loading, setLoading] = useState(false);
  const [errorUsers, setErrorUsers] = useState<Record<string, boolean>>({});
  const [showAlert, setShowAlert] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    const errors: Record<string, boolean> = {};
    try {
      for (const usuario of usuarios) {
        try {
          const userType = usuario.userType || "other";

          const user = await insertarUsuario(usuario, userType);
          await insertarContrato(user.id, usuario);
          errors[usuario.cuil] = false;
        } catch (error) {
          console.error(`Error uploading usuario for ${usuario.cuil}:`, error);
          errors[usuario.cuil] = true;
        }
      }
      setErrorUsers(errors);
      setShowAlert(Object.values(errors).some((hasError) => hasError));
      onConfirm();
    } catch (error) {
      console.error("Error uploading usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const isInvalidCuil = (cuil: string) => cuil.length !== 11;
  const isInvalidDate = (date: string) => {
    const formatedDate = formatearFechaInicial(date);
    const newDate = new Date(formatedDate);
    return isNaN(newDate.getTime());
  };

  return (
    <div>
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          Algunos usuarios no pudieron ser cargados. Revise los errores.
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legajo</TableHead>
            <TableHead>CUIL</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Certificado</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((usuario) => {
            const invalidCuil = isInvalidCuil(usuario.cuil);
            const invalidDate = isInvalidDate(usuario.fecha);
            const uploadError = errorUsers[usuario.cuil];
            const rowClass =
              invalidCuil || invalidDate || uploadError ? "bg-red-100" : "";

            return (
              <TableRow key={usuario.cuil} className={rowClass}>
                <TableCell>{usuario.legajo}</TableCell>
                <TableCell>{usuario.cuil}</TableCell>
                <TableCell>{capitalize(usuario.apellido)}</TableCell>
                <TableCell>{capitalize(usuario.nombre)}</TableCell>
                <TableCell>{usuario.entidad}</TableCell>
                <TableCell>{usuario.certificado}</TableCell>
                <TableCell>{usuario.disponible}</TableCell>
                <TableCell>
                  {invalidDate
                    ? "Fecha inválida"
                    : formatearFechaInicial(usuario.fecha)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button onClick={handleUpload} disabled={loading} className="mt-4">
        {loading ? "Cargando..." : "Confirmar carga"}
      </Button>
    </div>
  );
}
