import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  HandCoins,
  Package,
  ShoppingCart,
  Truck,
} from 'lucide-react';

import apiClient from '@/services/api-client';
import { StoreAdminDashboardMetrics } from '@/components/dashboard/store-admin-dashboard-metrics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);
  const { storeId = '' } = useParams();

  useEffect(() => {
    if (!storeId) return;

    const fetchStoreName = async () => {
      try {
        const res = await apiClient.get(`/stores/${storeId}`);
        setStoreName(res.data?.name || 'Tienda');
      } catch {
        setStoreName('Tienda');
      } finally {
        setLoading(false);
      }
    };

    void fetchStoreName();
  }, [storeId]);

  const quickActions = useMemo(
    () => [
      {
        title: 'Facturar',
        description: 'Entrar directo a caja y registrar una venta.',
        href: `/store/${storeId}/billing`,
        icon: ShoppingCart,
      },
      {
        title: 'Bodega',
        description: 'Mover pedidos, alistar y cargar camiones.',
        href: `/store/${storeId}/warehouse`,
        icon: Boxes,
      },
      {
        title: 'Despacho',
        description: 'Ver pendientes y coordinar salida de pedidos.',
        href: `/store/${storeId}/pending-orders`,
        icon: Truck,
      },
      {
        title: 'Cobranza',
        description: 'Entrar a cuentas por cobrar y seguimiento.',
        href: `/store/${storeId}/finance/receivables`,
        icon: HandCoins,
      },
    ],
    [storeId],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-3xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/10">
              Centro de control
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">
                Panel de tienda
              </h1>
              <p className="text-lg font-semibold text-white">
                {storeName}
              </p>
              <p className="max-w-2xl text-sm text-sky-50/85">
                Usa esta vista para entrar rápido a venta, bodega, despacho y
                cobranza. El objetivo es decidir y actuar, no navegar de más.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatusChip label="Caja" value="Lista para operar" />
            <StatusChip label="Bodega" value="Seguimiento vivo" />
            <StatusChip label="Ruta" value="Pedidos y despacho" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="rounded-3xl border-slate-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    Acción rápida
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl font-black">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {action.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full rounded-2xl font-semibold">
                  <Link to={action.href}>
                    Abrir
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            Resumen operativo
          </CardTitle>
          <CardDescription>
            Métricas financieras y de despacho para tomar decisiones rápidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreAdminDashboardMetrics storeId={storeId} />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50/70">
        <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">
              Si la operación está corriendo, entra por la acción y no por el menú.
            </p>
            <p className="text-sm text-muted-foreground">
              Este panel debe servir para arrancar la tarea correcta en segundos.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/store/${storeId}/products`}>
                <Package className="mr-2 h-4 w-4" />
                Productos
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/store/${storeId}/warehouse`}>
                <Boxes className="mr-2 h-4 w-4" />
                Ir a bodega
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/70">
        {label}
      </p>
      <p className="mt-3 text-lg font-black text-white">{value}</p>
    </div>
  );
}
