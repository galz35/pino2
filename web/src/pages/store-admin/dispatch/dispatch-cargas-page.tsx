import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '@/services/api-client';
import { useToast } from '@/hooks/use-toast';
import { Truck, ArrowRight, FileText, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Carga {
  id: string;
  ruteroId: string;
  camionPlaca: string;
  fechaCarga: string;
  status: string;
  totalPedidos: number;
  totalBultos: number;
  totalUnidadesSueltas: number;
}

export default function DispatchCargasPage() {
  const { storeId } = useParams();
  const { toast } = useToast();
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/cargas-camion?storeId=${storeId}`);
      setCargas(res.data);
    } catch (e: any) {
      toast({ title: 'Error cargando cargas', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeId]);

  const viewDetails = async (id: string) => {
    try {
      const res = await apiClient.get(`/cargas-camion/${id}`);
      setSelectedCarga(res.data);
      setIsModalOpen(true);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const despacharCarga = async (id: string) => {
    try {
      await apiClient.put(`/cargas-camion/${id}/salida`);
      toast({ title: 'Carga despachada exitosamente' });
      setIsModalOpen(false);
      loadData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Cargas del Día</h1>
        <p className="text-muted-foreground">Listado de consolidaciones de carga asignadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargas.map(c => (
          <div key={c.id} className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'EN_RUTA' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {c.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="mb-4">
               <h3 className="font-semibold text-lg">Camión: {c.camionPlaca || 'No asignada'}</h3>
               <p className="text-sm text-muted-foreground">Fecha: {new Date(c.fechaCarga).toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Pedidos</span>
                <span className="font-bold">{c.totalPedidos}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Bultos</span>
                <span className="font-bold">{c.totalBultos}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Sueltas</span>
                <span className="font-bold">{c.totalUnidadesSueltas}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={() => viewDetails(c.id)}>
              <FileText className="h-4 w-4" />
              Ver Detalles
            </Button>
          </div>
        ))}
        {cargas.length === 0 && !loading && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground bg-muted/20 border rounded-xl border-dashed">
            No hay cargas registradas hoy. Vaya a Panel de Despacho.
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Consolidación de Carga</DialogTitle>
          </DialogHeader>
          {selectedCarga && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border">
                 <div>
                   <p className="text-xs text-muted-foreground">Camión Placa</p>
                   <p className="font-medium">{selectedCarga.camionPlaca || 'N/A'}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Rutero Asignado</p>
                   <p className="font-medium">{selectedCarga.ruteroId}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Fecha Planificada</p>
                   <p className="font-medium">{new Date(selectedCarga.fechaCarga).toLocaleString()}</p>
                 </div>
                 <div>
                   <p className="text-xs text-muted-foreground">Estado</p>
                   <p className="font-medium">{selectedCarga.status}</p>
                 </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 border-b pb-2 flex items-center justify-between">
                  Lista de Recolección (Picking)
                  <Button variant="outline" size="sm" className="gap-2"><FileText className="h-4 w-4" /> PDF</Button>
                </h4>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-bold bg-muted px-2 py-1 rounded mb-2">BULTOS SELLADOS</h5>
                    <ul className="text-sm space-y-1">
                      {selectedCarga.consolidado.listaBultos.map((b: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-border/50 py-1">
                          <span className="text-muted-foreground">{b.productName}</span>
                          <span className="font-bold">{b.bultos}</span>
                        </li>
                      ))}
                      {selectedCarga.consolidado.listaBultos.length === 0 && <span className="text-xs text-muted-foreground italic">No hay bultos.</span>}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold bg-muted px-2 py-1 rounded mb-2">UNIDADES SUELTAS</h5>
                    <ul className="text-sm space-y-1">
                      {selectedCarga.consolidado.listaUnidades.map((u: any, i: number) => (
                        <li key={i} className="flex justify-between border-b border-border/50 py-1">
                          <span className="text-muted-foreground">{u.productName}</span>
                          <span className="font-bold">{u.sueltas}</span>
                        </li>
                      ))}
                      {selectedCarga.consolidado.listaUnidades.length === 0 && <span className="text-xs text-muted-foreground italic">No hay unidades sueltas.</span>}
                    </ul>
                  </div>
                </div>
              </div>

              {selectedCarga.status === 'PENDIENTE_SALIDA' && (
                <Button className="w-full mt-4 gap-2 text-lg h-12" onClick={() => despacharCarga(selectedCarga.id)}>
                   <PackageCheck className="h-5 w-5" /> Dar Salida a Ruta
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
