import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Loader2,
  RefreshCw,
  Store,
  TrendingUp,
} from 'lucide-react';
import { startOfDay, startOfMonth, format, parseISO, isToday } from 'date-fns';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StoreData {
  id: string;
  name: string;
  dailySales: number;
  monthlySales: number;
  dailyCount: number;
  monthlyCount: number;
  pendingOrders: number;
}

export default function MultiStoreComparisonPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const storesRes = await apiClient.get('/stores');
      const storeList = Array.isArray(storesRes.data) ? storesRes.data : [];

      const results: StoreData[] = await Promise.all(
        storeList.map(async (store: any) => {
          try {
            const [salesRes, ordersRes] = await Promise.all([
              apiClient.get('/sales', { params: { storeId: store.id } }),
              apiClient.get('/orders', { params: { storeId: store.id } }),
            ]);

            const sales = Array.isArray(salesRes.data) ? salesRes.data : [];
            const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

            const todayStart = startOfDay(new Date());
            const monthStart = startOfMonth(new Date());

            const todaySales = sales.filter((s: any) => {
              const d = parseISO(s.createdAt);
              return d >= todayStart;
            });

            const monthSales = sales.filter((s: any) => {
              const d = parseISO(s.createdAt);
              return d >= monthStart;
            });

            const pendingOrders = orders.filter(
              (o: any) => !['ENTREGADO', 'CANCELADO', 'RECHAZADO'].includes(o.status),
            );

            return {
              id: store.id,
              name: store.name || 'Sin nombre',
              dailySales: todaySales.reduce((s: number, x: any) => s + Number(x.total || 0), 0),
              monthlySales: monthSales.reduce((s: number, x: any) => s + Number(x.total || 0), 0),
              dailyCount: todaySales.length,
              monthlyCount: monthSales.length,
              pendingOrders: pendingOrders.length,
            };
          } catch {
            return {
              id: store.id,
              name: store.name || 'Sin nombre',
              dailySales: 0,
              monthlySales: 0,
              dailyCount: 0,
              monthlyCount: 0,
              pendingOrders: 0,
            };
          }
        }),
      );

      setStores(results.sort((a, b) => b.monthlySales - a.monthlySales));
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = useMemo(
    () => ({
      dailySales: stores.reduce((s, st) => s + st.dailySales, 0),
      monthlySales: stores.reduce((s, st) => s + st.monthlySales, 0),
      dailyCount: stores.reduce((s, st) => s + st.dailyCount, 0),
      monthlyCount: stores.reduce((s, st) => s + st.monthlyCount, 0),
      pendingOrders: stores.reduce((s, st) => s + st.pendingOrders, 0),
    }),
    [stores],
  );

  const maxMonthlySales = Math.max(...stores.map((s) => s.monthlySales), 1);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-800 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/10">
              <BarChart3 className="h-3 w-3 mr-1" /> Consolidado
            </Badge>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Comparativa Multitienda</h1>
              <p className="text-sm text-white/70">
                {stores.length} sucursal(es) · {format(new Date(), "MMMM yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Ventas Hoy</p>
              <p className="mt-1 text-xl font-black">C$ {totals.dailySales.toFixed(2)}</p>
              <p className="text-[10px] text-white/40">{totals.dailyCount} tickets</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Ventas Mes</p>
              <p className="mt-1 text-xl font-black">C$ {totals.monthlySales.toFixed(2)}</p>
              <p className="text-[10px] text-white/40">{totals.monthlyCount} tickets</p>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/20 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Pedidos Activos</p>
              <p className="mt-1 text-xl font-black">{totals.pendingOrders}</p>
              <p className="text-[10px] text-white/40">En proceso global</p>
            </div>
          </div>
        </div>
      </section>

      {/* REFRESH */}
      <div className="flex justify-end">
        <Button onClick={fetchData} variant="outline" className="rounded-xl" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* VISUAL BAR CHART */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Ranking por Ventas del Mes
              </CardTitle>
              <CardDescription>
                Cada barra es proporcional a la tienda con mayor facturación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stores.map((store, i) => {
                const pct = (store.monthlySales / maxMonthlySales) * 100;
                const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                return (
                  <div key={store.id} className="flex items-center gap-3">
                    <div className="w-8 text-right text-xs font-black text-muted-foreground">
                      #{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold flex items-center gap-1">
                          <Store className="h-3 w-3 text-muted-foreground" />
                          {store.name}
                        </span>
                        <span className="text-sm font-mono font-black">
                          C$ {store.monthlySales.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* TABLE */}
          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead className="text-right">Ventas Hoy</TableHead>
                  <TableHead className="text-right">Tickets Hoy</TableHead>
                  <TableHead className="text-right">Ventas Mes</TableHead>
                  <TableHead className="text-right">Tickets Mes</TableHead>
                  <TableHead className="text-right">Pedidos Activos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store, i) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-black text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {store.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold">{store.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      C$ {store.dailySales.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{store.dailyCount}</TableCell>
                    <TableCell className="text-right font-mono font-black text-lg">
                      C$ {store.monthlySales.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">{store.monthlyCount}</TableCell>
                    <TableCell className="text-right">
                      {store.pendingOrders > 0 ? (
                        <Badge variant="destructive" className="font-mono">
                          {store.pendingOrders}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-mono">0</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* TOTALS */}
            <div className="border-t bg-slate-50 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                Totales ({stores.length} tiendas)
              </p>
              <div className="flex gap-6 text-sm font-mono">
                <span>Hoy: <strong>C$ {totals.dailySales.toFixed(2)}</strong></span>
                <span className="text-lg font-black">Mes: C$ {totals.monthlySales.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
