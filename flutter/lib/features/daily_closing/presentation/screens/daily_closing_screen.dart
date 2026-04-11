import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/controllers/auth_controller.dart';
import '../../data/daily_closing_repository.dart';

class DailyClosingScreen extends ConsumerStatefulWidget {
  const DailyClosingScreen({required this.storeId, this.storeName, super.key});

  final String storeId;
  final String? storeName;

  @override
  ConsumerState<DailyClosingScreen> createState() => _DailyClosingScreenState();
}

class _DailyClosingScreenState extends ConsumerState<DailyClosingScreen> {
  bool _isLoading = true;
  bool _isSubmitting = false;
  bool _alreadyClosed = false;
  final _notesController = TextEditingController();

  List<Map<String, dynamic>> _deliveries = [];
  List<Map<String, dynamic>> _returns = [];
  List<Map<String, dynamic>> _collections = [];

  String get _today {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  String get _todayFormatted {
    final now = DateTime.now();
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const days = [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo',
    ];
    final dayName = days[now.weekday - 1];
    final monthName = months[now.month - 1];
    return '$dayName ${now.day} de $monthName, ${now.year}';
  }

  // ──── Computed stats ────

  int get _deliveredCount =>
      _deliveries.where((d) => d['status'] == 'Entregado').length;
  int get _notDeliveredCount =>
      _deliveries.where((d) => d['status'] == 'No Entregado').length;
  int get _pendingCount =>
      _deliveries.where((d) => d['status'] == 'Pendiente').length;

  double get _totalSales => _deliveries
      .where((d) => d['status'] == 'Entregado')
      .fold<double>(0, (s, d) => s + (double.tryParse('${d['total']}') ?? 0));

  double get _totalReturns => _returns.fold<double>(
    0,
    (s, r) => s + (double.tryParse('${r['total']}') ?? 0),
  );

  double get _totalCollections => _collections.fold<double>(
    0,
    (s, c) =>
        s + (double.tryParse('${c['amount'] ?? c['pendingAmount']}') ?? 0),
  );

  double get _cashTotal {
    final v = _totalSales + _totalCollections - _totalReturns;
    return v < 0 ? 0 : v;
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final session = ref.read(authControllerProvider).session;
    if (session == null) return;
    setState(() => _isLoading = true);

    try {
      final repo = ref.read(dailyClosingRepositoryProvider);
      final token = session.accessToken;
      final results = await Future.wait([
        repo.fetchDeliveries(
          storeId: widget.storeId,
          ruteroId: session.user.id,
          accessToken: token,
        ),
        repo.fetchReturns(
          storeId: widget.storeId,
          ruteroId: session.user.id,
          date: _today,
          accessToken: token,
        ),
        repo.fetchCollections(storeId: widget.storeId, accessToken: token),
      ]);

      final closed = await repo.hasClosingForToday(
        storeId: widget.storeId,
        ruteroId: session.user.id,
        date: _today,
        accessToken: token,
      );

      if (!mounted) return;
      setState(() {
        _deliveries = results[0];
        _returns = results[1];
        _collections = results[2];
        _alreadyClosed = closed;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error al cargar datos: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitClosing() async {
    final session = ref.read(authControllerProvider).session;
    if (session == null) return;

    setState(() => _isSubmitting = true);
    final repo = ref.read(dailyClosingRepositoryProvider);

    try {
      final result = await repo.submitClosing(
        storeId: widget.storeId,
        ruteroId: session.user.id,
        totalSales: _totalSales,
        totalCollections: _totalCollections,
        totalReturns: _totalReturns,
        cashTotal: _cashTotal,
        closingDate: _today,
        notes: _notesController.text.isEmpty
            ? 'Cierre de caja — ${session.user.name} — $_todayFormatted'
            : _notesController.text,
        accessToken: session.accessToken,
      );

      if (!mounted) return;
      final queued = result['queuedOffline'] == true;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            queued
                ? 'Cierre guardado en cola offline.'
                : 'Caja cerrada. Efectivo: C\$ ${_cashTotal.toStringAsFixed(2)}',
          ),
        ),
      );

      setState(() => _alreadyClosed = true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  void _showConfirmDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: const Text(
          'Confirmar cierre de caja',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Cierre del día $_todayFormatted',
              style: const TextStyle(color: Colors.black54, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                children: [
                  _ConfirmRow(label: 'Ventas', value: _totalSales),
                  const SizedBox(height: 8),
                  _ConfirmRow(label: 'Cobros', value: _totalCollections),
                  const SizedBox(height: 8),
                  _ConfirmRow(
                    label: 'Devoluciones',
                    value: _totalReturns,
                    negative: true,
                  ),
                  const Divider(height: 20),
                  _ConfirmRow(
                    label: 'Efectivo total',
                    value: _cashTotal,
                    bold: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _notesController,
              minLines: 2,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Notas (opcional)',
                hintText: 'Observaciones del día...',
                alignLabelWithHint: true,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton.icon(
            onPressed: _isSubmitting
                ? null
                : () {
                    Navigator.pop(ctx);
                    _submitClosing();
                  },
            icon: _isSubmitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.check_circle_rounded),
            label: const Text('Cerrar caja'),
          ),
        ],
      ),
    );
  }

  // ──── BUILD ────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cierre de Caja')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 100),
                children: [
                  // ── Hero card ──
                  _ClosingHero(
                    storeName: widget.storeName,
                    todayFormatted: _todayFormatted,
                    alreadyClosed: _alreadyClosed,
                  ),
                  const SizedBox(height: 18),

                  // ── Metric chips ──
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      _MetricChip(
                        icon: Icons.local_shipping_rounded,
                        label: 'Entregas',
                        value: '$_deliveredCount / ${_deliveries.length}',
                        color: const Color(0xFF3B82F6),
                      ),
                      _MetricChip(
                        icon: Icons.attach_money_rounded,
                        label: 'Ventas',
                        value: 'C\$ ${_totalSales.toStringAsFixed(2)}',
                        color: const Color(0xFF22C55E),
                      ),
                      _MetricChip(
                        icon: Icons.assignment_return_rounded,
                        label: 'Devol.',
                        value: 'C\$ ${_totalReturns.toStringAsFixed(2)}',
                        color: const Color(0xFFF97316),
                      ),
                      _MetricChip(
                        icon: Icons.wallet_rounded,
                        label: 'Efectivo',
                        value: 'C\$ ${_cashTotal.toStringAsFixed(2)}',
                        color: const Color(0xFF6366F1),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),

                  // ── Deliveries section ──
                  _SectionHeader(
                    icon: Icons.local_shipping_rounded,
                    title: 'Entregas del día',
                    subtitle:
                        '$_deliveredCount entregados · $_notDeliveredCount no entregados · $_pendingCount pendientes',
                  ),
                  const SizedBox(height: 8),
                  if (_deliveries.isEmpty)
                    const _EmptySection(text: 'Sin entregas registradas hoy.')
                  else
                    ..._deliveries.map(
                      (d) => _DeliveryTile(
                        clientName: d['clientName'] ?? '—',
                        paymentType: d['paymentType'] ?? '',
                        total: double.tryParse('${d['total']}') ?? 0,
                        status: d['status'] ?? 'Pendiente',
                      ),
                    ),
                  const SizedBox(height: 22),

                  // ── Returns section ──
                  _SectionHeader(
                    icon: Icons.assignment_return_rounded,
                    title: 'Devoluciones del día',
                    subtitle:
                        '${_returns.length} devolución(es) — C\$ ${_totalReturns.toStringAsFixed(2)}',
                  ),
                  const SizedBox(height: 8),
                  if (_returns.isEmpty)
                    const _EmptySection(text: 'Sin devoluciones hoy.')
                  else
                    ..._returns.map(
                      (r) => _ReturnTile(
                        notes:
                            r['notes'] as String? ??
                            'Devolución #${(r['id'] as String? ?? '').substring(0, 8)}',
                        total: double.tryParse('${r['total']}') ?? 0,
                      ),
                    ),
                  const SizedBox(height: 22),

                  // ── Summary card ──
                  _ClosingSummaryCard(
                    totalSales: _totalSales,
                    totalCollections: _totalCollections,
                    totalReturns: _totalReturns,
                    cashTotal: _cashTotal,
                  ),
                ],
              ),
            ),
      bottomSheet: _isLoading
          ? null
          : _ClosingFooter(
              alreadyClosed: _alreadyClosed,
              pendingCount: _pendingCount,
              isSubmitting: _isSubmitting,
              cashTotal: _cashTotal,
              onSubmit: _showConfirmDialog,
            ),
    );
  }
}

// ═══════════════════════════════════════════════════
//  Sub-widgets
// ═══════════════════════════════════════════════════

class _ClosingHero extends StatelessWidget {
  const _ClosingHero({
    this.storeName,
    required this.todayFormatted,
    required this.alreadyClosed,
  });

  final String? storeName;
  final String todayFormatted;
  final bool alreadyClosed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(28),
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF312E81)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (alreadyClosed)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF22C55E).withValues(alpha: 0.22),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    color: Color(0xFF86EFAC),
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    'Caja ya cerrada hoy',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF86EFAC),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          Text(
            storeName != null
                ? 'Cierre de Caja • $storeName'
                : 'Cierre de Caja',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            todayFormatted,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.72),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: const Color(0xFF475569)),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: Colors.black54),
        ),
      ],
    );
  }
}

class _EmptySection extends StatelessWidget {
  const _EmptySection({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Center(
        child: Text(text, style: const TextStyle(color: Colors.black38)),
      ),
    );
  }
}

class _DeliveryTile extends StatelessWidget {
  const _DeliveryTile({
    required this.clientName,
    required this.paymentType,
    required this.total,
    required this.status,
  });

  final String clientName;
  final String paymentType;
  final double total;
  final String status;

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (status) {
      'Entregado' => const Color(0xFF22C55E),
      'No Entregado' => const Color(0xFFEF4444),
      _ => const Color(0xFF94A3B8),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  clientName,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                if (paymentType.isNotEmpty)
                  Text(
                    paymentType,
                    style: const TextStyle(fontSize: 12, color: Colors.black45),
                  ),
              ],
            ),
          ),
          Text(
            'C\$ ${total.toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.w800),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              status,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: statusColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReturnTile extends StatelessWidget {
  const _ReturnTile({required this.notes, required this.total});

  final String notes;
  final double total;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              notes,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Text(
            'C\$ ${total.toStringAsFixed(2)}',
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: Color(0xFFF97316),
            ),
          ),
        ],
      ),
    );
  }
}

class _ClosingSummaryCard extends StatelessWidget {
  const _ClosingSummaryCard({
    required this.totalSales,
    required this.totalCollections,
    required this.totalReturns,
    required this.cashTotal,
  });

  final double totalSales;
  final double totalCollections;
  final double totalReturns;
  final double cashTotal;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFEEF2FF),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFC7D2FE),
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.receipt_long_rounded,
                color: Color(0xFF4F46E5),
                size: 22,
              ),
              SizedBox(width: 8),
              Text(
                'Resumen para cierre',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF312E81),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SummaryRow(label: 'Total vendido', value: totalSales),
          const SizedBox(height: 8),
          _SummaryRow(label: 'Total cobrado', value: totalCollections),
          const SizedBox(height: 8),
          _SummaryRow(
            label: '(-) Devoluciones',
            value: totalReturns,
            negative: true,
          ),
          const Divider(height: 24),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFC7D2FE).withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              children: [
                const Text(
                  'EFECTIVO TOTAL',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 2,
                    color: Color(0xFF4F46E5),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'C\$ ${cashTotal.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF312E81),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.negative = false,
  });

  final String label;
  final double value;
  final bool negative;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B))),
        Text(
          '${negative ? '-' : ''}C\$ ${value.toStringAsFixed(2)}',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: negative ? const Color(0xFFF97316) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }
}

class _ClosingFooter extends StatelessWidget {
  const _ClosingFooter({
    required this.alreadyClosed,
    required this.pendingCount,
    required this.isSubmitting,
    required this.cashTotal,
    required this.onSubmit,
  });

  final bool alreadyClosed;
  final int pendingCount;
  final bool isSubmitting;
  final double cashTotal;
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
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (pendingCount > 0 && !alreadyClosed)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  '⚠ Tienes $pendingCount entrega(s) pendiente(s). Completa tus entregas antes de cerrar.',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFDC2626),
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            if (alreadyClosed)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFBBF7D0)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.check_circle_rounded,
                      color: Color(0xFF16A34A),
                      size: 20,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Caja cerrada. ¡Buen trabajo!',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF166534),
                      ),
                    ),
                  ],
                ),
              )
            else
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton.icon(
                  onPressed: (pendingCount > 0 || isSubmitting)
                      ? null
                      : onSubmit,
                  icon: isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.wallet_rounded),
                  label: Text(
                    isSubmitting ? 'Cerrando...' : 'Cerrar caja del día',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ConfirmRow extends StatelessWidget {
  const _ConfirmRow({
    required this.label,
    required this.value,
    this.negative = false,
    this.bold = false,
  });

  final String label;
  final double value;
  final bool negative;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontWeight: bold ? FontWeight.w800 : FontWeight.w500,
            fontSize: bold ? 16 : 14,
          ),
        ),
        Text(
          '${negative ? '-' : ''}C\$ ${value.toStringAsFixed(2)}',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            color: negative ? const Color(0xFFF97316) : const Color(0xFF0F172A),
            fontSize: bold ? 16 : 14,
          ),
        ),
      ],
    );
  }
}
