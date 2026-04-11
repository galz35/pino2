import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Phone, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/services/api-client';
import { AddClientDialog } from '@/components/pos/add-client-dialog';
import { ClientHistoryDialog } from '@/components/pos/client-history-dialog';
import { normalizeUserRole } from '@/lib/user-role';

interface Client { id: string; name: string; phone?: string; address: string; vendorId?: string; zoneId?: string; isCreditClient?: boolean; }

export default function VendorClientsPage() {
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [vendors, setVendors] = useState<Record<string, string>>({});
    const [zones, setZones] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [headerFilters, setHeaderFilters] = useState({ name: '', phone: '', address: '', zone: '', vendor: '' });

    const fetchData = async () => {
        if (!storeId) return;
        try {
            const [usersRes, zonesRes, clientsRes] = await Promise.all([
                apiClient.get('/users', { params: { storeId } }),
                apiClient.get('/store-zones', { params: { storeId } }),
                apiClient.get('/clients', { params: { storeId } }),
            ]);
            const vendorMap: Record<string, string> = {};
            const vendors = (usersRes.data || []).filter((u: any) => normalizeUserRole(u.role) === 'vendor');
            vendors.forEach((v: any) => { vendorMap[v.id || v.uid] = v.name; });
            setVendors(vendorMap);
            const zoneMap: Record<string, string> = {};
            (zonesRes.data || []).forEach((z: any) => { zoneMap[z.id] = z.name; });
            setZones(zoneMap);
            setClients(clientsRes.data || []);
        } catch { 
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!storeId) return;
        fetchData();
    }, [storeId]);

    const filteredClients = clients.filter(c => {
        const vendorName = vendors[c.vendorId || ''] || 'No asignado';
        const zoneName = zones[c.zoneId || ''] || 'Sin zona';
        
        return (
            c.name.toLowerCase().includes(headerFilters.name.toLowerCase()) &&
            (c.phone || '').toLowerCase().includes(headerFilters.phone.toLowerCase()) &&
            c.address.toLowerCase().includes(headerFilters.address.toLowerCase()) &&
            zoneName.toLowerCase().includes(headerFilters.zone.toLowerCase()) &&
            vendorName.toLowerCase().includes(headerFilters.vendor.toLowerCase())
        );
    });

    const handleClientAdded = (client: Client) => {
        setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1><p className="text-muted-foreground">Listado de clientes vinculados.</p></div>
                <div className="flex items-center gap-2">
                    <AddClientDialog onClientAdded={handleClientAdded} />
                    <Button onClick={() => navigate(`/store/${storeId}/vendors/quick-sale`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Venta rápida
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Listado de Clientes</CardTitle>
                </CardHeader>
                <CardContent><div className="rounded-md border"><Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Nombre
                                <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.name} onChange={e => setHeaderFilters({...headerFilters, name: e.target.value})} />
                            </TableHead>
                            <TableHead>
                                Contacto
                                <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.phone} onChange={e => setHeaderFilters({...headerFilters, phone: e.target.value})} />
                            </TableHead>
                            <TableHead>
                                Dirección
                                <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.address} onChange={e => setHeaderFilters({...headerFilters, address: e.target.value})} />
                            </TableHead>
                            <TableHead>
                                Zona
                                <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.zone} onChange={e => setHeaderFilters({...headerFilters, zone: e.target.value})} />
                            </TableHead>
                            <TableHead>
                                Vendedor
                                <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.vendor} onChange={e => setHeaderFilters({...headerFilters, vendor: e.target.value})} />
                            </TableHead>
                            <TableHead className="align-top pt-4">Crédito</TableHead>
                            <TableHead className="align-top pt-4 w-24 text-center">Historial</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-48" /></TableCell><TableCell><Skeleton className="h-4 w-24" /></TableCell><TableCell><Skeleton className="h-4 w-32" /></TableCell><TableCell><Skeleton className="h-4 w-16" /></TableCell><TableCell><Skeleton className="h-6 w-16" /></TableCell></TableRow>)))
                        : filteredClients.length === 0 ? (<TableRow><TableCell colSpan={7} className="h-24 text-center">No se encontraron clientes.</TableCell></TableRow>)
                        : (filteredClients.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.name}</TableCell>
                                <TableCell><span className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" /> {client.phone || 'N/A'}</span></TableCell>
                                <TableCell><span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" /> {client.address}</span></TableCell>
                                <TableCell><Badge variant="outline">{client.zoneId ? (zones[client.zoneId] || '...') : 'Sin zona'}</Badge></TableCell>
                                <TableCell><Badge variant="secondary">{client.vendorId ? (vendors[client.vendorId] || '...') : 'No asignado'}</Badge></TableCell>
                                <TableCell>{client.isCreditClient ? (<Badge className="bg-green-600">Habilitado</Badge>) : (<Badge variant="outline">Inactivo</Badge>)}</TableCell>
                                <TableCell className="text-center">
                                    <ClientHistoryDialog 
                                        storeId={storeId!} 
                                        clientId={client.id} 
                                        clientName={client.name} 
                                    />
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table></div></CardContent>
            </Card>
        </div>
    );
}
