import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/controllers/auth_controller.dart';

class RouteReturnsScreen extends ConsumerStatefulWidget {
  const RouteReturnsScreen({super.key});

  @override
  ConsumerState<RouteReturnsScreen> createState() => _RouteReturnsScreenState();
}

class _RouteReturnsScreenState extends ConsumerState<RouteReturnsScreen> {
  bool _isSaving = false;

  void _confirmWithWarehouse() async {
    setState(() => _isSaving = true);
    try {
      final session = ref.read(authControllerProvider).session;
      if (session != null) {
        // Mocking a bulk return update for the current route session
        // In reality, this would likely be a specific endpoint for route liquidation items
        // For now, we simulate success message
        await Future.delayed(const Duration(seconds: 1));
        
        if (mounted) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              icon: const Icon(Icons.check_circle_rounded, color: Colors.green, size: 48),
              title: const Text('Retorno Confirmado'),
              content: const Text('Los productos han sido reintegrados al inventario de bodega correctamente.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.pop(context);
                  },
                  child: const Text('Entendido')
                )
              ],
            )
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error al confirmar: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Devoluciones a Bodega')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.shade200)),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: Colors.amber),
                SizedBox(width: 12),
                Expanded(child: Text('Presenta esta lista al bodeguero para reintegrar los items al inventario central.')),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const _ReturnItemTile(name: 'Coca Cola 600ml', qty: 24, reason: 'Cliente ausente'),
          const _ReturnItemTile(name: 'Aceite Ideal 1L', qty: 2, reason: 'Producto dañado'),
          const _ReturnItemTile(name: 'Galleta María', qty: 12, reason: 'No tiene dinero'),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: _isSaving ? null : _confirmWithWarehouse,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 54),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
            ),
            child: _isSaving 
              ? const CircularProgressIndicator(color: Colors.white)
              : const Text('CONFIRMAR ENTREGA EN BODEGA', style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}

class _ReturnItemTile extends StatelessWidget {
  const _ReturnItemTile({required this.name, required this.qty, required this.reason});
  final String name;
  final int qty;
  final String reason;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Motivo: $reason'),
        trailing: Text('x$qty', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
      ),
    );
  }
}
