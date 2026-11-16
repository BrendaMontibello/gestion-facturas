import {
  FileDown,
  FileSpreadsheet,
  Percent,
  Receipt,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/cargar-usuarios",
    title: "Cargar Usuarios",
    description: "Importar archivo Excel con información de usuarios",
    detail:
      "Carga masiva de usuarios y contratos mediante archivo Excel con todos los datos necesarios.",
    icon: FileSpreadsheet,
  },
  {
    href: "/usuarios",
    title: "Ver Usuarios",
    description: "Consultar la base de datos de usuarios",
    detail:
      "Visualiza y gestiona la información de todos los usuarios registrados.",
    icon: Users,
  },
  {
    href: "/cargar-facturas",
    title: "Cargar Facturas",
    description: "Importar facturas telefónicas",
    detail:
      "Carga los costos telefónicos mensuales. Si el mes ya existe, se reemplazan las líneas.",
    icon: Receipt,
  },
  {
    href: "/facturas",
    title: "Ver Facturas",
    description: "Ver facturas telefónicas",
    detail:
      "Consultá liquidaciones del mes, aplicá extras y exportá Excel o TXT.",
    icon: Receipt,
  },
  {
    href: "/consumos",
    title: "Gestionar Consumos Extras",
    description: "Administrar consumos extras para facturas",
    detail:
      "Creá y gestioná los códigos de consumo extra aplicables a las facturas.",
    icon: Percent,
  },
  {
    href: "/resetear-db",
    title: "Administrar Datos",
    description: "Borrar mes o tablas con confirmación",
    detail:
      "Eliminá facturas de un mes, tablas puntuales o toda la base (con confirmación).",
    icon: FileDown,
  },
];

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Sistema de Gestión de Cuentas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(({ href, title, description, detail, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-6 w-6" />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
