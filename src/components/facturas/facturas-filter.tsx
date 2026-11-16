"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FacturasFilterProps = {
  search: string;
  tipo: string;
  onSearchChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onReset: () => void;
};

export function FacturasFilter({
  search,
  tipo,
  onSearchChange,
  onTipoChange,
  onReset,
}: Readonly<FacturasFilterProps>) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Buscar por legajo, nombre o apellido..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={tipo || "all"}
        onValueChange={(value) => onTipoChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de contrato" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="jubilado">Jubilado</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="aduana">Aduana</SelectItem>
          <SelectItem value="other">Otro</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onReset}>
        Limpiar
      </Button>
    </div>
  );
}
