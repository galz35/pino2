import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  DollarSign,
  Loader2,
  MinusCircle,
  PackageSearch,
  PlusCircle,
  Search,
  ShoppingBag,
  User,
} from 'lucide-react';

import apiClient from '@/services/api-client';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { AddClientDialog } from '@/components/pos/add-client-dialog';
import { ClientSelectionDialog } from '@/components/pos/client-selection-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: string;
  description: string;
  salePrice: number;
  costPrice?: number;
  barcode?: string;
  unitsPerBulto?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Client {
  id: string;
  name: string;
  phone?: string;
  address?: string;
}

const genericClient: Client = {
  id: 'generic',
  name: 'Cliente Genérico',
  phone: '',
  address: '',
};

export default function VendorQuickSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<{ applyVAT: boolean }>({
    applyVAT: false,
  });
  const [selectedClient, setSelectedClient] =
    useState<Client>(genericClient);
  const [paymentType, setPaymentType] = useState<'Contado' | 'Crédito'>(
    'Contado',
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const clientId = searchParams.get('clientId');

  useEffect(() => {
    if (!storeId) return;
    apiClient
      .get(`/stores/${storeId}`)
      .then((res) => {
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
      })
      .catch(() => {});
  }, [storeId]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let isMounted = true;
    apiClient
      .get(`/clients/${clientId}`)
      .then((res) => {
        if (isMounted && res.data) {
          setSelectedClient(res.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          toast({
            variant: 'destructive',
            title: 'Cliente no disponible',
            description: 'No se pudo cargar el cliente seleccionado.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, toast]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await apiClient.get('/products', {
        params: { storeId, search: term, limit: 12 },
      });
      setSearchResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddProduct = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const handleQuantityChange = (productId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.salePrice * item.quantity, 0),
    [cart],
  );
  const tax = useMemo(
    () => (settings.applyVAT ? subtotal * 0.15 : 0),
    [settings, subtotal],
  );
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const resetSale = () => {
    setCart([]);
    setSelectedClient(genericClient);
    setPaymentType('Contado');
  };

  const handleFinalizeSale = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo identificar al vendedor.',
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Agrega al menos un producto.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.post('/orders', {
        storeId,
        vendorId: user.id,
        cashierName: user.name,
        clientId:
          selectedClient.id !== 'generic' ? selectedClient.id : undefined,
        clientName: selectedClient.name,
        items: cart.map(
          ({ id, description, quantity, salePrice, costPrice }) => ({
            productId: id,
            description,
            quantity,
            unitPrice: salePrice,
            costPrice: costPrice || 0,
          }),
        ),
        subtotal,
        tax,
        total,
        paymentType,
        status: paymentType === 'Crédito' ? 'Pendiente de Pago' : 'Pagada',
        type: 'venta_directa',
      });

      toast({
        title: 'Venta registrada',
        description: 'El pedido quedó guardado y listo para seguir.',
      });
      resetSale();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error?.response?.data?.message || 'No se pudo registrar la venta.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-sky-900 to-cyan-600 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit border border-white/20 bg-white/10 text-white hover:bg-white/10">
              Venta en calle
            </Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">
                Venta rápida
              </h1>
              <p className="max-w-2xl text-sm text-sky-50/85">
                Cliente pide, tú apuntas y guardas. Esta pantalla prioriza ritmo
                de venta antes que navegación de oficina.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickMetric
              label="Cliente"
              value={selectedClient.name}
              tone="bg-white/10"
            />
            <QuickMetric
              label="Items"
              value={`${totalItems}`}
              tone="bg-white/10"
            />
            <QuickMetric
              label="Total"
              value={`C$ ${total.toFixed(2)}`}
              tone="bg-white/10"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black">
                Cliente activo
              </CardTitle>
              <CardDescription>
                Busca uno existente o crea uno nuevo sin salir del flujo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <ClientSelectionDialog
                  currentClient={selectedClient as any}
                  onSelectClient={setSelectedClient as any}
                  trigger={
                    <Button
                      variant="outline"
                      className="min-w-[220px] flex-1 justify-between rounded-2xl"
                    >
                      Buscar o seleccionar cliente
                    </Button>
                  }
                />
                <AddClientDialog
                  onClientAdded={setSelectedClient as any}
                  trigger={<Button variant="outline">Nuevo cliente</Button>}
                />
              </div>

              <div className="flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black">
                    {selectedClient.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {selectedClient.phone || 'Sin telefono registrado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-black">
                Buscar producto
              </CardTitle>
              <CardDescription>
                Busca por nombre o código y agrega con un toque.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Nombre o codigo del producto..."
                  className="h-12 rounded-2xl pl-11"
                />
              </div>

              {searchLoading ? (
                <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : searchTerm.length >= 2 && searchResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No se encontraron productos para este filtro.
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      className="rounded-2xl border bg-white p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-black text-slate-900">
                            {product.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.barcode || 'Sin codigo'}
                          </p>
                        </div>
                        <Badge variant="secondary">Agregar</Badge>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-black text-primary">
                          C$ {product.salePrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.unitsPerBulto
                            ? `${product.unitsPerBulto} u/bulto`
                            : 'Unidad'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-slate-50/70 p-8 text-center">
                  <PackageSearch className="mx-auto h-10 w-10 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Empieza escribiendo para traer productos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:sticky xl:top-20 xl:self-start">
          <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-lg">
            <CardHeader className="border-b bg-slate-950 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-black text-white">
                    Pedido actual
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Ajusta cantidades y registra sin abrir otra pantalla.
                  </CardDescription>
                </div>
                <Badge className="bg-white/10 text-white hover:bg-white/10">
                  {totalItems} items
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {(['Contado', 'Crédito'] as const).map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    variant={paymentType === mode ? 'default' : 'outline'}
                    className="rounded-2xl"
                    onClick={() => setPaymentType(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              <Separator />

              {cart.length > 0 ? (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-900">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            C$ {item.salePrice.toFixed(2)} c/u
                          </p>
                        </div>
                        <p className="text-right text-lg font-black text-slate-950">
                          C$ {(item.salePrice * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <div className="min-w-12 text-center text-lg font-black">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        <Badge variant="outline">Linea activa</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-slate-50/70 p-10 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-base font-semibold text-slate-800">
                    Venta vacía
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Busca un producto y agrégalo para empezar.
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    C$ {subtotal.toFixed(2)}
                  </span>
                </div>
                {settings.applyVAT ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">IVA</span>
                    <span className="font-semibold">C$ {tax.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xl font-black text-slate-950">
                  <span>Total</span>
                  <span>C$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="h-14 w-full rounded-2xl text-base font-black"
                disabled={cart.length === 0 || isProcessing}
                onClick={handleFinalizeSale}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-5 w-5" />
                )}
                Registrar pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 p-4 ${tone}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-white/70">
        {label}
      </p>
      <p className="mt-3 truncate text-2xl font-black tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
