import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import apiClient from '@/services/api-client';
import { format } from 'date-fns';

export interface PendingTicket {
    id: string;
    clientId?: string;
    clientName?: string;
    total: number;
    items: any[];
    created_at: string;
    dispatcherName?: string;
}

export function PendingTicketsDialog({ open, onOpenChange, storeId, onSelectTicket }: { open: boolean; onOpenChange: (open: boolean) => void; storeId: string; onSelectTicket: (ticket: PendingTicket) => void }) {
    const [tickets, setTickets] = useState<PendingTicket[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTickets = async () => {
        if (!storeId || !open) return;
        setLoading(true);
        try {
            console.log('Fetching tickets for store:', storeId);
            const res = await apiClient.get('/pending-orders', { params: { storeId, status: 'Pendiente' } });
            console.log('Tickets response:', res.data);
            setTickets(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error fetching tickets', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchTickets();
    }, [open, storeId]);

    const handleSelect = async (ticket: PendingTicket) => {
        onSelectTicket(ticket);
        
        // Lo marcamos en proceso localmente para que no lo agarre otro cajero fácilmente
        try {
            await apiClient.patch(`/pending-orders/${ticket.id}/status`, { status: 'Procesando Caja' });
        } catch(e) {}
        
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
                <DialogHeader className="bg-white p-8 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-slate-800 italic flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-500" /> Tickets de Mostrador
                            </DialogTitle>
                            <DialogDescription className="font-bold text-slate-400 uppercase text-xs mt-2">
                                Comandas pre-ingresadas por despachadores esperando cobro
                            </DialogDescription>
                        </div>
                        <Button variant="outline" size="icon" onClick={fetchTickets} disabled={loading} className="rounded-full shadow-sm">
                            <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[30px] border-2 border-dashed border-slate-200 shadow-sm">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                            <p className="font-black text-slate-300 uppercase italic">No hay tickets pendientes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="bg-white border-2 border-slate-100 rounded-[30px] p-6 hover:border-blue-500 hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</span>
                                            <span className="font-black text-slate-800 uppercase text-lg leading-tight">{ticket.clientName || 'ANÓNIMO'}</span>
                                            <span className="text-xs font-bold text-slate-400 mt-1">Vend: {ticket.dispatcherName || 'Despachador'}</span>
                                        </div>
                                        <Badge className="bg-blue-50 text-blue-600 font-black tracking-widest text-[10px] py-1 border-none">
                                            {ticket.created_at ? format(new Date(ticket.created_at), 'HH:mm') : '--:--'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                                        <p className="text-xs font-black text-blue-500 uppercase italic">{(ticket.items || []).length} Ítems</p>
                                        <p className="text-2xl font-black text-slate-800 font-mono tracking-tighter">C$ {Number(ticket.total || 0).toFixed(0)}</p>
                                    </div>
                                    <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-tighter h-12 shadow-lg shadow-emerald-100 transition-all active:scale-95" onClick={() => handleSelect(ticket)}>
                                        Cobrar Ticket
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
