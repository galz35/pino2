import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, ListOrdered, Eye, ArrowLeft, Package, Search } from 'lucide-react';
import apiClient from '@/services/api-client';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentType?: string;
  createdAt: string;
  items?: OrderItem[];
  history?: { status: string; userName: string; createdAt: string }[];
}

const statusColor: Record<string, string> = {
  RECIBIDO: 'bg-blue-100 text-blue-800',
  EN_PREPARACION: 'bg-amber-100 text-amber-800',
  ALISTADO: 'bg-sky-100 text-sky-800',
  CARGADO_CAMION: 'bg-emerald-100 text-emerald-800',
  EN_ENTREGA: 'bg-violet-100 text-violet-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
  Pagada: 'bg-emerald-100 text-emerald-800',
  'Pendiente de Pago': 'bg-amber-100 text-amber-800',
  PENDING: 'bg-amber-100 text-amber-800',
};

const statusLabel: Record<string, string> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'Preparando',
  ALISTADO: 'Listo',
  CARGADO_CAMION: 'Cargado',
  EN_ENTREGA: 'En ruta',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  Pagada: 'Pagada',
  'Pendiente de Pago': 'Pendiente',
  PENDING: 'Pendiente',
};

export function ClientHistoryDialog({
  clientId,
  clientName,
  storeId,
}: {
  clientId: string;
  clientName: string;
  storeId: string;
}) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [headerFilters, setHeaderFilters] = useState({ dateFrom: '', dateTo: '', status: '', payment: '' });

  // Detail view state
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (open && clientId && storeId) {
      setLoading(true);
      setDetailOrder(null);
      apiClient
        .get('/orders', { params: { storeId, clientId, limit: 50 } })
        .then((res) => {
          setOrders(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [open, clientId, storeId]);

  const handleViewDetail = async (order: Order) => {
    setDetailLoading(true);
    setDetailOrder(order);
    try {
      const res = await apiClient.get(`/orders/${order.id}`);
      setDetailOrder(res.data);
    } catch {
      // Keep basic order info if detail fails
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const fStatus = headerFilters.status.toLowerCase();
    const fPayment = headerFilters.payment.toLowerCase();
    const createdStr = format(new Date(o.createdAt), 'yyyy-MM-dd');
    const matchesFrom = headerFilters.dateFrom ? createdStr >= headerFilters.dateFrom : true;
    const matchesTo = headerFilters.dateTo ? createdStr <= headerFilters.dateTo : true;

    return (
      (statusLabel[o.status] || o.status).toLowerCase().includes(fStatus) &&
      (o.paymentType?.toLowerCase() || '').includes(fPayment) &&
      matchesFrom && matchesTo
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
          <ListOrdered className="h-4 w-4" /> Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          {detailOrder ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setDetailOrder(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Detalle del Pedido</DialogTitle>
              <Badge className={statusColor[detailOrder.status] || 'bg-slate-100 text-slate-800'}>
                {statusLabel[detailOrder.status] || detailOrder.status}
              </Badge>
            </div>
          ) : (
            <DialogTitle>Historial de Compras — {clientName}</DialogTitle>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Este cliente no tiene pedidos registrados.
          </div>
        ) : detailOrder ? (
          // --- DETAIL VIEW ---
          detailLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-b pb-4">
                <p><strong>Fecha:</strong> {format(new Date(detailOrder.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                <p><strong>Tipo de Pago:</strong> <span className={detailOrder.paymentType === 'Crédito' ? 'text-amber-600 font-bold' : ''}>{detailOrder.paymentType || 'CONTADO'}</span></p>
              </div>

              {/* PRODUCTS */}
              {detailOrder.items && detailOrder.items.length > 0 ? (
                <div className="border rounded-md max-h-[30vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-center">Cant.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailOrder.items.map((item, idx) => (
                        <TableRow key={item.id || idx}>
                          <TableCell className="text-sm font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right text-muted-foreground">C$ {Number(item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">C$ {Number(item.subtotal || (item.unitPrice * item.quantity)).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-4 text-center flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-30" />
                  <p>Sin detalle de productos.</p>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 pb-4">
                <span>Total del pedido</span>
                <span>C$ {Number(detailOrder.total).toFixed(2)}</span>
              </div>

              {/* HISTORY */}
              {detailOrder.history && detailOrder.history.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3">Historial de Estados</h3>
                  <div className="space-y-3">
                    {detailOrder.history.map((h, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm bg-muted/30 p-2 rounded-md">
                        <span className="font-medium min-w-[120px]">{format(new Date(h.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        <Badge className={`${statusColor[h.status] || 'bg-slate-100 text-slate-800'} text-[10px] w-fit`}>
                          {statusLabel[h.status] || h.status}
                        </Badge>
                        <span className="text-muted-foreground ml-auto pr-2 text-xs">por {h.userName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          // --- LIST VIEW ---
          <div className="overflow-y-auto max-h-[60vh] border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>
                    Fecha
                    <div className="flex flex-col gap-1 mt-1">
                      <Input type="date" className="h-6 text-xs p-1 font-normal w-full" value={headerFilters.dateFrom} onChange={e => setHeaderFilters({...headerFilters, dateFrom: e.target.value})} title="Desde" />
                      <Input type="date" className="h-6 text-xs p-1 font-normal w-full" value={headerFilters.dateTo} onChange={e => setHeaderFilters({...headerFilters, dateTo: e.target.value})} title="Hasta" />
                    </div>
                  </TableHead>
                  <TableHead>
                    Estado
                    <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.status} onChange={e => setHeaderFilters({...headerFilters, status: e.target.value})} />
                  </TableHead>
                  <TableHead>
                    Pago
                    <Input placeholder="Filtrar..." className="h-6 mt-1 text-xs font-normal" value={headerFilters.payment} onChange={e => setHeaderFilters({...headerFilters, payment: e.target.value})} />
                  </TableHead>
                  <TableHead className="text-right align-top pt-4">Total</TableHead>
                  <TableHead className="w-12 align-top pt-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(o)}>
                    <TableCell className="text-sm">
                      {format(new Date(o.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor[o.status] || 'bg-slate-100 text-slate-800'}>
                        {statusLabel[o.status] || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={o.paymentType === 'Crédito' ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}>
                        {o.paymentType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      C$ {Number(o.total).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
