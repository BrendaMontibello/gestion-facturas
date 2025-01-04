import { Users } from 'lucide-react';
import { Suspense } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuariosFilter } from '@/components/usuarios/usuarios-filter';
import { UsuariosTable } from '@/components/usuarios/usuarios-table';

export default function UsuariosPage() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsuariosFilter />
          <Suspense fallback={<div>Cargando...</div>}>
            <UsuariosTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
