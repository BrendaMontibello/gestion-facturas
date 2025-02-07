"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { actualizarContrato } from "@/lib/services/contrato.service";
import { Contrato } from "@/lib/types/contratos";
import { Usuario } from "@/lib/types/users";

const contratoSchema = z.object({
  fecha_inicio: z.string(),
  fecha_final: z.string().optional(),
  entidad: z.string(),
  certificado: z.string(),
  disponible: z.number().min(0),
  rem_mens: z.number().min(0),
  tipo: z.enum(["activo", "jubilado", "admin", "aduana", "other"]),
});

type ContratoFormValues = z.infer<typeof contratoSchema>;

export function ContratoForm({
  contrato,
}: Readonly<{
  contrato: { user: Usuario; contract: Contrato };
}>) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ContratoFormValues>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      fecha_inicio: format(
        new Date(contrato.contract.fecha_inicio),
        "yyyy-MM-dd"
      ),
      fecha_final: contrato.contract.fecha_final
        ? format(new Date(contrato.contract.fecha_final), "yyyy-MM-dd")
        : undefined,
      entidad: contrato.contract.entidad,
      certificado: contrato.contract.certificado,
      disponible: contrato.contract.disponible,
      rem_mens: contrato.contract.rem_mens,
      tipo: contrato.contract.tipo,
    },
  });

  const onSubmit = async (data: ContratoFormValues) => {
    try {
      await actualizarContrato({
        ...data,
        id: contrato.contract.id,
        user_id: contrato.user.id,
        fecha_inicio: new Date(data.fecha_inicio).toISOString(),
        fecha_final: data.fecha_final
          ? new Date(data.fecha_final).toISOString()
          : undefined,
      });

      toast({
        title: "Éxito",
        description: "Contrato actualizado correctamente",
      });

      router.push(`/contratos/${contrato.user.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating contract:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el contrato",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_final"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Final</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="entidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidad</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="certificado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificado</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="disponible"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disponible</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rem_mens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remuneración Mensual</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="jubilado">Jubilado</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="aduana">Aduana</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </Form>
  );
}
