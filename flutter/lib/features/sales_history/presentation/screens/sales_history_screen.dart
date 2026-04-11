import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';

class SalesHistoryScreen extends ConsumerStatefulWidget {
  const SalesHistoryScreen({
    super.key,
    required this.storeId,
    this.storeName,
  });

  final String storeId;
  final String? storeName;

  @override
  ConsumerState<SalesHistoryScreen> createState() => _SalesHistoryScreenState();
}

class _SalesHistoryScreenState extends ConsumerState<SalesHistoryScreen> {
  List<Map<String, dynamic>> _sales = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchSales();
  }

  Future<void> _fetchSales() async {
    setState(() => _loading = true);
    try {
      final api = ref.read(appApiClientProvider);
      final res = await api.getList('/sales', queryParameters: {
        'storeId': widget.storeId,
      });
      final today = DateTime.now();
      final todayStr =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

      _sales = res
          .where((s) => (s['createdAt'] ?? '').toString().startsWith(todayStr))
          .cast<Map<String, dynamic>>()
          .toList()
        ..sort((a, b) =>
            (b['createdAt'] ?? '').compareTo(a['createdAt'] ?? ''));
    } catch (e) {
      debugPrint('Error fetching sales: $e');
      _sales = [];
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final totalAmount = _sales.fold<double>(
      0,
      (sum, s) => sum + (double.tryParse(s['total']?.toString() ?? '0') ?? 0),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ventas del Día'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _fetchSales,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchSales,
              child: CustomScrollView(
                slivers: [
                  // Summary header
                  SliverToBoxAdapter(
                    child: Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E293B), Color(0xFF334155)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${_sales.length} ventas',
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Hoy',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'C\$ ${totalAmount.toStringAsFixed(2)}',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  color: const Color(0xFF34D399),
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Total recaudado',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.white54,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Sales list
                  if (_sales.isEmpty)
                    SliverFillRemaining(
                      child: Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.receipt_long_rounded,
                              size: 64,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.2),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Sin ventas hoy',
                              style: theme.textTheme.titleMedium?.copyWith(
                                color: theme.colorScheme.onSurface
                                    .withValues(alpha: 0.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final sale = _sales[index];
                          final total = double.tryParse(
                                  sale['total']?.toString() ?? '0') ??
                              0;
                          final createdAt =
                              sale['createdAt']?.toString() ?? '';
                          final time = createdAt.length > 16
                              ? createdAt.substring(11, 16)
                              : '--:--';
                          final id =
                              (sale['id'] ?? '').toString();
                          final shortId = id.length > 6
                              ? id.substring(0, 6)
                              : id;
                          final clientName =
                              sale['clientName'] ??
                                  sale['client_name'] ??
                                  'Venta directa';
                          final payType =
                              sale['paymentType'] ??
                                  sale['payment_type'] ??
                                  'Contado';

                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: Card(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                leading: CircleAvatar(
                                  radius: 22,
                                  backgroundColor: theme.colorScheme.primary
                                      .withValues(alpha: 0.1),
                                  child: Text(
                                    '#${index + 1}',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 12,
                                      color: theme.colorScheme.primary,
                                    ),
                                  ),
                                ),
                                title: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        clientName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Text(
                                      'C\$ ${total.toStringAsFixed(2)}',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 16,
                                        color: theme.colorScheme.primary,
                                      ),
                                    ),
                                  ],
                                ),
                                subtitle: Row(
                                  children: [
                                    Text(
                                      time,
                                      style: theme.textTheme.bodySmall,
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.primary
                                            .withValues(alpha: 0.08),
                                        borderRadius:
                                            BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        payType,
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                          color: theme.colorScheme.primary,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      '#$shortId',
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                        color: theme.colorScheme.onSurface
                                            .withValues(alpha: 0.3),
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: _sales.length,
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}
