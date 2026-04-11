import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Loader2,
  Package,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import apiClient from '@/services/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Order {
  id: string;
  clientName: string;
  total: number;
  status: string;
  type: string;
  vendorName: string;
  createdAt: string;
  items?: any[];
}

const PIPELINE_COLUMNS = [
  {
    key: 'RECIBIDO',
    label: 'Recibido',
    icon: PackageOpen,
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'PREPARANDO',
    label: 'Preparando',
    icon: Package,
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'ALISTADO',
    label: 'Alistado',
    icon: PackageCheck,
    color: 'bg-indigo-500',
    lightBg: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'CARGADO',
    label: 'En Camión',
    icon: Truck,
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
];

export default function OrdersPipelinePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const res = await apiClient.get('/orders', { params: { storeId } });
      const data = Array.isArray(res.data) ? res.data : [];
      // Filter out terminal states
      const active = data.filter(
        (o: Order) => !['ENTREGADO', 'CANCELADO', 'RECHAZADO'].includes(o.status),
      );
      setOrders(active);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [storeId]);

  const grouped = PIPELINE_COLUMNS.map((col) => ({
    ...col,
    orders: orders.filter((o) => o.status === col.key),
  }));

  const totalActive = orders.length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/10">
              <Clock className="h-3 w-3 mr-1" /> Pipeline en vivo
            </Badge>
            <h1 className="text-3xl font-black tracking-tight">Pipeline de Pedidos</h1>
            <p className="text-sm text-white/70">
              {totalActive} pedido(s) activo(s) en proceso. Se actualiza automáticamente cada 15 segundos.
            </p>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </Button>
        </div>
      </section>

      {/* PIPELINE COLUMNS */}
      {loading && orders.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* STATUS BAR */}
          <div className="flex items-center gap-1 rounded-2xl bg-slate-100 p-2">
            {grouped.map((col, i) => {
              const pct = totalActive > 0 ? (col.orders.length / totalActive) * 100 : 0;
              return (
                <div key={col.key} className="flex items-center gap-1 flex-1">
                  <div
                    className={`h-3 ${col.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 5)}%`, minWidth: 12 }}
                    title={`${col.label}: ${col.orders.length}`}
                  />
                  {i < grouped.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* KANBAN GRID */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {grouped.map((col) => {
              const Icon = col.icon;
              return (
                <div key={col.key} className="space-y-3">
                  {/* Column header */}
                  <div className={`flex items-center justify-between rounded-2xl border p-4 ${col.lightBg}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-black">{col.label}</span>
                    </div>
                    <Badge className={`${col.badge} font-black text-lg px-3 py-1`}>
                      {col.orders.length}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 min-h-[120px]">
                    {col.orders.length === 0 ? (
                      <div className="flex items-center justify-center h-24 rounded-2xl border-2 border-dashed border-slate-200 text-sm text-muted-foreground">
                        Sin pedidos
                      </div>
                    ) : (
                      col.orders.map((order) => (
                        <Card key={order.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm truncate">{order.clientName || 'Sin cliente'}</p>
                              <span className="text-xs text-muted-foreground font-mono">
                                #{order.id?.substring(0, 6)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-black">
                                C$ {Number(order.total || 0).toFixed(2)}
                              </span>
                              {order.type && (
                                <Badge variant="outline" className="text-[10px] rounded-full">
                                  {order.type}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>{order.vendorName || '—'}</span>
                              <span>
                                {order.createdAt
                                  ? format(new Date(order.createdAt), 'HH:mm', { locale: es })
                                  : ''}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
