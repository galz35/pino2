import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../domain/models/warehouse_models.dart';
import '../../data/warehouse_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';

class PickingChecklistScreen extends ConsumerStatefulWidget {
  const PickingChecklistScreen({
    required this.order,
    super.key,
  });

  final WarehouseOrder order;

  @override
  ConsumerState<PickingChecklistScreen> createState() => _PickingChecklistScreenState();
}

class _PickingChecklistScreenState extends ConsumerState<PickingChecklistScreen> {
  final Map<String, bool> _checkedItems = {};
  final Map<String, double> _realQuantities = {};
  final Map<String, String> _observations = {};
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    for (final item in widget.order.items) {
      _checkedItems[item.id] = false;
      _realQuantities[item.id] = item.quantity.toDouble();
    }
  }

  bool get _allChecked => _checkedItems.values.every((v) => v);

  Future<void> _confirmAlistado() async {
    setState(() => _isSaving = true);
    try {
      final session = ref.read(authControllerProvider).session;
      if (session == null) return;

      // Build report of partials if any
      final List<Map<String, dynamic>> partials = [];
      for (final item in widget.order.items) {
        if (_realQuantities[item.id] != item.quantity) {
          partials.add({
            'productId': item.productId,
            'originalQty': item.quantity,
            'realQty': _realQuantities[item.id],
            'observation': _observations[item.id] ?? 'Envío parcial',
          });
        }
      }

      await ref.read(warehouseRepositoryProvider).updateStatus(
        orderId: widget.order.id,
        accessToken: session.accessToken,
        status: 'ALISTADO',
        notes: partials.isNotEmpty ? 'Alistado parcial registrado' : null,
      );

      if (mounted) {
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Alistando: ${widget.order.clientName}'),
        actions: [
          if (widget.order.type == 'ABASTECIMIENTO_INTERNO')
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Chip(
                label: Text('PRIORIDAD', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                backgroundColor: Colors.red,
              ),
            )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: widget.order.items.length,
              itemBuilder: (context, index) {
                final item = widget.order.items[index];
                final bool isChecked = _checkedItems[item.id] ?? false;
                final double realQty = _realQuantities[item.id]!;
                final bool isPartial = realQty != item.quantity;

                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(
                      color: isChecked ? Colors.green.shade200 : Colors.transparent,
                      width: 2,
                    ),
                  ),
                  elevation: isChecked ? 0 : 2,
                  color: isChecked ? Colors.green.shade50 : Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Checkbox(
                              value: isChecked,
                              onChanged: (val) => setState(() => _checkedItems[item.id] = val ?? false),
                              activeColor: Colors.green,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            ),
                            Expanded(
                              child: Text(
                                item.productName,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  decoration: isChecked ? TextDecoration.lineThrough : null,
                                ),
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(left: 48),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'SOLICITADO: ${item.pickingBulks} bultos + ${item.pickingUnits} unidades',
                                style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Text('Real alistado:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                                  const SizedBox(width: 12),
                                  SizedBox(
                                    width: 80,
                                    height: 40,
                                    child: TextField(
                                      keyboardType: TextInputType.number,
                                      decoration: InputDecoration(
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 10),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                        filled: true,
                                        fillColor: Colors.white,
                                      ),
                                      onChanged: (val) {
                                        final dv = double.tryParse(val) ?? item.quantity.toDouble();
                                        setState(() => _realQuantities[item.id] = dv);
                                      },
                                      controller: TextEditingController(text: realQty.toStringAsFixed(0))..selection = TextSelection.fromPosition(TextPosition(offset: realQty.toStringAsFixed(0).length)),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(item.presentation, style: const TextStyle(fontSize: 12)),
                                ],
                              ),
                              if (isPartial) ...[
                                const SizedBox(height: 12),
                                TextField(
                                  decoration: const InputDecoration(
                                    labelText: 'Observación (Obligatorio por cambio de qty)',
                                    labelStyle: TextStyle(fontSize: 12, color: Colors.orange),
                                    border: OutlineInputBorder(),
                                    isDense: true,
                                  ),
                                  onChanged: (val) => _observations[item.id] = val,
                                ),
                              ]
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4))],
            ),
            child: SafeArea(
              child: FilledButton(
                onPressed: (_allChecked && !_isSaving) ? _confirmAlistado : null,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 54),
                  backgroundColor: const Color(0xFF0F172A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSaving 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('CONFIRMAR ALISTADO', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              ),
            ),
          )
        ],
      ),
    );
  }
}
