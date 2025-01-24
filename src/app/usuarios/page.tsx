import { Plus, Users } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuariosFilter } from "@/components/usuarios/usuarios-filter";
import { UsuariosTable } from "@/components/usuarios/usuarios-table";

export default function UsuariosPage() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Usuarios
          </CardTitle>
          <Link href="/usuarios/crear">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosFilter />
          </Suspense>
          <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
