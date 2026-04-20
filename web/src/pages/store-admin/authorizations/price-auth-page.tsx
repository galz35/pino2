import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '@/services/api-client';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Order {
  id: string;
  clientName: string;
  total: number;
  status: string;
  priceLevel: number;
  items: any[];
}

export default function PriceAuthPage() {
  const { storeId } = useParams();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivos, setMotivos] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders?storeId=${storeId}&status=PENDIENTE_AUTORIZACION`);
      // Llenamos también los items
      const detailedOrders = await Promise.all(
        res.data.map(async (o: any) => {
          const detailRes = await apiClient.get(`/orders/${o.id}`);
          return detailRes.data;
        })
      );
      setOrders(detailedOrders);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeId]);

  const handleAuth = async (id: string, decision: 'aprobar' | 'rechazar') => {
    const motivo = motivos[id] || '';
    if (decision === 'rechazar' && !motivo) {
      toast({ title: 'Atención', description: 'Debe ingresar un motivo para rechazar', variant: 'destructive' });
      return;
    }
    try {
      await apiClient.post(`/orders/${id}/autorizar`, { decision, motivo });
      toast({ title: decision === 'aprobar' ? 'Pedido Aprobado' : 'Pedido Rechazado' });
      loadData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.message || e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Autorización de Precios Especiales</h1>
        <p className="text-muted-foreground">Revisión de pedidos con niveles de precio 4 o 5</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(o => (
          <div key={o.id} className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 border-b pb-4">
              <div className="bg-amber-100 p-2.5 rounded-full text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">{o.clientName}</h3>
                <p className="text-xs text-muted-foreground font-mono">#{o.id.substring(0,8)}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground">Nivel Solicitado</span>
                 <span className="font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Nivel {o.priceLevel}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground">Total Pedido</span>
                 <span className="font-bold">C$ {parseFloat(o.total as any).toFixed(2)}</span>
               </div>
               
               <div className="bg-muted px-3 py-2 rounded-lg mt-4 max-h-32 overflow-y-auto">
                 <p className="text-xs font-semibold mb-2">Productos Críticos:</p>
                 {o.items.map((i: any) => (
                   <div key={i.id} className="flex justify-between text-xs py-0.5">
                     <span className="truncate max-w-[140px] text-muted-foreground">{i.productName}</span>
                     <span>x{i.quantity} @ C$ {i.unitPrice}</span>
                   </div>
                 ))}
               </div>
            </div>

            <Input 
              placeholder="Observación o motivo..." 
              className="mb-4 text-sm"
              value={motivos[o.id] || ''}
              onChange={(e) => setMotivos({...motivos, [o.id]: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAuth(o.id, 'rechazar')}>
                <XCircle className="h-4 w-4 mr-2" /> Rechazar
              </Button>
              <Button onClick={() => handleAuth(o.id, 'aprobar')} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Aprobar
              </Button>
            </div>
          </div>
        ))}
        {orders.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 border rounded-xl border-dashed">
            No hay pedidos pendientes de autorización.
          </div>
        )}
      </div>
    </div>
  );
}
