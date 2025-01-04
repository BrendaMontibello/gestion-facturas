"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function UsuariosFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [estado, setEstado] = useState(searchParams.get("estado") ?? "");
  const [tipo, setTipo] = useState(searchParams.get("tipo") ?? "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (estado) params.set("estado", estado);
    if (tipo) params.set("tipo", tipo);
    params.set("page", "1"); // Reset to first page on filter
    router.push(`/usuarios?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    setEstado("");
    setTipo("");
    router.push("/usuarios");
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por nombre, apellido, legajo o CUIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <Select
          value={estado}
          onValueChange={(value) => setEstado(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado del contrato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={tipo}
          onValueChange={(value) => setTipo(value === "all" ? "" : value)}
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
        <Button onClick={handleFilter}>Filtrar</Button>
        <Button variant="outline" onClick={handleReset}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}
