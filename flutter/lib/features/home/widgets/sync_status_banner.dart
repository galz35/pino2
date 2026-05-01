import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/sync_queue_processor.dart';

/// A compact sync status widget that shows pending operations,
/// current sync status, and allows manual retry.
/// Place it in the app bar or at the top of the home screen.
class SyncStatusBanner extends ConsumerWidget {
  const SyncStatusBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final syncState = ref.watch(syncQueueProcessorProvider);

    // Don't show anything if idle with no pending items
    if (syncState.status == SyncQueueStatus.idle &&
        syncState.pendingCount == 0) {
      return const SizedBox.shrink();
    }

    final (Color bgColor, IconData icon, String label) = switch (syncState.status) {
      SyncQueueStatus.syncing => (
        Colors.blue.shade700,
        Icons.sync,
        'Sincronizando...',
      ),
      SyncQueueStatus.offline => (
        Colors.orange.shade700,
        Icons.cloud_off,
        'Sin conexión • ${syncState.pendingCount} pendientes',
      ),
      SyncQueueStatus.error => (
        Colors.red.shade700,
        Icons.error_outline,
        '${syncState.failedCount} con error',
      ),
      SyncQueueStatus.idle => (
        Colors.green.shade700,
        Icons.check_circle_outline,
        '${syncState.pendingCount} pendientes',
      ),
    };

    return Material(
      color: bgColor,
      child: InkWell(
        onTap: syncState.status == SyncQueueStatus.error ||
                syncState.status == SyncQueueStatus.offline
            ? () => ref.read(syncQueueProcessorProvider.notifier).retryFailedQueue()
            : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              if (syncState.status == SyncQueueStatus.syncing)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              else
                Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              if (syncState.status == SyncQueueStatus.error ||
                  syncState.status == SyncQueueStatus.offline)
                const Icon(
                  Icons.refresh,
                  size: 16,
                  color: Colors.white70,
                ),
              if (syncState.lastSyncAt != null) ...[
                const SizedBox(width: 8),
                Text(
                  _formatLastSync(syncState.lastSyncAt!),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatLastSync(DateTime dt) {
    final diff = DateTime.now().toUtc().difference(dt);
    if (diff.inSeconds < 60) return 'hace ${diff.inSeconds}s';
    if (diff.inMinutes < 60) return 'hace ${diff.inMinutes}m';
    return 'hace ${diff.inHours}h';
  }
}
