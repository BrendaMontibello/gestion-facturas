import { Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FacturaCompleta } from '@/lib/types/facturas';
import { downloadBillsInCsvFile, downloadBillsInExcelFileporLegajo, downloadBillsInTxtFile, getFacturaExcedente, getFacturaExtras, getFacturaSubTotal, getFacturaTotal } from '@/lib/services/factura.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalize } from '@/lib/utils';
import { calcularCuotaActual } from '@/lib/date';
import { aplicarConsumoExtraAFacturas } from '@/lib/services/consumos.service';
import { procesarArchivoConsumoExtraAplicar } from '@/lib/csv-parser';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '../ui/file-upload';
import { startOfMonth } from 'date-fns';
import { useBlockingLoading } from '@/hooks/use-blocking-loading';

export function FacturasTable({
  facturas,
  loading,
  month,
  year,
}: Readonly<{
  facturas: FacturaCompleta[];
  loading: boolean;
  month: number;
  year: number;
}>) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { startLoading, stopLoading } = useBlockingLoading();
    

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo CSV",
        variant: "destructive",
      });
      return;
    }
    startLoading("Procesando consumos...");
    setIsUploading(true);
    try {
      const extras = await procesarArchivoConsumoExtraAplicar(file);
      const resultado = await aplicarConsumoExtraAFacturas(extras, startOfMonth(new Date(year, month - 1, 1)));

      if (resultado.errores.length > 0) {
        toast({
          title: "Advertencia",
          description: `Se aplicaron ${resultado.aplicados.length} extras, pero hubo ${resultado.errores.length} errores`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Éxito",
          description: `Se aplicaron ${resultado.aplicados.length} extras correctamente`,
        });
      }
    } catch (error) {
      console.error('Error applying extras:', error);
      toast({
        title: "Error",
        description: "Hubo un error al aplicar los extras",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      stopLoading();
      window.location.reload();
    }
  };
  



  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <FileUpload
          onUpload={handleFileUpload}
          isLoading={isUploading}
          accept=".csv"
          helpText="Formato esperado: legajo, codigo, monto"
          buttonText="Cargar Consumos"
          loadingText="Aplicando consumos..."
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadBillsInCsvFile(facturas, month, year)}>
              CSV
            </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => downloadBillsInExcelFile(facturas, month, year)}>
                Excel
              </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => downloadBillsInExcelFileporLegajo(facturas, month, year)}>
              Excel (por legajo)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadBillsInTxtFile(facturas, month, year)}>
              TXT
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left font-semibold text-black">Legajo</TableHead>
            <TableHead className="font-semibold text-black">Nombre</TableHead>
            <TableHead className="text-center font-semibold text-black">Cuota</TableHead>
            <TableHead className="text-right font-semibold text-black">Disponible</TableHead>
            <TableHead className="text-right font-semibold text-black">Subtotal</TableHead>
            <TableHead className="text-right font-semibold text-black">Extras</TableHead>
            <TableHead className="text-right font-semibold text-black">Excedente</TableHead>
            <TableHead className="text-right font-semibold text-black">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((factura) => (
            <TableRow key={factura.id}>
              <TableCell className="text-left">{factura.contracts.users.legajo}</TableCell>
              <TableCell >
                {capitalize(`${factura.contracts.users.apellido}, ${factura.contracts.users.nombre}`)}
              </TableCell>
              <TableCell className="text-center">{factura.contracts.estado === 'cobranza manual' ? 'N/A' : calcularCuotaActual(factura.contracts.fecha_inicio)}</TableCell>
              <TableCell className="text-right">${factura.contracts.estado === 'cobranza manual' ? 'N/A' : factura.contracts.disponible?.toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} ) ?? 'N/A'}</TableCell>
              <TableCell className="text-right">${getFacturaSubTotal(factura).toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} ) ?? 'N/A'}</TableCell>
              <TableCell className="text-right">${getFacturaExtras(factura).toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} ) ?? 'N/A'}</TableCell>
              <TableCell className="text-right">${factura.contracts.estado === 'cobranza manual' ? 'N/A' : getFacturaExcedente(factura).toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} ) ?? 'N/A'}</TableCell>
              <TableCell className="text-right font-bold">
                ${getFacturaTotal(factura).toLocaleString("es", {minimumFractionDigits: 2, maximumFractionDigits: 2} )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
