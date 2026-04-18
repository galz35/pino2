import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class _AdjustmentItem {
  final String productId;
  final String description;
  final double currentStock;
  int diffQuantity = 1;
  String reason = 'Ajuste In-situ App';

  _AdjustmentItem({
    required this.productId,
    required this.description,
    required this.currentStock,
  });
}

class InventoryAdjustmentScreen extends ConsumerStatefulWidget {
  final String storeId;
  final String? storeName;

  const InventoryAdjustmentScreen({
    super.key,
    required this.storeId,
    this.storeName,
  });

  @override
  ConsumerState<InventoryAdjustmentScreen> createState() => _InventoryAdjustmentScreenState();
}

class _InventoryAdjustmentScreenState extends ConsumerState<InventoryAdjustmentScreen> {
  final TextEditingController _searchController = TextEditingController();
  final List<_AdjustmentItem> _items = [];
  bool _isLoading = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchProduct(String query) async {
    if (query.trim().isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final session = ref.read(authControllerProvider).session;
      if (session == null) throw Exception("No session active");

      final apiClient = ref.read(appApiClientProvider);
      final response = await apiClient.getList(
        '/products?storeId=${widget.storeId}&search=${Uri.encodeComponent(query.trim())}&limit=5',
        bearerToken: session.accessToken,
      );

      if (response.isNotEmpty) {
        final product = response.first;
        final existingIndex = _items.indexWhere((i) => i.productId == product['id']);
        
        setState(() {
          if (existingIndex >= 0) {
            _items[existingIndex].diffQuantity += 1;
          } else {
            _items.add(_AdjustmentItem(
              productId: product['id'],
              description: product['description'] ?? 'Producto Desconocido',
              currentStock: (product['currentStock'] as num?)?.toDouble() ?? 0.0,
            ));
          }
        });
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('Producto agregado'), duration: Duration(milliseconds: 500))
        );
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text('Producto no encontrado'), backgroundColor: Colors.red)
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al buscar: $e'), backgroundColor: Colors.red)
      );
    } finally {
      setState(() => _isLoading = false);
      _searchController.clear();
    }
  }

  Future<void> _submitAdjustments() async {
    if (_items.isEmpty) return;
    
    setState(() => _isLoading = true);
    try {
      final session = ref.read(authControllerProvider).session;
      final apiClient = ref.read(appApiClientProvider);
      
      int successCount = 0;
      for (final item in _items) {
        if (item.diffQuantity == 0) continue;
        
        final direction = item.diffQuantity > 0 ? 'positive' : 'negative';
        final qty = item.diffQuantity.abs();
        
        await apiClient.postMap(
          '/inventory/ajuste',
          bearerToken: session!.accessToken,
          data: {
            "storeId": widget.storeId,
            "productId": item.productId,
            "quantity": qty,
            "direction": direction,
            "reference": item.reason,
          }
        );
        successCount++;
      }
      
      setState(() {
        _items.clear();
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Se procesaron $successCount ajustes correctamente.'), backgroundColor: Colors.green)
      );

    } catch(e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al aplicar ajustes: $e'), backgroundColor: Colors.red)
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _updateDiff(int index, int delta) {
    setState(() {
      _items[index].diffQuantity += delta;
      if (_items[index].currentStock + _items[index].diffQuantity < 0) {
         _items[index].diffQuantity = -_items[index].currentStock.toInt(); // Cannot go below 0 absolute
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final hasItems = _items.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: Text('Ajustes de Existencia ${widget.storeName != null ? " - ${widget.storeName}" : ""}'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Escanear código de barra...',
                prefixIcon: const Icon(Icons.qr_code_scanner_rounded),
                suffixIcon: _isLoading 
                  ? const Padding(
                      padding: EdgeInsets.all(12.0),
                      child: SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                    )
                  : IconButton(
                      icon: const Icon(Icons.search_rounded),
                      onPressed: () => _searchProduct(_searchController.text),
                    ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey.shade100,
              ),
              onSubmitted: _searchProduct,
            ),
          ),
          Expanded(
            child: !hasItems
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.inventory_2_rounded, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('Escanea un producto para ajustar', style: TextStyle(color: Colors.grey, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.separated(
                  itemCount: _items.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    final newExpectedStock = item.currentStock + item.diffQuantity;
                    final isPositive = item.diffQuantity > 0;
                    final isNegative = item.diffQuantity < 0;

                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      title: Text(item.description, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 4),
                          Text('Existencia Actual: ${item.currentStock.abs()} | Nueva Calculada: $newExpectedStock'),
                          const SizedBox(height: 4),
                          TextFormField(
                            initialValue: item.reason,
                            decoration: const InputDecoration(
                              isDense: true,
                              labelText: 'Motivo / Referencia',
                              border: UnderlineInputBorder()
                            ),
                            onChanged: (val) {
                              item.reason = val.trim().isEmpty ? 'Ajuste In-situ App' : val;
                            },
                          )
                        ],
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                            onPressed: () => _updateDiff(index, -1),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isPositive ? Colors.green.shade50 : (isNegative ? Colors.red.shade50 : Colors.grey.shade100),
                              borderRadius: BorderRadius.circular(8)
                            ),
                            child: Text(
                              (item.diffQuantity > 0 ? '+' : '') + item.diffQuantity.toString(),
                              style: TextStyle(
                                fontSize: 18, 
                                fontWeight: FontWeight.bold,
                                color: isPositive ? Colors.green.shade700 : (isNegative ? Colors.red.shade700 : Colors.black87)
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline, color: Colors.green),
                            onPressed: () => _updateDiff(index, 1),
                          ),
                        ],
                      ),
                    );
                  },
              ),
          ),
        ],
      ),
      floatingActionButton: hasItems 
        ? FloatingActionButton.extended(
            onPressed: _isLoading ? null : _submitAdjustments,
            icon: _isLoading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.cloud_upload_rounded),
            label: Text(_isLoading ? 'Procesando...' : 'Aplicar Ajustes al Servidor'),
            backgroundColor: _isLoading ? Colors.grey : Colors.blue.shade700,
          )
        : null,
    );
  }
}
