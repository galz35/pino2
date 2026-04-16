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
                ? 'Cierre guardado temporalmente. Se enviará cuando vuelva la señal.'
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
              child: const Text(
                'Al confirmar, notificarás a bodega que finalizaste la jornada y comenzarás el arqueo físico de efectivo y producto no entregado.',
                style: TextStyle(color: Colors.black87, fontSize: 14),
                textAlign: TextAlign.center,
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
                  // ── Simple status card ──
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEF2FF),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFC7D2FE)),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.local_shipping_rounded,
                          size: 48,
                          color: Color(0xFF4F46E5),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Jornada de Entregas',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF312E81),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Has completado $_deliveredCount entregas hoy. Al finalizar el día, presiona el botón inferior para notificar a la base y proceder con la entrega de dinero y productos en las instalaciones.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: const Color(0xFF312E81).withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
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


