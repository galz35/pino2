import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class PreventaClientsScreen extends ConsumerStatefulWidget {
  const PreventaClientsScreen({super.key});

  @override
  ConsumerState<PreventaClientsScreen> createState() => _PreventaClientsScreenState();
}

class _PreventaClientsScreenState extends ConsumerState<PreventaClientsScreen> {
  final _searchCtrl = TextEditingController();

  final List<Map<String, dynamic>> _clients = [
    {
      'id': '1',
      'name': 'Pulp. Doña María',
      'group': 'Zona Norte',
      'balance': 450.0,
      'address': 'De la iglesia 1/2c al sur',
      'phone': '8888-1111',
      'daysSinceVisit': 1
    },
    {
      'id': '2',
      'name': 'Mini Súper El Sol',
      'group': 'Zona Sur',
      'balance': 1200.0,
      'address': 'Frente al parque central',
      'phone': '8888-2222',
      'daysSinceVisit': 5
    },
    {
      'id': '3',
      'name': 'Abarrotería Los Pinos',
      'group': 'Zona Norte',
      'balance': 0.0,
      'address': 'Barrio San Luis',
      'phone': '8888-3333',
      'daysSinceVisit': 7
    },
  ];

  @override
  Widget build(BuildContext context) {
    // Grupo por "group"
    final Map<String, List<Map<String, dynamic>>> grouped = {};
    for (var c in _clients) {
      grouped.putIfAbsent(c['group'], () => []).add(c);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Mis Clientes'),
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0F172A),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Buscar cliente...',
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(vertical: 0)
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: grouped.keys.length,
              itemBuilder: (context, index) {
                 final groupName = grouped.keys.elementAt(index);
                 final clientsInGroup = grouped[groupName]!;

                 return Card(
                   margin: const EdgeInsets.only(bottom: 16),
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                   elevation: 2,
                   child: ExpansionTile(
                     title: Text(groupName, style: const TextStyle(fontWeight: FontWeight.bold)),
                     subtitle: Text('${clientsInGroup.length} clientes'),
                     initiallyExpanded: true,
                     children: clientsInGroup.map((c) {
                       return ListTile(
                         contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                         title: Text(c['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                         subtitle: Column(
                           crossAxisAlignment: CrossAxisAlignment.start,
                           children: [
                             const SizedBox(height: 4),
                             Row(
                               children: [
                                 const Icon(Icons.location_on, size: 14, color: Colors.grey),
                                 const SizedBox(width: 4),
                                 Expanded(child: Text(c['address'], overflow: TextOverflow.ellipsis)),
                               ],
                             ),
                             const SizedBox(height: 4),
                             Text('Hace ${c['daysSinceVisit']} días', style: const TextStyle(color: Colors.black54, fontSize: 12)),
                           ],
                         ),
                         trailing: Column(
                           mainAxisAlignment: MainAxisAlignment.center,
                           crossAxisAlignment: CrossAxisAlignment.end,
                           children: [
                             const Text('Saldo', style: TextStyle(fontSize: 10, color: Colors.black54)),
                             Text('C\$ ${c['balance']}', style: TextStyle(fontWeight: FontWeight.bold, color: c['balance'] > 0 ? Colors.red : Colors.green)),
                           ],
                         ),
                         onTap: () {
                           final paramId = c['id'];
                           final paramName = Uri.encodeComponent(c['name'] as String);
                           context.push('/preventa-order?clientId=$paramId&clientName=$paramName');
                         },
                       );
                     }).toList(),
                   ),
                 );
              },
            ),
          )
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/preventa-add-client'),
        backgroundColor: const Color(0xFF047857),
        icon: const Icon(Icons.person_add, color: Colors.white),
        label: const Text('Nuevo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
