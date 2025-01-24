import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrearUsuarioForm } from '@/components/usuarios/crear-usuario-form';
export default function CrearUsuarioPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h1>
      <Card>
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <CrearUsuarioForm />
        </CardContent>
      </Card>
    </div>
  );
} 