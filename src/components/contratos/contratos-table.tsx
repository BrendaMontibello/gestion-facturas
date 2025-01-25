import { format } from "date-fns";
import { ArrowRight, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Contrato } from "@/lib/types/contratos";
import {
  capitalize,
  determinarCuota,
  determinarEstadoContrato,
} from "@/lib/utils";

export function ContratosTable({
  contratos,
}: Readonly<{ contratos: Contrato[] }>) {
  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Final</TableHead>
            <TableHead>Cuota Actual</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Certificado</TableHead>
            <TableHead>Acciones</TableHead>
            <TableHead>Facturas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contratos.map((contrato) => (
            <TableRow key={contrato.id}>
              <TableCell>
                {format(new Date(contrato.fecha_inicio), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>
                {contrato.fecha_final
                  ? format(new Date(contrato.fecha_final), "dd/MM/yyyy")
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge>{determinarCuota(contrato.fecha_final)}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    determinarEstadoContrato(contrato.fecha_final) === "Activo"
                      ? "default"
                      : determinarEstadoContrato(contrato.fecha_final) ===
                        "Renovar"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {capitalize(determinarEstadoContrato(contrato.fecha_final))}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{capitalize(contrato.tipo)}</Badge>
              </TableCell>
              <TableCell>{contrato.entidad}</TableCell>
              <TableCell>{contrato.certificado}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/contratos/editar/${contrato.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/facturas-mensuales/${contrato.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
