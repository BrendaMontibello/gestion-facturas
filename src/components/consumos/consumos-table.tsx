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
import { ConsumoExtra } from '@/lib/types/consumos';
import { actualizarConsumoExtra, eliminarConsumoExtra } from '@/lib/services/consumos.service';
import { useToast } from '@/hooks/use-toast';

export function ConsumoExtraTable({ 
  extrasIniciales 
}: Readonly<{ 
  extrasIniciales: ConsumoExtra[] 
}>) {
  const [extras, setExtras] = useState(extrasIniciales);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { toast } = useToast();

  const handleEdit = (extra: ConsumoExtra) => {
    setEditingId(extra.id);
    setEditValue(extra.descripcion);
  };

  const handleSave = async (extra: ConsumoExtra) => {
    try {
      const updatedExtra = await actualizarConsumoExtra(extra.id, {
        ...extra,
        descripcion: editValue,
      });

      setExtras(extras.map(e => 
        e.id === extra.id ? updatedExtra : e
      ));
      
      setEditingId(null);
      toast({
        title: "Éxito",
        description: "Extra actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating extra:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el extra",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (extra: ConsumoExtra) => {
    try {
      await eliminarConsumoExtra(extra.id);
      setExtras(extras.filter(e => e.id !== extra.id));
      toast({
        title: "Éxito",
        description: "Extra eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting extra:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el extra",
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
        {extras.map((extra) => (
          <TableRow key={extra.id}>
            <TableCell>{extra.codigo}</TableCell>
            <TableCell>
              {editingId === extra.id ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="max-w-sm"
                />
              ) : (
                extra.descripcion
              )}
            </TableCell>
            <TableCell>
              {editingId === extra.id ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSave(extra)}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(extra)}
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
                  onClick={() => handleEdit(extra)}
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