const normalizeRawRole = (value?: string | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-');

export type NormalizedUserRole =
  | 'master-admin'
  | 'owner'
  | 'chain-admin'
  | 'store-admin'
  | 'cashier'
  | 'inventory'
  | 'dispatcher'
  | 'rutero'
  | 'vendor'
  | 'sales-manager'
  | 'unknown';

export const normalizeUserRole = (value?: string | null): NormalizedUserRole => {
  const role = normalizeRawRole(value);

  switch (role) {
    case 'master-admin':
    case 'masteradmin':
      return 'master-admin';
    case 'owner':
      return 'owner';
    case 'chain-admin':
    case 'chainadmin':
      return 'chain-admin';
    case 'store-admin':
    case 'store-administrator':
    case 'admin':
      return 'store-admin';
    case 'cashier':
    case 'cajero':
      return 'cashier';
    case 'inventory':
    case 'warehouse':
    case 'bodeguero':
    case 'ayudante-de-bodega':
      return 'inventory';
    case 'dispatcher':
    case 'despacho':
      return 'dispatcher';
    case 'rutero':
    case 'repartidor':
    case 'despachador-de-ruta':
      return 'rutero';
    case 'vendor':
    case 'vendedor':
    case 'vendedor-ambulante':
      return 'vendor';
    case 'gestor-de-ventas':
    case 'gestor-ventas':
    case 'sales-manager':
      return 'sales-manager';
    default:
      return 'unknown';
  }
};

export const isGlobalAdminRole = (value?: string | null) => {
  const role = normalizeUserRole(value);
  return role === 'master-admin' || role === 'owner';
};
