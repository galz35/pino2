import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/database/local_cache_repository.dart';

class PreventaRouteScreen extends ConsumerStatefulWidget {
  const PreventaRouteScreen({super.key});

  @override
  ConsumerState<PreventaRouteScreen> createState() => _PreventaRouteScreenState();
}

class _PreventaRouteScreenState extends ConsumerState<PreventaRouteScreen> {
  // Datos simulados para prototipo visual
  final clientsRoute = [
    {
      'id': '1',
      'name': 'Pulp. Doña María',
      'address': 'De la iglesia 1/2c al sur',
      'status': 'Al día',
      'lastOrder': 'Ayer (C\$ 450)',
      'visited': true
    },
    {
      'id': '2',
      'name': 'Mini Súper El Sol',
      'address': 'Frente al parque central',
      'status': 'Mora',
      'lastOrder': 'Hace 5 días (C\$ 1200)',
      'visited': true
    },
    {
      'id': '3',
      'name': 'Abarrotería Los Pinos',
      'address': 'Barrio San Luis',
      'status': 'Al día',
      'lastOrder': 'Hace 1 semana (C\$ 3000)',
      'visited': false
    },
    {
      'id': '4',
      'name': 'Pulpería La Bendición',
      'address': 'Empalme carretera norte',
      'status': 'Por vencer',
      'lastOrder': 'Hace 3 días (C\$ 850)',
      'visited': false
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
                     Text('2 / ${clientsRoute.length} Clientes', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                   ],
                 ),
                 CircularProgressIndicator(
                   value: 2 / clientsRoute.length,
                   backgroundColor: Colors.grey.shade200,
                   color: const Color(0xFF047857),
                   strokeWidth: 6,
                 )
               ],
             ),
           ),
           const Divider(height: 1),
           Expanded(
             child: ListView.builder(
               padding: const EdgeInsets.all(16),
               itemCount: clientsRoute.length,
               itemBuilder: (context, index) {
                 final c = clientsRoute[index];
                 final bool visited = c['visited'] as bool;
                 
                 return GestureDetector(
                   onTap: () {
                     final paramId = c['id'];
                     final paramName = Uri.encodeComponent(c['name'] as String);
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
                                 c['name'] as String,
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
                                   Expanded(child: Text(c['address'] as String, style: TextStyle(color: Colors.grey.shade600, fontSize: 13), overflow: TextOverflow.ellipsis)),
                                 ],
                               ),
                               const SizedBox(height: 10),
                               Row(
                                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                 children: [
                                    _buildStatusBadge(c['status'] as String),
                                    Row(
                                      children: [
                                         IconButton(
                                           icon: const Icon(Icons.not_interested_rounded, color: Colors.red, size: 20),
                                           tooltip: 'No compra',
                                           onPressed: () async {
                                              await ref.read(localCacheRepositoryProvider).signVisit(
                                                clientId: c['id'] as String,
                                                status: 'no_buy',
                                              );
                                              if (context.mounted) {
                                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Visita (Sin compra) registrada.')));
                                              }
                                           },
                                         ),
                                         Text('Último: ${c['lastOrder']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54)),
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
    if (status == 'Al día') { bg = Colors.green.shade100; fg = Colors.green.shade800; }
    else if (status == 'Por vencer') { bg = Colors.amber.shade100; fg = Colors.amber.shade800; }
    else { bg = Colors.red.shade100; fg = Colors.red.shade800; }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(status, style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
