import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/home/domain/models/store_summary.dart';
import '../realtime/realtime_event.dart';
import 'app_database.dart';

class LocalCacheRepository {
  const LocalCacheRepository(this._database);

  final AppDatabase _database;

  Future<void> cacheAssignedStores({
    required String userId,
    required List<StoreSummary> stores,
  }) async {
    final now = DateTime.now().toUtc();
    final rows = stores
        .map(
          (store) => CachedStoresCompanion.insert(
            id: store.id,
            userId: userId,
            name: store.name,
            address: Value(store.address),
            phone: Value(store.phone),
            chainId: Value(store.chainId),
            cachedAt: now,
          ),
        )
        .toList();

    await _database.replaceAssignedStores(userId, rows);
  }

  Future<List<StoreSummary>> getAssignedStores(String userId) async {
    final rows = await _database.getAssignedStores(userId);
    return rows
        .map(
          (row) => StoreSummary(
            id: row.id,
            name: row.name,
            address: row.address,
            phone: row.phone,
            chainId: row.chainId,
          ),
        )
        .toList();
  }

  Stream<int> watchPendingSyncCount() {
    return _database.watchPendingSyncCount();
  }

  Future<void> logRealtimeEvent(RealtimeEvent event) async {
    await _database.insertRealtimeEvent(
      RealtimeEventLogsCompanion.insert(
        channel: event.channel,
        eventType: event.label,
        payloadJson: jsonEncode(event.payload),
        storeId: Value(event.storeId),
        receivedAt: DateTime.now().toUtc(),
      ),
    );
  }

  Stream<RealtimeEvent?> watchLatestRealtimeEvent() {
    return _database.watchLatestRealtimeEvent().map((row) {
      if (row == null) {
        return null;
      }

      return RealtimeEvent.fromCache(
        channel: row.channel,
        eventType: row.eventType,
        storeId: row.storeId,
        payloadJson: row.payloadJson,
      );
    });
  }

  Future<int> enqueueSyncAction({
    required String method,
    required String endpoint,
    String? storeId,
    String? operationType,
    Map<String, dynamic>? payload,
  }) async {
    return _database.enqueueSyncEntry(
      SyncQueueEntriesCompanion.insert(
        method: method.toUpperCase(),
        endpoint: endpoint,
        payloadJson: Value(payload == null ? null : jsonEncode(payload)),
        storeId: Value(storeId),
        operationType: Value(operationType),
        createdAt: DateTime.now().toUtc(),
      ),
    );
  }
}

final localCacheRepositoryProvider = Provider<LocalCacheRepository>((ref) {
  return LocalCacheRepository(ref.read(appDatabaseProvider));
});

final pendingSyncCountProvider = StreamProvider<int>((ref) {
  return ref.read(localCacheRepositoryProvider).watchPendingSyncCount();
});

final latestRealtimeEventProvider = StreamProvider<RealtimeEvent?>((ref) {
  return ref.read(localCacheRepositoryProvider).watchLatestRealtimeEvent();
});
