"use client";

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { crearContrato } from '@/lib/services/contrato.service';
import { NuevoUsuario, Usuario } from '@/lib/types/users';

const contratoSchema = z.object({
  fecha: z.string().min(1, "La fecha de inicio es requerida"),
  entidad: z.string().min(1, "La entidad es requerida"),
  certificado: z.string().min(1, "El certificado es requerido"),
  disponible: z.number().min(0),
  rem_mens: z.number().min(0),
  estado: z.enum(['activo', 'vencido', 'cobranza manual']),
});

type FormValues = z.infer<typeof contratoSchema>;

export function CrearContratoForm({ usuario }: Readonly<{ usuario: Usuario }>) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      estado: 'activo',
      disponible: 0,
      rem_mens: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await crearContrato(usuario.id, {
        ...data,
        userType: usuario.usertype,
        legajo: usuario.legajo,
        cuil: usuario.cuil,
        apellido: usuario.apellido,
        nombre: usuario.nombre,
      } as NuevoUsuario);
      
      toast({
        title: "Éxito",
        description: "Contrato creado correctamente",
      });

      router.push(`/contratos/${usuario.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: "Error al crear el contrato",
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
            name="fecha"
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
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cobranza manual">Cobranza Manual</SelectItem>
                  </SelectContent>
                </Select>
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
                    onChange={e => field.onChange(parseFloat(e.target.value))}
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
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
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
          >
            Cancelar
          </Button>
          <Button type="submit">Crear Contrato</Button>
        </div>
      </form>
    </Form>
  );
} 