import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/documents/pdf_receipt_service.dart';
import '../../../../core/network/connectivity_service.dart';
import '../../../../core/network/sync_queue_processor.dart';
import '../../../../core/utils/role_utils.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../catalog/data/catalog_repository.dart';
import '../../../catalog/domain/models/catalog_product.dart';
import '../../../clients/data/client_portfolio_repository.dart';
import '../../../clients/domain/models/client_summary.dart';
import '../../data/quick_order_repository.dart';

class QuickOrderBootstrap {
  const QuickOrderBootstrap({
    required this.products,
    required this.clients,
  });

  final List<CatalogProduct> products;
  final List<ClientSummary> clients;
}

final quickOrderBootstrapProvider = FutureProvider.family
    .autoDispose<QuickOrderBootstrap, String>((ref, storeId) async {
      ref.watch(networkStatusProvider);
      ref.watch(syncQueueProcessorProvider.select((state) => state.lastSyncAt));

      final session = ref.watch(authControllerProvider).session;
      if (session == null) {
        return const QuickOrderBootstrap(products: [], clients: []);
      }

      final results = await Future.wait([
        ref
            .read(catalogRepositoryProvider)
            .getProducts(storeId: storeId, accessToken: session.accessToken),
        ref
            .read(clientPortfolioRepositoryProvider)
            .getClients(storeId: storeId, accessToken: session.accessToken),
      ]);

      return QuickOrderBootstrap(
        products: results[0] as List<CatalogProduct>,
        clients: results[1] as List<ClientSummary>,
      );
    });

class QuickOrderScreen extends ConsumerStatefulWidget {
  const QuickOrderScreen({
    required this.storeId,
    this.storeName,
    super.key,
  });

  final String storeId;
  final String? storeName;

  @override
  ConsumerState<QuickOrderScreen> createState() => _QuickOrderScreenState();
}

class _QuickOrderScreenState extends ConsumerState<QuickOrderScreen> {
  final _productSearchController = TextEditingController();
  final _notesController = TextEditingController();
  String _productSearch = '';
  String _paymentType = 'CONTADO';
  ClientSummary? _selectedClient;
  bool _isSubmitting = false;
  final Map<String, _DraftOrderItem> _draftItems = {};

  @override
  void dispose() {
    _productSearchController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickClient(List<ClientSummary> clients) async {
    final selected = await showModalBottomSheet<ClientSummary>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (context) => _ClientPickerSheet(clients: clients),
    );

    if (selected != null) {
      setState(() {
        _selectedClient = selected;
      });
    }
  }

  void _addProduct(CatalogProduct product) {
    setState(() {
      final existing = _draftItems[product.id];
      if (existing == null) {
        _draftItems[product.id] = _DraftOrderItem(product: product, quantity: 1);
      } else {
        _draftItems[product.id] = existing.copyWith(quantity: existing.quantity + 1);
      }
    });
  }

  void _changeQuantity(CatalogProduct product, int delta) {
    setState(() {
      final existing = _draftItems[product.id];
      if (existing == null) {
        if (delta > 0) {
          _draftItems[product.id] = _DraftOrderItem(product: product, quantity: delta);
        }
        return;
      }

      final next = existing.quantity + delta;
      if (next <= 0) {
        _draftItems.remove(product.id);
        return;
      }

      _draftItems[product.id] = existing.copyWith(quantity: next);
    });
  }

  Future<void> _submitOrder() async {
    final session = ref.read(authControllerProvider).session;
    if (session == null) {
      return;
    }

    if (_selectedClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Primero selecciona un cliente.')),
      );
      return;
    }

    if (_draftItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Agrega al menos un producto.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    final role = normalizeRole(session.user.role);
    final vendorId = switch (role) {
      AppRole.vendor || AppRole.rutero => session.user.id,
      _ => null,
    };
    final salesManagerName = role == AppRole.salesManager ? session.user.name : null;
    final client = _selectedClient!;
    final orderItems = _draftItems.values
        .map(
          (item) => ReceiptLineItem(
            description: item.product.description,
            quantity: item.quantity,
            unitPrice: item.product.salePrice,
          ),
        )
        .toList();
    final draftNotes = _notesController.text.trim();
    final orderTotal = _draftItems.values.fold<double>(
      0,
      (sum, item) => sum + (item.quantity * item.product.salePrice),
    );
    final paymentTypeLabel = _paymentType;

    try {
      final response = await ref.read(quickOrderRepositoryProvider).createOrder(
            accessToken: session.accessToken,
            storeId: widget.storeId,
            clientId: client.id,
            clientName: client.name,
            vendorId: vendorId,
            salesManagerName: salesManagerName,
            paymentType: _paymentType,
            notes: _notesController.text,
            items: _draftItems.values
                .map(
                  (item) => {
                    'productId': item.product.id,
                    'quantity': item.quantity,
                    'unitPrice': item.product.salePrice,
                    'presentation': 'UNIT',
                    'priceLevel': 1,
                  },
                )
                .toList(),
          );
      final queuedOffline = response['queuedOffline'] == true;

      if (!mounted) {
        return;
      }

      setState(() {
        _draftItems.clear();
        _notesController.clear();
        _productSearchController.clear();
        _productSearch = '';
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            queuedOffline
                ? 'Pedido guardado en cola local para ${client.name}.'
                : 'Pedido enviado para ${client.name}.',
          ),
          action: SnackBarAction(
            label: 'PDF',
            onPressed: () {
              _shareOrderReceipt(
                clientName: client.name,
                sellerName: session.user.name,
                paymentType: paymentTypeLabel,
                totalAmount: orderTotal,
                notes: draftNotes,
                items: orderItems,
              );
            },
          ),
        ),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  Future<void> _shareOrderReceipt({
    required String clientName,
    required String sellerName,
    required String paymentType,
    required double totalAmount,
    required List<ReceiptLineItem> items,
    String? notes,
  }) async {
    final service = ref.read(pdfReceiptServiceProvider);

    try {
      final file = await service.saveOrderReceipt(
        OrderReceiptPayload(
          storeName: widget.storeName ?? 'Pino',
          createdAt: DateTime.now(),
          sellerName: sellerName,
          clientName: clientName,
          paymentType: paymentType,
          totalAmount: totalAmount,
          items: items,
          notes: notes,
        ),
      );

      if (!mounted) {
        return;
      }

      await service.shareFile(
        file,
        context: context,
        subject: 'Comprobante de pedido',
        text: 'Comprobante de pedido para $clientName',
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo generar el PDF: $error')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bootstrapAsync = ref.watch(quickOrderBootstrapProvider(widget.storeId));
    final totalItems =
        _draftItems.values.fold<int>(0, (sum, item) => sum + item.quantity);
    final totalAmount = _draftItems.values.fold<double>(
      0,
      (sum, item) => sum + (item.quantity * item.product.salePrice),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Preventa rápida')),
      body: bootstrapAsync.when(
        data: (bootstrap) {
          final visibleProducts = bootstrap.products.where((product) {
            if (_productSearch.isEmpty) {
              return true;
            }
            final haystack = [
              product.description,
              product.brand ?? '',
              product.barcode ?? '',
            ].join(' ').toLowerCase();
            return haystack.contains(_productSearch);
          }).take(30).toList();

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  children: [
                    _QuickOrderHero(
                      storeName: widget.storeName,
                      selectedClient: _selectedClient,
                      onPickClient: () => _pickClient(bootstrap.clients),
                    ),
                    const SizedBox(height: 16),
                    _PaymentQuickToggle(
                      value: _paymentType,
                      onChanged: (value) {
                        setState(() {
                          _paymentType = value;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _productSearchController,
                      onChanged: (value) {
                        setState(() {
                          _productSearch = value.trim().toLowerCase();
                        });
                      },
                      decoration: InputDecoration(
                        hintText: 'Cliente habla, tú buscas y agregas...',
                        prefixIcon: const Icon(Icons.search_rounded),
                        suffixIcon: _productSearchController.text.isEmpty
                            ? null
                            : IconButton(
                                onPressed: () {
                                  setState(() {
                                    _productSearchController.clear();
                                    _productSearch = '';
                                  });
                                },
                                icon: const Icon(Icons.close_rounded),
                              ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Productos de acción rápida',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 10),
                    ...visibleProducts.map(
                      (product) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _QuickProductCard(
                          product: product,
                          quantity: _draftItems[product.id]?.quantity ?? 0,
                          onAdd: () => _addProduct(product),
                          onIncrease: () => _changeQuantity(product, 1),
                          onDecrease: () => _changeQuantity(product, -1),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _notesController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'Notas rápidas',
                        hintText: 'Ej: entregar temprano, cobrar pendiente...',
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 110),
                  ],
                ),
              ),
              _QuickOrderFooter(
                totalItems: totalItems,
                totalAmount: totalAmount,
                isSubmitting: _isSubmitting,
                onSubmit: _submitOrder,
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stackTrace) => Center(child: Text(error.toString())),
      ),
    );
  }
}

class _QuickOrderHero extends StatelessWidget {
  const _QuickOrderHero({
    required this.onPickClient,
    this.storeName,
    this.selectedClient,
  });

  final VoidCallback onPickClient;
  final String? storeName;
  final ClientSummary? selectedClient;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF14532D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            storeName == null ? 'Venta en segundos' : 'Venta rápida • $storeName',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Cliente habla rápido. El pedido debe salir igual de rápido.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.82),
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: onPickClient,
            icon: const Icon(Icons.person_search_rounded),
            label: Text(
              selectedClient == null
                  ? 'Elegir cliente'
                  : 'Cliente: ${selectedClient!.name}',
            ),
          ),
          if (selectedClient != null) ...[
            const SizedBox(height: 10),
            Text(
              [
                if ((selectedClient!.phone ?? '').isNotEmpty) selectedClient!.phone!,
                if ((selectedClient!.address ?? '').isNotEmpty) selectedClient!.address!,
              ].join(' • '),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: Colors.white.withValues(alpha: 0.78),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PaymentQuickToggle extends StatelessWidget {
  const _PaymentQuickToggle({
    required this.value,
    required this.onChanged,
  });

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _PaymentButton(
            label: 'Contado',
            icon: Icons.payments_rounded,
            selected: value == 'CONTADO',
            onTap: () => onChanged('CONTADO'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _PaymentButton(
            label: 'Crédito',
            icon: Icons.receipt_long_rounded,
            selected: value == 'CREDITO',
            onTap: () => onChanged('CREDITO'),
          ),
        ),
      ],
    );
  }
}

class _PaymentButton extends StatelessWidget {
  const _PaymentButton({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF14532D) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: selected ? const Color(0xFF14532D) : Colors.grey.shade300,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: selected ? Colors.white : const Color(0xFF14532D)),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : const Color(0xFF14532D),
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickProductCard extends StatelessWidget {
  const _QuickProductCard({
    required this.product,
    required this.quantity,
    required this.onAdd,
    required this.onIncrease,
    required this.onDecrease,
  });

  final CatalogProduct product;
  final int quantity;
  final VoidCallback onAdd;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;

  @override
  Widget build(BuildContext context) {
    final hasQuantity = quantity > 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: hasQuantity ? const Color(0xFF14532D) : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.description,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                Text(
                  'C\$ ${product.salePrice.toStringAsFixed(2)} • ${product.stockLabel}',
                  style: const TextStyle(color: Colors.black54),
                ),
              ],
            ),
          ),
          if (!hasQuantity)
            FilledButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Agregar'),
            )
          else
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: onDecrease,
                    icon: const Icon(Icons.remove_circle_outline_rounded),
                  ),
                  Text(
                    '$quantity',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  IconButton(
                    onPressed: onIncrease,
                    icon: const Icon(Icons.add_circle_outline_rounded),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _QuickOrderFooter extends StatelessWidget {
  const _QuickOrderFooter({
    required this.totalItems,
    required this.totalAmount,
    required this.isSubmitting,
    required this.onSubmit,
  });

  final int totalItems;
  final double totalAmount;
  final bool isSubmitting;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x120F172A),
              blurRadius: 18,
              offset: Offset(0, -6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: _FooterMetric(
                    label: 'Items',
                    value: '$totalItems',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _FooterMetric(
                    label: 'Total',
                    value: 'C\$ ${totalAmount.toStringAsFixed(2)}',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: isSubmitting ? null : onSubmit,
              icon: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send_rounded),
              label: Text(isSubmitting ? 'Enviando...' : 'Guardar pedido ya'),
            ),
          ],
        ),
      ),
    );
  }
}

class _FooterMetric extends StatelessWidget {
  const _FooterMetric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _ClientPickerSheet extends StatefulWidget {
  const _ClientPickerSheet({required this.clients});

  final List<ClientSummary> clients;

  @override
  State<_ClientPickerSheet> createState() => _ClientPickerSheetState();
}

class _ClientPickerSheetState extends State<_ClientPickerSheet> {
  final _controller = TextEditingController();
  String _search = '';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final visibleClients = widget.clients.where((client) {
      if (_search.isEmpty) {
        return true;
      }
      final haystack = [
        client.name,
        client.phone ?? '',
        client.address ?? '',
      ].join(' ').toLowerCase();
      return haystack.contains(_search);
    }).toList();

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 8,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _controller,
              onChanged: (value) {
                setState(() {
                  _search = value.trim().toLowerCase();
                });
              },
              decoration: const InputDecoration(
                hintText: 'Buscar cliente rápido...',
                prefixIcon: Icon(Icons.search_rounded),
              ),
            ),
            const SizedBox(height: 14),
            Flexible(
              child: ListView.separated(
                shrinkWrap: true,
                itemCount: visibleClients.length,
                separatorBuilder: (_, index) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final client = visibleClients[index];
                  return ListTile(
                    tileColor: const Color(0xFFF8FAFC),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                    title: Text(
                      client.name,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      [
                        if ((client.phone ?? '').isNotEmpty) client.phone!,
                        if ((client.address ?? '').isNotEmpty) client.address!,
                      ].join(' • '),
                    ),
                    onTap: () => Navigator.of(context).pop(client),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DraftOrderItem {
  const _DraftOrderItem({
    required this.product,
    required this.quantity,
  });

  final CatalogProduct product;
  final int quantity;

  _DraftOrderItem copyWith({
    CatalogProduct? product,
    int? quantity,
  }) {
    return _DraftOrderItem(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
    );
  }
}
