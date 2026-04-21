import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/swalert';
import apiClient from '@/services/api-client';

interface Barcode {
  id: string;
  barcode: string;
  label: string | null;
  isPrimary: boolean;
}

interface AlternativeBarcodesProps {
  productId: string;
  storeId: string;
}

export function AlternativeBarcodes({ productId, storeId }: AlternativeBarcodesProps) {
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBarcode, setNewBarcode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [adding, setAdding] = useState(false);

  const loadBarcodes = async () => {
    try {
      const response = await apiClient.get(`/products/${productId}/barcodes`);
      setBarcodes(response.data);
    } catch (error) {
      console.error('Error fetching barcodes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarcodes();
  }, [productId]);

  const handleAdd = async () => {
    if (!newBarcode.trim()) {
      toast.error('Error', 'El código de barras es obligatorio');
      return;
    }

    setAdding(true);
    try {
      await apiClient.post(`/products/${productId}/barcodes`, {
        barcode: newBarcode.trim(),
        label: newLabel.trim() || undefined,
      });
      toast.success('Agregado', 'Código alternativo agregado con éxito');
      setNewBarcode('');
      setNewLabel('');
      loadBarcodes();
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'No se pudo agregar el código');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.delete(`/products/barcodes/${id}`);
      toast.success('Eliminado', 'Código eliminado correctamente');
      loadBarcodes();
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'No se pudo eliminar el código');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await apiClient.patch(`/products/barcodes/${id}/primary`, { productId });
      toast.success('Actualizado', 'Código establecido como principal');
      loadBarcodes();
    } catch (error: any) {
      toast.error('Error', error.response?.data?.message || 'No se pudo establecer como principal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="mt-6 border-orange-100">
      <CardHeader className="bg-orange-50/50 pb-4">
        <CardTitle className="text-xl text-[#1A367C]">Códigos Alternativos</CardTitle>
        <CardDescription>
          Agrega múltiples códigos de barras si el proveedor envia el mismo producto con diferentes presentaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-end gap-3 mb-6 bg-slate-50 p-4 rounded-lg border">
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-semibold uppercase text-slate-500">Nuevo Código</Label>
            <Input 
              placeholder="Ej: 7501000123" 
              value={newBarcode} 
              onChange={(e) => setNewBarcode(e.target.value)} 
              className="bg-white"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs font-semibold uppercase text-slate-500">Etiqueta (Opcional)</Label>
            <Input 
              placeholder="Ej: Nueva presentación" 
              value={newLabel} 
              onChange={(e) => setNewLabel(e.target.value)}
              className="bg-white"
            />
          </div>
          <Button onClick={handleAdd} disabled={adding} className="bg-[#1A367C] hover:bg-[#1A367C]/90">
            {adding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Agregar
          </Button>
        </div>

        <div className="space-y-3">
          {barcodes.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm hover:border-[#47A5D4] transition-colors">
              <div className="flex items-center gap-3">
                <div className="font-mono text-lg font-medium">{b.barcode}</div>
                {b.label && <span className="text-sm text-slate-500 ml-2">({b.label})</span>}
                {b.isPrimary && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-orange-700" /> Principal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!b.isPrimary && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleSetPrimary(b.id)} className="h-8 text-xs hover:text-[#1A367C]">
                      Hacer Principal
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemove(b.id)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {barcodes.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg bg-slate-50">
              No hay códigos alternativos registrados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
