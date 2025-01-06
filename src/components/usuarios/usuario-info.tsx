import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Usuario } from '@/lib/types/users';
import { capitalize } from '@/lib/utils';

export function UsuarioInfo({ usuario }: Readonly<{ usuario: Usuario }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{capitalize(usuario.nombre)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Apellido</p>
            <p className="font-medium">{capitalize(usuario.apellido)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">CUIL</p>
            <p className="font-medium">{usuario.cuil}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Legajo</p>
            <p className="font-medium">{usuario.legajo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 