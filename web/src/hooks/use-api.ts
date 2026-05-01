import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import apiClient, { clearCache } from '@/services/api-client';

// ─── Generic fetcher ──────────────────────────────────────────
const fetcher = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const res = await apiClient.get(url, { params });
  return res.data;
};

// ─── Query keys factory ───────────────────────────────────────
export const queryKeys = {
  // Store scoped
  products: (storeId: string) => ['products', storeId] as const,
  product: (storeId: string, id: string) => ['products', storeId, id] as const,
  sales: (storeId: string) => ['sales', storeId] as const,
  dashboardStats: (storeId: string) => ['dashboard-stats', storeId] as const,
  orders: (storeId: string, filters?: Record<string, string>) => ['orders', storeId, filters] as const,
  clients: (storeId: string) => ['clients', storeId] as const,
  cashShifts: (storeId: string) => ['cash-shifts', storeId] as const,
  activeShift: (storeId: string) => ['cash-shifts', storeId, 'active'] as const,
  shiftStats: (shiftId: string) => ['cash-shifts', 'stats', shiftId] as const,
  users: (storeId: string) => ['users', storeId] as const,
  suppliers: (storeId: string) => ['suppliers', storeId] as const,
  departments: (storeId: string) => ['departments', storeId] as const,
  pendingDeliveries: (storeId: string) => ['pending-deliveries', storeId] as const,
  vendorInventory: (storeId: string, vendorId: string) => ['vendor-inventory', storeId, vendorId] as const,

  // Global
  stores: () => ['stores'] as const,
  store: (id: string) => ['stores', id] as const,
  chains: () => ['chains'] as const,
};

// ─── Pre-built hooks ──────────────────────────────────────────

/** Dashboard stats — server-aggregated, no raw downloads */
export function useDashboardStats(storeId: string) {
  return useQuery({
    queryKey: queryKeys.dashboardStats(storeId),
    queryFn: () => fetcher('/sales/dashboard-stats', { storeId }),
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

/** Products list */
export function useProducts(storeId: string, opts?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: queryKeys.products(storeId),
    queryFn: () => fetcher(`/products?storeId=${storeId}`),
    enabled: !!storeId,
    ...opts,
  });
}

/** Single product */
export function useProduct(storeId: string, productId: string) {
  return useQuery({
    queryKey: queryKeys.product(storeId, productId),
    queryFn: () => fetcher(`/products/${productId}?storeId=${storeId}`),
    enabled: !!storeId && !!productId,
  });
}

/** Orders with filters */
export function useOrders(storeId: string, filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.orders(storeId, filters),
    queryFn: () => fetcher('/orders', { storeId, ...filters }),
    enabled: !!storeId,
  });
}

/** Active cash shift */
export function useActiveShift(storeId: string) {
  return useQuery({
    queryKey: queryKeys.activeShift(storeId),
    queryFn: () => fetcher(`/cash-shifts/active/${storeId}`),
    enabled: !!storeId,
    refetchInterval: 30_000,
  });
}

/** Cash shift stats */
export function useShiftStats(shiftId: string) {
  return useQuery({
    queryKey: queryKeys.shiftStats(shiftId),
    queryFn: () => fetcher(`/cash-shifts/stats/${shiftId}`),
    enabled: !!shiftId,
  });
}

/** Clients list */
export function useClients(storeId: string) {
  return useQuery({
    queryKey: queryKeys.clients(storeId),
    queryFn: () => fetcher(`/clients?storeId=${storeId}`),
    enabled: !!storeId,
  });
}

/** Users list */
export function useUsers(storeId: string) {
  return useQuery({
    queryKey: queryKeys.users(storeId),
    queryFn: () => fetcher(`/users?storeId=${storeId}`),
    enabled: !!storeId,
  });
}

/** Suppliers list */
export function useSuppliers(storeId: string) {
  return useQuery({
    queryKey: queryKeys.suppliers(storeId),
    queryFn: () => fetcher(`/suppliers?storeId=${storeId}`),
    enabled: !!storeId,
  });
}

/** Stores list */
export function useStores() {
  return useQuery({
    queryKey: queryKeys.stores(),
    queryFn: () => fetcher('/stores'),
  });
}

/** Single store */
export function useStore(storeId: string) {
  return useQuery({
    queryKey: queryKeys.store(storeId),
    queryFn: () => fetcher(`/stores/${storeId}`),
    enabled: !!storeId,
  });
}

/** Pending deliveries */
export function usePendingDeliveries(storeId: string) {
  return useQuery({
    queryKey: queryKeys.pendingDeliveries(storeId),
    queryFn: () => fetcher(`/pending-deliveries?storeId=${storeId}`),
    enabled: !!storeId,
  });
}

// ─── Generic mutation with cache invalidation ─────────────────
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys?: readonly unknown[][],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      clearCache(); // Clear axios memory cache
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      }
    },
  });
}
