import { FileDown, FileSpreadsheet, Receipt, Users } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Sistema de Gestión de Cuentas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/cargar-usuarios">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-6 w-6" />
                Cargar Usuarios
              </CardTitle>
              <CardDescription>
                Importar archivo CSV con información de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Carga masiva de usuarios mediante archivo CSV con todos los
                datos necesarios.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/usuarios">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Ver Usuarios
              </CardTitle>
              <CardDescription>
                Consultar la base de datos de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualiza y gestiona la información de todos los usuarios
                registrados.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cargar-facturas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6" />
                Cargar Facturas
              </CardTitle>
              <CardDescription>Importar facturas telefónicas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Carga los costos telefónicos mensuales de cada usuario.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/facturas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6" />
                Ver Facturas
              </CardTitle>
              <CardDescription>Ver facturas telefónicas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ver los costos telefónicos mensuales de cada usuario.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* <Link href="/descuentos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-6 w-6" />
                Gestionar Descuentos
              </CardTitle>
              <CardDescription>
                Administrar descuentos para facturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea y gestiona los códigos de descuento aplicables a las
                facturas.
              </p>
            </CardContent>
          </Card>
        </Link> */}

        <Link href="/resetear-db">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-6 w-6" />
                Borrar Datos
              </CardTitle>
              <CardDescription>Borrar los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Elimina completamente los usuarios de la base de datos.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
