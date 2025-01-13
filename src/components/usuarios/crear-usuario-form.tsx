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
import { insertarUsuario } from '@/lib/services/usuarios.service';
import { NuevoUsuario } from '@/lib/types/users';
import { crearContrato } from '@/lib/services/contrato.service';
import { Separator } from '../ui/separator';

const usuarioSchema = z.object({
  legajo: z.string().min(1, "El legajo es requerido"),
  cuil: z.string().min(1, "El CUIL es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  userType: z.enum(['activo', 'jubilado', 'admin', 'aduana', 'other']),
  certificado: z.string().optional(),
  entidad: z.string().optional(),
  fecha: z.string().min(1, "La fecha es requerida"),
  disponible: z.number().min(0).optional(),
  rem_mens: z.number().min(0).optional(),
  observaciones: z.string().optional(),
});

type FormValues = z.infer<typeof usuarioSchema>;

export function CrearUsuarioForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      userType: 'activo',
      disponible: 0,
      rem_mens: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const usuario = await insertarUsuario(data as NuevoUsuario);
      await crearContrato(usuario.id, data as NuevoUsuario);
      
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      });

      router.push("/usuarios");
      router.refresh();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-2">   
        <div className="grid grid-cols-2 gap-4">
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
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Usuario</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
               <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            </div>
          <Separator className="my-4" />

          <h2 className=" font-semibold">Contrato</h2>
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

   
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit">Crear Usuario</Button>
        </div>
      </form>
    </Form>
  );
} 