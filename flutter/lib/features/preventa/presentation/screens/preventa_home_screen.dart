import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/delta_sync_service.dart';
import '../../../../core/network/sync_queue_processor.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import 'package:intl/intl.dart';

class PreventaHomeScreen extends ConsumerStatefulWidget {
  const PreventaHomeScreen({super.key});

  @override
  ConsumerState<PreventaHomeScreen> createState() => _PreventaHomeScreenState();
}

class _PreventaHomeScreenState extends ConsumerState<PreventaHomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authControllerProvider);
    final session = authState.session;

    if (session == null) return const Scaffold();

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    // Formatter date
    final todayStr = DateFormat('EEEE d \'de\' MMMM', 'es').format(DateTime.now());

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Preventa'),
        elevation: 0,
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            tooltip: 'Sincronizar ahora',
            icon: const Icon(Icons.sync_rounded),
            onPressed: () async {
              // Trigger both delta sync (pull) and queue processing (push)
              await ref.read(deltaSyncServiceProvider).syncData();
              await ref.read(syncQueueProcessorProvider.notifier).processPendingQueue();
              
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Sincronización finalizada')),
                );
              }
            },
          ),
          IconButton(
            tooltip: 'Cerrar sesión',
            icon: const Icon(Icons.logout_rounded),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        children: [
           // Hero Session
           Container(
             padding: const EdgeInsets.all(22),
             decoration: BoxDecoration(
               borderRadius: BorderRadius.circular(24),
               gradient: const LinearGradient(
                 colors: [Color(0xFF047857), Color(0xFF065F46)], // Emerald tones
                 begin: Alignment.topLeft,
                 end: Alignment.bottomRight,
               ),
               boxShadow: [
                 BoxShadow(
                   color: const Color(0xFF047857).withValues(alpha: 0.3),
                   blurRadius: 16,
                   offset: const Offset(0, 8),
                 )
               ]
             ),
             child: Column(
               crossAxisAlignment: CrossAxisAlignment.start,
               children: [
                 Text(
                   'Buenos días, ${session.user.name.split(' ').first}',
                   style: theme.textTheme.headlineSmall?.copyWith(
                     color: Colors.white,
                     fontWeight: FontWeight.w800,
                   ),
                 ),
                 const SizedBox(height: 8),
                 Row(
                   children: [
                     const Icon(Icons.calendar_today_rounded, color: Colors.white70, size: 16),
                     const SizedBox(width: 6),
                     Text(
                       todayStr.toUpperCase(),
                       style: theme.textTheme.bodyMedium?.copyWith(
                         color: Colors.white.withValues(alpha: 0.9),
                         fontWeight: FontWeight.w600,
                       ),
                     ),
                   ],
                 ),
                 const SizedBox(height: 16),
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                   decoration: BoxDecoration(
                     color: Colors.white.withValues(alpha: 0.2),
                     borderRadius: BorderRadius.circular(999),
                   ),
                   child: const Row(
                     mainAxisSize: MainAxisSize.min,
                     children: [
                       Icon(Icons.check_circle_rounded, color: Color(0xFFA7F3D0), size: 16),
                       SizedBox(width: 6),
                       Text(
                         'Sincronizado hace 5min',
                         style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                       )
                     ],
                   ),
                 )
               ],
             ),
           ),

           const SizedBox(height: 24),

           // KPI Grid
           GridView.count(
             crossAxisCount: 2,
             shrinkWrap: true,
             physics: const NeverScrollableScrollPhysics(),
             crossAxisSpacing: 16,
             mainAxisSpacing: 16,
             childAspectRatio: 1.4,
             children: [
               _buildKpiCard(
                 title: 'Visitas',
                 value: '8',
                 subtitle: 'de 15 asignadas',
                 icon: Icons.storefront_rounded,
                 color: const Color(0xFF3B82F6),
               ),
               _buildKpiCard(
                 title: 'Vendido',
                 value: 'C\$ 12k',
                 subtitle: 'Total del día',
                 icon: Icons.attach_money_rounded,
                 color: const Color(0xFF10B981),
               ),
               _buildKpiCard(
                 title: 'Pedidos',
                 value: '5',
                 subtitle: 'Emitidos hoy',
                 icon: Icons.shopping_basket_rounded,
                 color: const Color(0xFFF59E0B),
               ),
               _buildKpiCard(
                 title: 'Pendientes',
                 value: '2',
                 subtitle: 'Por sincronizar',
                 icon: Icons.cloud_upload_rounded,
                 color: const Color(0xFFEF4444),
               ),
             ],
           ),

           const SizedBox(height: 24),

           // Main Action
           ElevatedButton(
             onPressed: () {
                context.push('/preventa-route');
             },
             style: ElevatedButton.styleFrom(
               backgroundColor: const Color(0xFF0F172A),
               foregroundColor: Colors.white,
               padding: const EdgeInsets.symmetric(vertical: 20),
               shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
               elevation: 8,
               shadowColor: const Color(0xFF0F172A).withValues(alpha: 0.4),
             ),
             child: const Row(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 Icon(Icons.directions_car_rounded, size: 24),
                 SizedBox(width: 12),
                 Text('INICIAR RUTA DEL DÍA', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
               ],
             ),
           ),

           const SizedBox(height: 24),

           // Ultimos pedidos
           Text(
             'Últimos pedidos del día',
             style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
           ),
           const SizedBox(height: 12),
           
           Container(
             decoration: BoxDecoration(
               color: isDark ? const Color(0xFF1E293B) : Colors.white,
               borderRadius: BorderRadius.circular(20),
               boxShadow: [
                 BoxShadow(
                   color: Colors.black.withValues(alpha: 0.03),
                   blurRadius: 10,
                   offset: const Offset(0, 4),
                 )
               ],
               border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
             ),
             child: Column(
               children: [
                 _buildRecentOrderRow('Pulp. Doña María', 'C\$ 450.00', '10:45 AM', true),
                 const Divider(height: 1),
                 _buildRecentOrderRow('Mini Súper El Sol', 'C\$ 1,200.00', '09:12 AM', false),
               ],
             ),
           )
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: const Color(0xFF047857),
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          if (index == 1) {
            context.push('/preventa-clients');
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Inicio'),
          BottomNavigationBarItem(icon: Icon(Icons.people_alt_rounded), label: 'Mis Clientes'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_rounded), label: 'Catálogo'),
        ],
      ),
    );
  }

  Widget _buildKpiCard({required String title, required String value, required String subtitle, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black54, fontSize: 13)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 24, letterSpacing: -0.5)),
              Text(subtitle, style: const TextStyle(color: Colors.black45, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildRecentOrderRow(String client, String ammount, String time, bool synced) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.receipt_rounded, size: 20, color: Colors.black54),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(client, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 12, color: Colors.grey.shade500),
                    const SizedBox(width: 4),
                    Text(time, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                  ],
                )
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(ammount, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF047857))),
              const SizedBox(height: 4),
              Icon(
                synced ? Icons.cloud_done_rounded : Icons.cloud_upload_rounded, 
                size: 14, 
                color: synced ? Colors.green : Colors.orange
              ),
            ],
          )
        ],
      ),
    );
  }
}
