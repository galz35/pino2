import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../data/vendor_inventory_repository.dart';
import '../../domain/models/vendor_product.dart';

class VendorInventoryScreen extends ConsumerStatefulWidget {
  const VendorInventoryScreen({
    required this.storeId,
    this.storeName,
    super.key,
  });

  final String storeId;
  final String? storeName;

  @override
  ConsumerState<VendorInventoryScreen> createState() =>
      _VendorInventoryScreenState();
}

class _VendorInventoryScreenState
    extends ConsumerState<VendorInventoryScreen> {
  bool _isLoading = true;
  List<VendorProduct> _products = [];
  String _search = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInventory() async {
    final session = ref.read(authControllerProvider).session;
    if (session == null) return;

    setState(() => _isLoading = true);
    try {
      final products =
          await ref.read(vendorInventoryRepositoryProvider).getInventory(
                vendorId: session.user.id,
                accessToken: session.accessToken,
              );
      if (!mounted) return;
      setState(() => _products = products);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al cargar inventario: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<VendorProduct> get _filteredProducts {
    if (_search.isEmpty) return _products;
    return _products.where((p) {
      final haystack =
          '${p.description} ${p.brand ?? ''}'.toLowerCase();
      return haystack.contains(_search);
    }).toList();
  }

  int get _totalUnits =>
      _products.fold<int>(0, (s, p) => s + p.currentQuantity);

  double get _totalValue =>
      _products.fold<double>(
          0, (s, p) => s + (p.currentQuantity * p.salePrice));

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredProducts;

    return Scaffold(
      appBar: AppBar(title: const Text('Mi Inventario')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadInventory,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                children: [
                  // ── Hero ──
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(28),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F172A), Color(0xFF1E3A5F)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.storeName != null
                              ? 'Inventario • ${widget.storeName}'
                              : 'Mi Inventario',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Mercancía asignada a tu cuenta.',
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(
                                color: Colors.white
                                    .withValues(alpha: 0.78),
                              ),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            _InventoryPill(
                              icon: Icons.inventory_2_rounded,
                              text: '${_products.length} productos',
                            ),
                            _InventoryPill(
                              icon: Icons.all_inbox_rounded,
                              text: '$_totalUnits unidades',
                            ),
                            _InventoryPill(
                              icon: Icons.payments_rounded,
                              text:
                                  'C\$ ${_totalValue.toStringAsFixed(2)}',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Search ──
                  TextField(
                    controller: _searchController,
                    onChanged: (v) =>
                        setState(() => _search = v.trim().toLowerCase()),
                    decoration: InputDecoration(
                      hintText: 'Buscar producto...',
                      prefixIcon: const Icon(Icons.search_rounded),
                      suffixIcon: _search.isEmpty
                          ? null
                          : IconButton(
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _search = '');
                              },
                              icon: const Icon(Icons.close_rounded),
                            ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Product list ──
                  if (filtered.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border:
                            Border.all(color: Colors.grey.shade200),
                      ),
                      child: const Column(
                        children: [
                          Icon(Icons.inventory_2_outlined,
                              size: 42, color: Color(0xFF64748B)),
                          SizedBox(height: 12),
                          Text('Sin productos asignados',
                              style: TextStyle(
                                  fontWeight: FontWeight.w800)),
                          SizedBox(height: 6),
                          Text(
                            'El gestor debe asignarte mercancía desde la web.',
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  else
                    ...filtered.map(
                      (product) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _VendorProductCard(product: product),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

// ═══════════════════════════════════════════════════
//  Sub-widgets
// ═══════════════════════════════════════════════════

class _InventoryPill extends StatelessWidget {
  const _InventoryPill({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _VendorProductCard extends StatelessWidget {
  const _VendorProductCard({required this.product});

  final VendorProduct product;

  @override
  Widget build(BuildContext context) {
    final isLow = product.currentQuantity <= 5;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isLow ? const Color(0xFFFCA5A5) : Colors.grey.shade200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  product.description,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
              ),
              if (isLow)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'Bajo',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFDC2626),
                    ),
                  ),
                ),
            ],
          ),
          if (product.brand != null && product.brand!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              product.brand!,
              style: const TextStyle(fontSize: 12, color: Colors.black45),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              _StatChip(
                label: 'Asignadas',
                value: '${product.assignedQuantity}',
                color: const Color(0xFF3B82F6),
              ),
              const SizedBox(width: 8),
              _StatChip(
                label: 'Vendidas',
                value: '${product.soldQuantity}',
                color: const Color(0xFF22C55E),
              ),
              const SizedBox(width: 8),
              _StatChip(
                label: 'Devueltas',
                value: '${product.returnedQuantity}',
                color: const Color(0xFFF97316),
              ),
              const SizedBox(width: 8),
              _StatChip(
                label: 'En mano',
                value: '${product.currentQuantity}',
                color: const Color(0xFF6366F1),
                bold: true,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Precio: C\$ ${product.salePrice.toStringAsFixed(2)} • Valor: C\$ ${(product.currentQuantity * product.salePrice).toStringAsFixed(2)}',
            style: const TextStyle(fontSize: 12, color: Colors.black54),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
    this.bold = false,
  });

  final String label;
  final String value;
  final Color color;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: bold ? 18 : 14,
                fontWeight: FontWeight.w800,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: color.withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
