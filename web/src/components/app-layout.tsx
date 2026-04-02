import apiClient from '@/services/api-client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { AppHeader } from '@/components/app-header';
import { cn } from '@/lib/utils';
import { isGlobalAdminRole, normalizeUserRole } from '@/lib/user-role';
import { useRealTimeEvents } from '@/hooks/use-real-time-events';
import {
  LayoutDashboard, Store, Briefcase, Users, WalletCards, RefreshCw,
  FileText, Map, MapPin, Settings, LifeBuoy, Package, History, Wrench,
  ShoppingCart, ClipboardCheck, AreaChart, UsersRound, Truck, HandCoins,
  ShieldCheck, SendToBack, Route, DollarSign, ListOrdered, PackagePlus, ReceiptText, Boxes,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  href: string;
  userId: string;
  read: boolean;
}

interface StoreSettings {
  exchangeRate?: number;
  enableDispatcherMode?: boolean;
  enableSalesManagerMode?: boolean;
  enableSupplierManagement?: boolean;
}

interface RealtimeEvent {
  type?: string;
  storeId?: string;
  payload?: Record<string, any>;
}

const translations = {
  es: {
    dashboard: 'Panel',
    stores: 'Tiendas',
    users: 'Usuarios',
    licenses: 'Licencias',
    monitor: 'Monitor',
    help: 'Ayuda',
    billing: 'Facturación',
    cashRegister: 'Caja',
    products: 'Productos',
    movements: 'Movimientos',
    adjustments: 'Ajustes',
    settings: 'Configuración',
    reports: 'Reportes',
    vendors: 'Vendedores',
    assignInventory: 'Asignar Inventario',
    myRoute: 'Mi Ruta',
    addClient: 'Clientes',
    sales: 'Ventas',
    dispatcher: 'Despacho',
    pendingOrders: 'Comandas',
    deliveryRoute: 'Ruta de Entrega',
    registerOrder: 'Registrar Pedido',
    assignRoute: 'Asignar Ruta',
    suppliers: 'Proveedores',
    quickSale: 'Venta Rápida',
    authorizations: 'Autorizaciones',
    accountsReceivable: 'Cuentas por Cobrar',
    supplierInvoices: 'Facturas Proveedor',
    routes: 'Rutas',
  },
  en: {
    dashboard: 'Dashboard',
    stores: 'Stores',
    users: 'Users',
    licenses: 'Licenses',
    monitor: 'Monitor',
    help: 'Help',
    billing: 'Billing',
    cashRegister: 'Cash Register',
    products: 'Products',
    movements: 'Movements',
    adjustments: 'Adjustments',
    settings: 'Settings',
    reports: 'Reports',
    vendors: 'Vendors',
    assignInventory: 'Assign Inventory',
    myRoute: 'My Route',
    addClient: 'Add Client',
    sales: 'Sales',
    dispatcher: 'Dispatcher',
    pendingOrders: 'Orders',
    deliveryRoute: 'Delivery Route',
    registerOrder: 'Register Order',
    assignRoute: 'Assign Route',
    suppliers: 'Suppliers',
    quickSale: 'Quick Sale',
    authorizations: 'Authorizations',
    accountsReceivable: 'Accounts Receivable',
    supplierInvoices: 'Supplier Invoices',
    routes: 'Routes',
  }
};

const getMasterAdminNav = (lang: 'es' | 'en'): NavItem[] => [
  { name: translations[lang].dashboard, href: '/master-admin/dashboard', icon: LayoutDashboard, section: 'Control' },
  { name: translations[lang].stores, href: '/master-admin/stores', icon: Store, section: 'Control' },
  { name: 'Cadenas', href: '/master-admin/chains', icon: Briefcase, section: 'Control' },
  { name: translations[lang].users, href: '/master-admin/users', icon: Users, section: 'Control' },
  { name: translations[lang].licenses, href: '/master-admin/licenses', icon: WalletCards, section: 'Control' },
  { name: 'Monitor Sync', href: '/master-admin/sync-monitor', icon: RefreshCw, section: 'Monitoreo' },
  { name: translations[lang].monitor, href: '/master-admin/monitor', icon: FileText, section: 'Monitoreo' },
  { name: 'Zonas Globales', href: '/master-admin/config/zones', icon: Map, section: 'Configuracion' },
  { name: 'Sub-Zonas (Barrios)', href: '/master-admin/config/sub-zones', icon: MapPin, section: 'Configuracion' },
  { name: 'Configuración', href: '/master-admin/config', icon: Settings, section: 'Configuracion' },
  { name: translations[lang].help, href: '/master-admin/help', icon: LifeBuoy, section: 'Soporte' },
];

const getStoreAdminNav = (storeId: string, lang: 'es' | 'en', settings: StoreSettings) => {
  const nav: NavItem[] = [
    ...(settings.enableDispatcherMode ? [{
      name: translations[lang].pendingOrders,
      href: `/store/${storeId}/pending-orders`,
      icon: ClipboardCheck,
      section: 'Operacion',
    }] : []),
    {
      name: translations[lang].cashRegister,
      href: `/store/${storeId}/cash-register`,
      icon: WalletCards,
      section: 'Operacion',
    },
    {
      name: translations[lang].dashboard,
      href: `/store/${storeId}/dashboard`,
      icon: LayoutDashboard,
      section: 'Operacion',
    },
    { name: 'Bodega Logística', href: `/store/${storeId}/warehouse`, icon: Boxes, section: 'Operacion' },
    { name: translations[lang].products, href: `/store/${storeId}/products`, icon: Package, section: 'Inventario y compras' },
    { name: translations[lang].movements, href: `/store/${storeId}/inventory/movements`, icon: History, section: 'Inventario y compras' },
    ...(settings.enableSupplierManagement ? [{
      name: translations[lang].suppliers,
      href: `/store/${storeId}/suppliers`,
      icon: Briefcase,
      section: 'Inventario y compras',
    }, {
      name: translations[lang].supplierInvoices,
      href: `/store/${storeId}/suppliers/invoice`,
      icon: ReceiptText,
      section: 'Inventario y compras',
    }] : []),
    { name: translations[lang].accountsReceivable, href: `/store/${storeId}/finance/receivables`, icon: HandCoins, section: 'Comercial' },
    { name: translations[lang].reports, href: `/store/${storeId}/reports`, icon: AreaChart, section: 'Comercial' },
    ...(settings.enableSalesManagerMode ? [
      { name: translations[lang].vendors, href: `/store/${storeId}/vendors`, icon: UsersRound, section: 'Comercial' },
      { name: translations[lang].assignRoute, href: `/store/${storeId}/vendors/assign-route`, icon: Route, section: 'Comercial' },
      { name: translations[lang].routes, href: `/store/${storeId}/vendors/routes`, icon: MapPin, section: 'Comercial' },
      { name: translations[lang].addClient, href: `/store/${storeId}/vendors/clients`, icon: Users, section: 'Comercial' },
      { name: translations[lang].assignInventory, href: `/store/${storeId}/vendors/inventory`, icon: Truck, section: 'Comercial' },
      { name: 'Zonas y Barrios', href: `/store/${storeId}/vendors/zones`, icon: Map, section: 'Comercial' },
    ] : []),
    {
      name: translations[lang].authorizations,
      href: `/store/${storeId}/authorizations`,
      icon: ShieldCheck,
      section: 'Administracion',
    },
    { name: translations[lang].users, href: `/store/${storeId}/users`, icon: Users, section: 'Administracion' },
    { name: translations[lang].settings, href: `/store/${storeId}/settings`, icon: Settings, section: 'Administracion' },
    { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Soporte' },
  ];
  return nav;
};

const getBodegueroNav = (storeId: string, lang: 'es' | 'en'): NavItem[] => [
  { name: 'Bodega Logística', href: `/store/${storeId}/warehouse`, icon: Boxes, section: 'Operacion' },
  { name: translations[lang].products, href: `/store/${storeId}/products`, icon: Package, section: 'Operacion' },
  { name: translations[lang].movements, href: `/store/${storeId}/inventory/movements`, icon: History, section: 'Operacion' },
  { name: translations[lang].adjustments, href: `/store/${storeId}/inventory/adjustments`, icon: Wrench, section: 'Operacion' },
  { name: translations[lang].suppliers, href: `/store/${storeId}/suppliers`, icon: Briefcase, section: 'Apoyo' },
  { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
];

const getCashierNav = (storeId: string, lang: 'es' | 'en', settings: StoreSettings) => {
  const nav: NavItem[] = [
    { name: translations[lang].billing, href: `/`, icon: ShoppingCart, section: 'Operacion' },
    ...(settings.enableDispatcherMode ? [{
      name: translations[lang].pendingOrders,
      href: `/store/${storeId}/pending-orders`,
      icon: ClipboardCheck,
      section: 'Operacion',
    }] : []),
    { name: translations[lang].cashRegister, href: `/store/${storeId}/cash-register`, icon: WalletCards, section: 'Operacion' },
    { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
  ];
  return nav;
};

const getDespachoNav = (storeId: string, lang: 'es' | 'en'): NavItem[] => [
  { name: translations[lang].dispatcher, href: `/store/${storeId}/dispatcher`, icon: SendToBack, section: 'Operacion' },
  { name: 'Bodega Logística', href: `/store/${storeId}/warehouse`, icon: Boxes, section: 'Operacion' },
  { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
];

const getRuteroNav = (storeId: string, lang: 'es' | 'en', settings: StoreSettings) => {
  if (!settings.enableSalesManagerMode) return [{ name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' }];
  return [
    { name: translations[lang].deliveryRoute, href: `/store/${storeId}/delivery-route`, icon: Route, section: 'Operacion' },
    { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
  ];
};

const getVendedorAmbulanteNav = (storeId: string, lang: 'es' | 'en'): NavItem[] => [
  { name: translations[lang].quickSale, href: `/store/${storeId}/vendors/quick-sale`, icon: DollarSign, section: 'Operacion' },
  { name: translations[lang].addClient, href: `/store/${storeId}/vendors/clients`, icon: Users, section: 'Operacion' },
  { name: translations[lang].sales, href: `/store/${storeId}/vendors/sales`, icon: ListOrdered, section: 'Operacion' },
  { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
];

const getGestorVentasNav = (storeId: string, lang: 'es' | 'en'): NavItem[] => [
  { name: translations[lang].myRoute, href: `/store/${storeId}/vendors/dashboard`, icon: Route, section: 'Operacion' },
  { name: translations[lang].assignRoute, href: `/store/${storeId}/vendors/assign-route`, icon: ClipboardCheck, section: 'Operacion' },
  { name: translations[lang].routes, href: `/store/${storeId}/vendors/routes`, icon: MapPin, section: 'Operacion' },
  { name: translations[lang].registerOrder, href: `/store/${storeId}/vendors/sales`, icon: PackagePlus, section: 'Operacion' },
  { name: translations[lang].addClient, href: `/store/${storeId}/vendors/clients`, icon: Users, section: 'Comercial' },
  { name: 'Gestionar Zonas', href: `/store/${storeId}/vendors/zones`, icon: Map, section: 'Comercial' },
  { name: translations[lang].sales, href: `/store/${storeId}/vendors/sales`, icon: ListOrdered, section: 'Comercial' },
  { name: translations[lang].help, href: `/store/${storeId}/help`, icon: LifeBuoy, section: 'Apoyo' },
];

const buildNotificationKey = (event: RealtimeEvent) =>
  [
    event.type,
    event.storeId,
    event.payload?.id,
    event.payload?.productId,
    event.payload?.reference,
    event.payload?.createdAt,
    event.payload?.updatedAt,
  ]
    .filter(Boolean)
    .join(':');

const buildRealtimeNotification = (
  event: RealtimeEvent,
  currentUserId?: string,
  fallbackStoreId?: string,
  isGlobalAdmin = false,
): Notification | null => {
  const effectiveStoreId = event.storeId || event.payload?.storeId || fallbackStoreId;
  const baseStorePath = effectiveStoreId ? `/store/${effectiveStoreId}` : null;
  const fallbackHref = isGlobalAdmin ? '/master-admin/monitor' : '/';
  const id = buildNotificationKey(event);

  if (!event.type || !id) {
    return null;
  }

  switch (event.type) {
    case 'NEW_ORDER':
      return {
        id,
        title: 'Nuevo pedido',
        description: `Pedido ${event.payload?.id || ''} por C$ ${Number(event.payload?.total || 0).toFixed(2)}`.trim(),
        href: baseStorePath ? `${baseStorePath}/pending-orders` : fallbackHref,
        userId: currentUserId || 'system',
        read: false,
      };
    case 'NEW_VISIT':
      return {
        id,
        title: 'Nueva visita',
        description: `Visita registrada${event.payload?.clientId ? ` para cliente ${event.payload.clientId}` : ''}`,
        href: baseStorePath ? `${baseStorePath}/vendors/dashboard` : fallbackHref,
        userId: currentUserId || 'system',
        read: false,
      };
    case 'PRODUCT_CREATED':
      return {
        id,
        title: 'Producto creado',
        description: event.payload?.description || 'Se registró un producto nuevo.',
        href: baseStorePath ? `${baseStorePath}/products` : fallbackHref,
        userId: currentUserId || 'system',
        read: false,
      };
    case 'PRODUCT_UPDATED':
      return {
        id,
        title: 'Producto actualizado',
        description: event.payload?.description || 'Se actualizó un producto.',
        href: baseStorePath ? `${baseStorePath}/products` : fallbackHref,
        userId: currentUserId || 'system',
        read: false,
      };
    case 'INVENTORY_UPDATE':
      return {
        id,
        title: 'Inventario actualizado',
        description: `Movimiento ${event.payload?.type || ''}${event.payload?.quantity ? ` por ${event.payload.quantity}` : ''}`.trim(),
        href: baseStorePath ? `${baseStorePath}/inventory/movements` : fallbackHref,
        userId: currentUserId || 'system',
        read: false,
      };
    default:
      return null;
  }
};


function MainNav({
  navItems,
  onLinkClick,
}: {
  navItems: NavItem[];
  onLinkClick?: () => void;
}) {
  const location = useLocation();
  const pathname = location.pathname;

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href) && item.href !== '/' || (pathname === '/' && item.href === '/');
        const showSectionTitle =
          index === 0 || item.section !== navItems[index - 1]?.section;

        return (
          <div key={item.name} className={cn(showSectionTitle && index !== 0 && 'mt-4')}>
            {showSectionTitle && item.section ? (
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/80">
                {item.section}
              </p>
            ) : null}
            <Link
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          </div>
        );
      })}
    </>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { storeId } = useParams();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    enableDispatcherMode: true,
    enableSalesManagerMode: true,
    enableSupplierManagement: true,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const seenNotificationIds = useRef<Set<string>>(new Set());
  const location = useLocation();
  const pathname = location.pathname;
  const { lastEvent } = useRealTimeEvents(storeId);

  useEffect(() => {
    if (!storeId) return;
    const fetchStoreSettings = async () => {
      try {
        const res = await apiClient.get(`/stores/${storeId}`);
        if (res.data && res.data.settings) {
          setStoreSettings(res.data.settings);
        }
      } catch (error) {
         // ignore
      }
    };
    fetchStoreSettings();
  }, [storeId]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'es' | 'en');
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications((prev: Notification[]) =>
      prev.map((n: Notification) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  useEffect(() => {
    seenNotificationIds.current.clear();
    setNotifications([]);
  }, [storeId, user?.id]);

  useEffect(() => {
    const notification = buildRealtimeNotification(
      lastEvent,
      user?.id,
      storeId,
      isGlobalAdminRole(user?.role),
    );

    if (!notification || seenNotificationIds.current.has(notification.id)) {
      return;
    }

    seenNotificationIds.current.add(notification.id);
    setNotifications((prev) => [notification, ...prev].slice(0, 12));
  }, [lastEvent, storeId, user?.id, user?.role]);

  const navItems = useMemo(() => {
    const roleId = normalizeUserRole(user?.role);
    switch (roleId) {
      case 'master-admin':
      case 'owner':
        return getMasterAdminNav(language);
      case 'store-admin':
        return getStoreAdminNav(storeId || '', language, storeSettings);
      case 'inventory':
        return getBodegueroNav(storeId || '', language);
      case 'cashier':
        return getCashierNav(storeId || '', language, storeSettings);
      case 'dispatcher':
        return getDespachoNav(storeId || '', language);
      case 'rutero':
        return getRuteroNav(storeId || '', language, storeSettings);
      case 'vendor':
        return getVendedorAmbulanteNav(storeId || '', language);
      case 'sales-manager':
        return getGestorVentasNav(storeId || '', language);
      default:
        // Default to store admin nav for robust fallback if storeId exists
        return storeId ? getStoreAdminNav(storeId, language, storeSettings) : [];
    }
  }, [user, language, storeId, storeSettings]);

  const nav = <MainNav navItems={navItems} onLinkClick={() => {}} />;

  if (pathname === '/' && !isGlobalAdminRole(user?.role)) {
    return <>{children}</>;
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to={isGlobalAdminRole(user?.role) ? '/master-admin/dashboard' : (storeId ? `/store/${storeId}/dashboard` : '/')} className="flex items-center gap-2 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span>MultiTienda</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {nav}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <AppHeader
          navItems={navItems}
          language={language}
          onLanguageChange={handleLanguageChange}
          exchangeRate={storeSettings.exchangeRate}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-x-hidden">
          {children}
        </main>

        <footer className="flex items-center justify-between p-4 text-xs text-muted-foreground border-t">
          <span>© {new Date().getFullYear()} World Wide All in One Programing. Todos los derechos reservados.</span>
        </footer>
      </div>
    </div>
  );
}
