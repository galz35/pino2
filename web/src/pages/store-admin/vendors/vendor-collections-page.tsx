import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CircleDollarSign,
  HandCoins,
  Info,
  Loader2,
  Search,
  UserRound,
  Wallet,
} from 'lucide-react';

import apiClient from '@/services/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Account {
  id: string;
  clientName: string;
  pendingAmount: number;
  description?: string;
  orderId?: string;
}

type PaymentMethod = 'Efectivo' | 'Transferencia';

export default function VendorCollectionsPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/accounts-receivable', {
        params: { storeId, pending: true },
      });
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las cuentas pendientes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      void fetchAccounts();
    }
  }, [storeId]);

  const visibleAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const sorted = [...accounts].sort(
      (a, b) => b.pendingAmount - a.pendingAmount,
    );

    if (!normalizedSearch) {
      return sorted;
    }

    return sorted.filter((account) =>
      [account.clientName, account.description, account.orderId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [accounts, search]);

  const totalPending = useMemo(
    () => accounts.reduce((sum, account) => sum + account.pendingAmount, 0),
    [accounts],
  );

  const largestPending = useMemo(
    () =>
      accounts.reduce(
        (max, account) => Math.max(max, account.pendingAmount),
        0,
      ),
    [accounts],
  );

  const handleCollect = (account: Account) => {
    setSelectedAccount(account);
    setPaymentAmount(account.pendingAmount.toFixed(2));
    setPaymentMethod('Efectivo');
    setIsDialogOpen(true);
  };

  const processPayment = async () => {
    if (!selectedAccount || !user || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (
      Number.isNaN(amount) ||
      amount <= 0 ||
      amount > selectedAccount.pendingAmount
    ) {
      toast({
        variant: 'destructive',
        title: 'Monto inválido',
        description: 'Revisa el monto antes de registrar el cobro.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.post(`/accounts-receivable/${selectedAccount.id}/payments`, {
        amount,
        paymentMethod,
        vendorId: user.id,
        vendorName: user.name,
      });

      toast({
        title: 'Pago registrado',
        description: `Abono de C$ ${amount.toFixed(2)} para ${selectedAccount.clientName}.`,
      });
      setIsDialogOpen(false);
      setSelectedAccount(null);
      setPaymentAmount('');
      await fetchAccounts();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error al pagar',
        description: 'No se pudo registrar el cobro.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-700 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Cobranza en ruta
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="Cuentas"
              value={`${accounts.length}`}
              icon={UserRound}
            />
            <MetricCard
              label="Pendiente total"
              value={`C$ ${totalPending.toFixed(2)}`}
              icon={Wallet}
            />
            <MetricCard
              label="Saldo mayor"
              value={`C$ ${largestPending.toFixed(2)}`}
              icon={CircleDollarSign}
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar cliente o referencia..."
              className="h-12 rounded-xl border-white/20 bg-white/10 pl-11 text-white placeholder:text-white/65"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {loading ? (
            <Card className="border-dashed">
              <CardContent className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : visibleAccounts.length === 0 ? (
            <Alert className="rounded-2xl border-emerald-200 bg-emerald-50">
              <Info className="h-4 w-4" />
              <AlertTitle>Todo al día</AlertTitle>
              <AlertDescription>
                No hay cuentas pendientes para el filtro actual.
              </AlertDescription>
            </Alert>
          ) : (
            visibleAccounts.map((account) => (
              <Card
                key={account.id}
                className="overflow-hidden rounded-3xl border-slate-200 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          Cuenta pendiente
                        </Badge>
                        {account.orderId ? (
                          <Badge variant="outline" className="rounded-full">
                            Pedido {account.orderId.slice(0, 8)}
                          </Badge>
                        ) : null}
                      </div>

                      <div>
                        <h2 className="text-lg font-black tracking-tight text-slate-900">
                          {account.clientName}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {account.description || 'Cobro pendiente por pedido o crédito registrado.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3 lg:items-end">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Saldo pendiente
                        </p>
                        <p className="text-2xl font-black text-slate-950">
                          C$ {account.pendingAmount.toFixed(2)}
                        </p>
                      </div>

                      <Button
                        size="lg"
                        className="w-full rounded-2xl font-bold lg:w-auto"
                        onClick={() => handleCollect(account)}
                      >
                        <HandCoins className="mr-2 h-4 w-4" />
                        Cobrar ahora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Registrar cobro
            </DialogTitle>
            <DialogDescription>
              Confirma el monto y el método para {selectedAccount?.clientName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Saldo actual
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                C$ {selectedAccount?.pendingAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="paymentAmount">Monto a cobrar</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
                className="h-14 text-xl font-bold"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPaymentAmount(
                      selectedAccount?.pendingAmount.toFixed(2) || '',
                    )
                  }
                >
                  Saldo completo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setPaymentAmount(
                      ((selectedAccount?.pendingAmount || 0) / 2).toFixed(2),
                    )
                  }
                >
                  Mitad
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Método de pago</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(['Efectivo', 'Transferencia'] as PaymentMethod[]).map(
                  (method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={
                        paymentMethod === method ? 'default' : 'outline'
                      }
                      className="h-12 justify-start rounded-2xl font-semibold"
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={processPayment} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <HandCoins className="mr-2 h-4 w-4" />
              )}
              Confirmar cobro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-white/70">
          {label}
        </p>
        <Icon className="h-4 w-4 text-white/75" />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
