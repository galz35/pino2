import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Users, DollarSign, TrendingUp } from 'lucide-react';
import apiClient from '@/services/api-client';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import { Store as StoreModel, User } from '@/types';

interface ChainStats {
    totalStores: number;
    totalUsers: number;
    dailySalesVolume: number;
    monthlySalesVolume: number;
}

export default function ChainDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ChainStats | null>(null);
    const [stores, setStores] = useState<StoreModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Obtener tiendas a las que tiene acceso / su cadena
                const storesRes = await apiClient.get('/stores');
                const storeList: StoreModel[] = storesRes.data || [];
                setStores(storeList);

                // 2. Usuarios totales asignados a estas tiendas (esto se podria depurar, pero simulamos aqui /users endpoint scopeado)
                let userList: User[] = [];
                try {
                    const usersRes = await apiClient.get('/users');
                    userList = usersRes.data || [];
                } catch (e) {}

                // 3. Obtener ventas por tienda
                let dailyTotal = 0;
                let monthlyTotal = 0;

                const storeIds = storeList.map(s => s.id);
                // Si la cantidad de tiendas es razonable, hacemos fetch concurrente
                if (storeIds.length > 0) {
                    const statsPromises = storeIds.map(id =>
                        apiClient.get('/sales/dashboard-stats', { params: { storeId: id } })
                            .then(res => res.data)
                            .catch(() => ({ dailyTotal: 0, monthlyTotal: 0, weeklyTotal: 0 }))
                    );
                    const allStats = await Promise.all(statsPromises);
                    dailyTotal = allStats.reduce((acc, curr) => acc + (curr.dailyTotal || 0), 0);
                    monthlyTotal = allStats.reduce((acc, curr) => acc + (curr.monthlyTotal || 0), 0);
                }

                setStats({
                    totalStores: storeList.length,
                    totalUsers: userList.length,
                    dailySalesVolume: dailyTotal,
                    monthlySalesVolume: monthlyTotal
                });

            } catch (err) {
                console.error("Error loading chain dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Corporativo Multisucursal</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent><Skeleton className="h-8 w-20" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard Corporativo</h1>
                <p className="text-muted-foreground">Monitor en tiempo real de operaciones consolidado de la cadena multi-tienda.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volumen Diario Bruto</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.dailySalesVolume || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Facturación consolidada global de hoy.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volumen del Mes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.monthlySalesVolume || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Suma global en curso en toda la cadena.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sucursales Activas</CardTitle>
                        <Store className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStores || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tiendas operativas bajo el paraguas.</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Planilla Corporativa</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total de usuarios operando el sistema.</p>
                    </CardContent>
                </Card>
            </div>
            
            <h2 className="text-xl font-bold mt-8 mb-4 tracking-tight">Rendimiento por Sucursal</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores.map(store => (
                    <Card key={store.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.open(`/store/${store.id}/dashboard`, '_blank')}>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                {store.name}
                                <Store className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-4">{store.address || 'Sin dirección registrada'}</div>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Abierta</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {stores.length === 0 && !loading && (
                    <div className="col-span-full border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                        <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Aún no hay tiendas creadas en esta cadena.
                    </div>
                )}
            </div>
        </div>
    );
}
