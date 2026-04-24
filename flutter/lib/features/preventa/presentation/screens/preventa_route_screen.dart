import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/database/local_cache_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../clients/domain/models/client_summary.dart';

class PreventaRouteScreen extends ConsumerStatefulWidget {
  const PreventaRouteScreen({super.key});

  @override
  ConsumerState<PreventaRouteScreen> createState() => _PreventaRouteScreenState();
}

class _PreventaRouteScreenState extends ConsumerState<PreventaRouteScreen> {
  List<ClientSummary> _clientsRoute = [];
  Set<String> _visitedClientIds = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadRoute();
  }

  Future<void> _loadRoute() async {
    final storeId = ref.read(authControllerProvider).session?.user.primaryStoreId;
    if (storeId == null || storeId.isEmpty) {
      setState(() => _loading = false);
      return;
    }

    final repository = ref.read(localCacheRepositoryProvider);
    final clients = await repository.getClients(storeId);
    final routes = await repository.getRoutes(storeId);
    final visits = await repository.getVisits();

    final now = DateTime.now();
    final todaysRoutes = routes.where((route) {
      final routeDate = route.routeDate;
      if (routeDate == null) return false;
      return routeDate.year == now.year &&
          routeDate.month == now.month &&
          routeDate.day == now.day;
    }).toList();

    final routeClientIds = todaysRoutes
        .expand((route) => route.clientIds)
        .where((id) => id.isNotEmpty)
        .toSet();

    final selectedClients = routeClientIds.isEmpty
        ? clients
        : clients.where((client) => routeClientIds.contains(client.id)).toList();

    if (!mounted) return;
    setState(() {
      _clientsRoute = selectedClients;
      _visitedClientIds = visits.map((visit) => visit.clientId).toSet();
      _loading = false;
    });
  }

  Future<void> _markNoBuy(String clientId) async {
    await ref.read(localCacheRepositoryProvider).signVisit(
          clientId: clientId,
          status: 'no_buy',
        );
    if (!mounted) return;
    setState(() => _visitedClientIds = {..._visitedClientIds, clientId});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Visita sin compra registrada.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final visitedCount = _clientsRoute
        .where((client) => _visitedClientIds.contains(client.id))
        .length;
    final totalCount = _clientsRoute.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Ruta del Día'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
           Container(
             padding: const EdgeInsets.all(16),
             color: Colors.white,
             child: Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     const Text('Progreso de Visitas', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black54)),
                     const SizedBox(height: 4),
                     Text('$visitedCount / $totalCount Clientes', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                   ],
                 ),
                 CircularProgressIndicator(
                   value: totalCount == 0 ? 0 : visitedCount / totalCount,
                   backgroundColor: Colors.grey.shade200,
                   color: const Color(0xFF047857),
                   strokeWidth: 6,
                 )
               ],
             ),
           ),
           const Divider(height: 1),
           Expanded(
             child: _loading
                 ? const Center(child: CircularProgressIndicator())
                 : _clientsRoute.isEmpty
                     ? const Center(child: Text('No hay ruta local sincronizada.'))
                     : ListView.builder(
               padding: const EdgeInsets.all(16),
               itemCount: _clientsRoute.length,
               itemBuilder: (context, index) {
                 final client = _clientsRoute[index];
                 final visited = _visitedClientIds.contains(client.id);
                 
                 return GestureDetector(
                   onTap: () {
                     final paramId = client.id;
                     final paramName = Uri.encodeComponent(client.name);
                     context.push('/preventa-order?clientId=$paramId&clientName=$paramName');
                   },
                   child: Container(
                     margin: const EdgeInsets.only(bottom: 12),
                     padding: const EdgeInsets.all(16),
                     decoration: BoxDecoration(
                       color: visited ? Colors.grey.shade50 : Colors.white,
                       borderRadius: BorderRadius.circular(16),
                       border: Border.all(
                         color: visited ? Colors.grey.shade300 : const Color(0xFF047857).withValues(alpha: 0.3),
                         width: visited ? 1 : 2
                       ),
                       boxShadow: visited ? [] : [
                         BoxShadow(
                           color: const Color(0xFF047857).withValues(alpha: 0.1),
                           blurRadius: 10,
                           offset: const Offset(0, 4),
                         )
                       ]
                     ),
                     child: Row(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         // Checkbox area
                         Container(
                           margin: const EdgeInsets.only(right: 16, top: 4),
                           child: Icon(
                             visited ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                             color: visited ? Colors.green : Colors.grey.shade400,
                             size: 28,
                           ),
                         ),
                         // Info area
                         Expanded(
                           child: Column(
                             crossAxisAlignment: CrossAxisAlignment.start,
                             children: [
                               Text(
                                 client.name,
                                 style: theme.textTheme.titleMedium?.copyWith(
                                   fontWeight: FontWeight.bold,
                                   decoration: visited ? TextDecoration.lineThrough : null,
                                   color: visited ? Colors.grey : Colors.black87
                                 ),
                               ),
                               const SizedBox(height: 4),
                               Row(
                                 children: [
                                   Icon(Icons.location_on_rounded, size: 14, color: Colors.grey.shade500),
                                   const SizedBox(width: 4),
                                   Expanded(child: Text(client.address ?? 'Sin dirección', style: TextStyle(color: Colors.grey.shade600, fontSize: 13), overflow: TextOverflow.ellipsis)),
                                 ],
                               ),
                               const SizedBox(height: 10),
                               Row(
                                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                 children: [
                                    _buildStatusBadge(visited ? 'Visitado' : 'Pendiente'),
                                    Row(
                                      children: [
                                         IconButton(
                                           icon: const Icon(Icons.not_interested_rounded, color: Colors.red, size: 20),
                                           tooltip: 'No compra',
                                           onPressed: visited ? null : () => _markNoBuy(client.id),
                                         ),
                                         Text(client.phone ?? 'Sin teléfono', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54)),
                                      ],
                                    ),
                                 ],
                               )
                             ],
                           ),
                         ),
                       ],
                     ),
                   ),
                 );
               },
             ),
           )
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;
    if (status == 'Visitado') { bg = Colors.green.shade100; fg = Colors.green.shade800; }
    else { bg = Colors.amber.shade100; fg = Colors.amber.shade800; }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(status, style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
