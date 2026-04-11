import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Truck, AlertCircle } from 'lucide-react';
import apiClient from '@/services/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface QuickPulseData {
  pendingOrders: number;
  todaySalesCount: number;
  activeDeliveries: number;
  lowStockCount: number;
}

export function QuickOperationalPulse({ storeId }: { storeId: string }) {
  const [data, setData] = useState<QuickPulseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    const fetchPulse = async () => {
      setLoading(true);
      try {
        const [ordersRes, salesRes, deliveriesRes, productsRes] = await Promise.all([
          apiClient.get(`/orders?storeId=${storeId}&status=RECIBIDO`),
          apiClient.get(`/sales?storeId=${storeId}`), // We'll filter today in FE for simplicity if no specific endpoint
          apiClient.get(`/pending-deliveries?storeId=${storeId}`),
          apiClient.get(`/products?storeId=${storeId}`)
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaySales = salesRes.data.filter((s: any) => s.createdAt.startsWith(today)).length;
        
        // Simulating low stock check (stock < 10)
        const lowStock = productsRes.data.filter((p: any) => p.currentStock < 10).length;

        setData({
          pendingOrders: ordersRes.data.length,
          todaySalesCount: todaySales,
          activeDeliveries: deliveriesRes.data.filter((d: any) => d.status === 'PENDING' || d.status === 'IN_TRANSIT').length,
          lowStockCount: lowStock,
        });
      } catch (error) {
        console.error("Error fetching pulse data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPulse();
    const interval = setInterval(fetchPulse, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [storeId]);

  if (loading || !data) {
    return (
      <div className="grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <PulseItem 
        label="Caja" 
        value={`${data.todaySalesCount} Ventas`} 
        icon={ShoppingCart} 
        description="Hoy"
      />
      <PulseItem 
        label="Bodega" 
        value={`${data.pendingOrders} Pendientes`} 
        icon={Package} 
        color={data.pendingOrders > 0 ? "text-yellow-400" : "text-emerald-400"}
        highlight={data.pendingOrders > 0}
      />
      <PulseItem 
        label="En Ruta" 
        value={`${data.activeDeliveries} Pedidos`} 
        icon={Truck} 
        description="En curso"
      />
      <PulseItem 
        label="Stock" 
        value={`${data.lowStockCount} Alerta`} 
        icon={AlertCircle} 
        color={data.lowStockCount > 0 ? "text-red-400" : "text-emerald-400"}
        highlight={data.lowStockCount > 0}
      />
    </div>
  );
}

function PulseItem({ 
  label, 
  value, 
  icon: Icon, 
  description, 
  color = "text-white",
  highlight = false 
}: { 
  label: string; 
  value: string; 
  icon: any; 
  description?: string;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${highlight ? 'border-white/30 bg-white/20' : 'border-white/10 bg-white/10'} p-4 transition-all`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-2">
        <p className={`text-xl font-black ${color}`}>{value}</p>
        {description && <p className="text-[10px] text-white/40">{description}</p>}
      </div>
      {highlight && (
        <span className="absolute right-2 top-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
        </span>
      )}
    </div>
  );
}
