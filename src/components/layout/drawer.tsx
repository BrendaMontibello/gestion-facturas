"use client";

import { FileSpreadsheet, Home, Receipt, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useDrawer } from '@/hooks/use-drawer';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/cargar-usuarios", icon: FileSpreadsheet, label: "Cargar Usuarios" },
  { href: "/usuarios", icon: Users, label: "Ver Usuarios" },
  { href: "/cargar-facturas", icon: Receipt, label: "Cargar Facturas" },
  { href: "/facturas", icon: Receipt, label: "Ver Facturas" },
  { href: "/descuentos", icon: Receipt, label: "Ver Descuentos" },
];

export function NavigationDrawer() {
  const { isOpen, closeDrawer } = useDrawer();
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={closeDrawer}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetTitle>Hola</SheetTitle>
        <SheetDescription>NavBar</SheetDescription>
        <nav className="flex flex-col gap-2 mt-4">
          {menuItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={closeDrawer}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === href && "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
