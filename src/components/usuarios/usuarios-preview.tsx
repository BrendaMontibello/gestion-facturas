"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { insertarMultiplesUsuarios } from "@/lib/services/usuarios.service";

import { capitalize } from "@/lib/utils";
import { NuevoUsuario } from "@/lib/types/users";
import { useBlockingLoading } from "@/hooks/use-blocking-loading";

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
  const [usersToShow, setUsersToShow] = useState<NuevoUsuario[]>(usuarios);
  console.log("🚀 ~ usersToShow:", usersToShow);
  const [showAlert, setShowAlert] = useState(false);
  const { startLoading, stopLoading } = useBlockingLoading();

  const handleUpload = async () => {
    startLoading("Cargando usuarios...");
    setLoading(true);
    try {
      const { errors } = await insertarMultiplesUsuarios(usuarios);

      setUsersToShow(usuarios.filter((usuario) => !errors[usuario.legajo]));
      setErrorUsers(errors);
      setShowAlert(Object.values(errors).some((hasError) => hasError));
      onConfirm();
    } catch (error) {
      console.error("Error uploading usuarios:", error);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const isInvalidCuil = (cuil: string) => cuil.length !== 11;
  const isInvalidDate = (date: string) => {
    const newDate = new Date(date);
    return isNaN(newDate.getTime());
  };

  return (
    <div>
      {showAlert && (
        <Alert variant="destructive" className="mb-4">
          Algunos usuarios no pudieron ser cargados. Revise los errores e
          intente con un nuevo archivo con sólo los usuarios que tienen errores.
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
            <TableHead>Rem. Mensual</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersToShow.map((usuario) => {
            const invalidCuil = isInvalidCuil(usuario.cuil);
            const invalidDate = isInvalidDate(usuario.fecha);
            const uploadError = errorUsers[usuario.legajo];
            const rowClass =
              invalidCuil ||
              (invalidDate && usuario.userType === "activo") ||
              uploadError
                ? "bg-red-100"
                : "";

            return (
              <TableRow key={usuario.legajo} className={rowClass}>
                <TableCell>{usuario.legajo}</TableCell>
                <TableCell>{usuario.cuil ?? "N/A"}</TableCell>
                <TableCell>{capitalize(usuario.apellido)}</TableCell>
                <TableCell>{capitalize(usuario.nombre)}</TableCell>
                <TableCell>{usuario.entidad ?? "N/A"}</TableCell>
                <TableCell>{usuario.certificado ?? "N/A"}</TableCell>
                <TableCell>{usuario.disponible}</TableCell>
                <TableCell>{usuario.rem_mens}</TableCell>
                <TableCell>{usuario.userType}</TableCell>
                <TableCell>
                  {invalidDate && usuario.userType === "activo"
                    ? "Fecha inválida"
                    : usuario.fecha}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        onClick={handleUpload}
        disabled={loading || showAlert}
        className="mt-4"
      >
        {loading ? "Cargando..." : "Confirmar carga"}
      </Button>
    </div>
  );
}
