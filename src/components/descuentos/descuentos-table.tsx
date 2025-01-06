"use client";

import { useState } from 'react';
import { Pencil, Redo, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Descuento } from '@/lib/types/descuentos';
import { actualizarDescuento, eliminarDescuento } from '@/lib/services/descuentos.service';
import { useToast } from '@/hooks/use-toast';

export function DescuentosTable({ 
  descuentosIniciales 
}: Readonly<{ 
  descuentosIniciales: Descuento[] 
}>) {
  const [descuentos, setDescuentos] = useState(descuentosIniciales);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { toast } = useToast();

  const handleEdit = (descuento: Descuento) => {
    setEditingId(descuento.id);
    setEditValue(descuento.descripcion);
  };

  const handleSave = async (descuento: Descuento) => {
    try {
      const updatedDescuento = await actualizarDescuento(descuento.id, {
        ...descuento,
        descripcion: editValue,
      });

      setDescuentos(descuentos.map(d => 
        d.id === descuento.id ? updatedDescuento : d
      ));
      
      setEditingId(null);
      toast({
        title: "Éxito",
        description: "Descuento actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating discount:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el descuento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (descuento: Descuento) => {
    try {
      await eliminarDescuento(descuento.id);
      setDescuentos(descuentos.filter(d => d.id !== descuento.id));
      toast({
        title: "Éxito",
        description: "Descuento eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting descuento:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el descuento",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="w-[100px]">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {descuentos.map((descuento) => (
          <TableRow key={descuento.id}>
            <TableCell>{descuento.codigo}</TableCell>
            <TableCell>
              {editingId === descuento.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="max-w-sm"
                />
              ) : (
                descuento.descripcion
              )}
            </TableCell>
            <TableCell>
              {editingId === descuento.id ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSave(descuento)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(descuento)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(descuento)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 