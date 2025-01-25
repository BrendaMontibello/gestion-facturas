"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { actualizarUsuario } from "@/lib/services/usuarios.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Usuario } from "@/lib/types/users";
const usuarioSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido"),
  cuil: z.string(),
  certificado: z.string(),
  entidad: z.string(),
  fecha: z.string().min(1, "La fecha es requerida"),
  cuota: z.number(),
  disponible: z.number(),
  retMens: z.number(),
  apellido: z.string().min(1, "El apellido es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  observaciones: z.string().optional(),
});

export function UsuarioForm({ usuario }: Readonly<{ usuario: Usuario }>) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<Usuario>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario,
  });

  const onSubmit = async (data: Usuario) => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...data,
        apellido: data.apellido.toLowerCase(),
        nombre: data.nombre.toLowerCase(),
      };

      const response = await actualizarUsuario(data.cuil, updatedData);
      if (!response) throw new Error("Error al actualizar");

      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });

      router.push("/usuarios");
      router.refresh();
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="legajo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legajo</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cuil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
