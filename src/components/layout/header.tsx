"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDrawer } from "@/hooks/use-drawer";

export function Header() {
  const { toggleDrawer } = useDrawer();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleDrawer}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            Sistema de Gestión de Cuentas
          </h2>
        </div>
      </div>
    </header>
  );
}
