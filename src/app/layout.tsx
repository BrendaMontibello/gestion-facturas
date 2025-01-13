import "./globals.css";

import { NavigationDrawer } from "@/components/layout/drawer";
import { Header } from "@/components/layout/header";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";
import { Toaster } from "@/components/ui/toaster";
import { BlockingLoading } from '@/components/ui/blocking-loading';

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistema de Gestión de Cuentas",
  description: "Sistema para la gestión de cuentas empresariales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <BlockingLoading />
        <Header />
        <NavigationDrawer />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <ScrollToTopButton />
        <Toaster />
      </body>
    </html>
  );
}
