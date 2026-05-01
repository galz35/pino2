import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveRegistersOverview } from './active-cash-registers';
import { SalesChart } from './sales-chart';
import { StatsCards } from './stats-cards';
import { Award, Package, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import apiClient from '@/services/api-client';

interface DashboardStats {
  dailySales: number;
  yesterdaySales: number;
  monthlySales: number;
  lastMonthSales: number;
  avgInvoice: number;
  lastMonthAvgInvoice: number;
  annualSales: number;
  annualChartData: { month: string; sales: number }[];
}

interface DeliveryStats {
  dailyDeliveries: number;
  pendingDeliveries: number;
  ordersToday: number;
  bestSalesManager: string;
}

interface StoreSettings {
  enableSalesManagerMode?: boolean;
}

interface StoreAdminDashboardMetricsProps {
  storeId: string;
}

export function StoreAdminDashboardMetrics({ storeId }: StoreAdminDashboardMetricsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Use the server-side aggregated endpoint instead of downloading all sales
        const [dashRes, storeRes] = await Promise.all([
          apiClient.get(`/sales/dashboard-stats`, { params: { storeId } }),
          apiClient.get(`/stores/${storeId}`),
        ]);

        setStats(dashRes.data);
        if (storeRes.data.settings) {
          setSettings(storeRes.data.settings);
        }

        // Delivery stats only if sales manager mode enabled
        if (storeRes.data.settings?.enableSalesManagerMode) {
          const delivRes = await apiClient.get(`/pending-deliveries/stats`, { params: { storeId } });
          setDeliveryStats(delivRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[250px] w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ActiveRegistersOverview storeId={storeId} />
      <SalesChart data={stats.annualChartData} />
      <StatsCards
        dailySales={stats.dailySales}
        yesterdaySales={stats.yesterdaySales}
        monthlySales={stats.monthlySales}
        lastMonthSales={stats.lastMonthSales}
        avgInvoice={stats.avgInvoice}
        lastMonthAvgInvoice={stats.lastMonthAvgInvoice}
        annualSales={stats.annualSales}
        lastYearSales={0}
      />
      {settings.enableSalesManagerMode && deliveryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregas del Día</CardTitle>
              <Truck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.dailyDeliveries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              <Package className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.pendingDeliveries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Levantados Hoy</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryStats.ordersToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Gestor (Mes)</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold truncate">{deliveryStats.bestSalesManager}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
