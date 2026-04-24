import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/database/local_cache_repository.dart';
import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../../clients/domain/models/client_summary.dart';

class PreventaClientsScreen extends ConsumerStatefulWidget {
  const PreventaClientsScreen({super.key});

  @override
  ConsumerState<PreventaClientsScreen> createState() =>
      _PreventaClientsScreenState();
}

class _PreventaClientsScreenState extends ConsumerState<PreventaClientsScreen> {
  final _searchCtrl = TextEditingController();
  List<ClientSummary> _clients = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(() => setState(() {}));
    _loadClients();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadClients() async {
    final storeId = ref.read(authControllerProvider).session?.user.primaryStoreId;
    if (storeId == null || storeId.isEmpty) {
      setState(() => _loading = false);
      return;
    }

    final clients = await ref.read(localCacheRepositoryProvider).getClients(storeId);
    if (!mounted) return;

    setState(() {
      _clients = clients;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchCtrl.text.trim().toLowerCase();
    final filtered = _clients.where((client) {
      if (query.isEmpty) return true;
      return client.name.toLowerCase().contains(query) ||
          (client.phone ?? '').toLowerCase().contains(query) ||
          (client.address ?? '').toLowerCase().contains(query);
    }).toList();

    final grouped = <String, List<ClientSummary>>{};
    for (final client in filtered) {
      grouped.putIfAbsent('Clientes sincronizados', () => []).add(client);
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
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : grouped.isEmpty
                    ? const Center(
                        child: Text('No hay clientes locales sincronizados.'),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: grouped.keys.length,
                        itemBuilder: (context, index) {
                          final groupName = grouped.keys.elementAt(index);
                          final clientsInGroup = grouped[groupName]!;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 2,
                            child: ExpansionTile(
                              title: Text(
                                groupName,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text('${clientsInGroup.length} clientes'),
                              initiallyExpanded: true,
                              children: clientsInGroup.map((client) {
                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  title: Text(
                                    client.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.location_on,
                                            size: 14,
                                            color: Colors.grey,
                                          ),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              client.address ?? 'Sin dirección',
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if ((client.phone ?? '').isNotEmpty) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          client.phone!,
                                          style: const TextStyle(
                                            color: Colors.black54,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  trailing:
                                      const Icon(Icons.chevron_right_rounded),
                                  onTap: () {
                                    final paramId = client.id;
                                    final paramName =
                                        Uri.encodeComponent(client.name);
                                    context.push(
                                      '/preventa-order?clientId=$paramId&clientName=$paramName',
                                    );
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
