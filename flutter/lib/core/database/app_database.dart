import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'app_database.g.dart';

class CachedStores extends Table {
  TextColumn get id => text()();
  TextColumn get userId => text()();
  TextColumn get name => text()();
  TextColumn get address => text().nullable()();
  TextColumn get phone => text().nullable()();
  TextColumn get chainId => text().nullable()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id, userId};
}

class RealtimeEventLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get channel => text()();
  TextColumn get eventType => text()();
  TextColumn get payloadJson => text()();
  TextColumn get storeId => text().nullable()();
  DateTimeColumn get receivedAt => dateTime()();
}

class SyncQueueEntries extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get method => text()();
  TextColumn get endpoint => text()();
  TextColumn get payloadJson => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  TextColumn get storeId => text().nullable()();
  TextColumn get operationType => text().nullable()();
  TextColumn get errorMessage => text().nullable()();
  IntColumn get attemptCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastAttemptAt => dateTime().nullable()();
}

@DriftDatabase(tables: [CachedStores, RealtimeEventLogs, SyncQueueEntries])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  AppDatabase.forTesting(super.executor);

  @override
  int get schemaVersion => 1;

  Future<void> replaceAssignedStores(
    String userId,
    List<CachedStoresCompanion> stores,
  ) async {
    await transaction(() async {
      await (delete(
        cachedStores,
      )..where((table) => table.userId.equals(userId))).go();

      if (stores.isNotEmpty) {
        await batch((batch) {
          batch.insertAll(
            cachedStores,
            stores,
            mode: InsertMode.insertOrReplace,
          );
        });
      }
    });
  }

  Future<List<CachedStore>> getAssignedStores(String userId) {
    return (select(cachedStores)
          ..where((table) => table.userId.equals(userId))
          ..orderBy([(table) => OrderingTerm.asc(table.name)]))
        .get();
  }

  Stream<List<CachedStore>> watchAssignedStores(String userId) {
    return (select(cachedStores)
          ..where((table) => table.userId.equals(userId))
          ..orderBy([(table) => OrderingTerm.asc(table.name)]))
        .watch();
  }

  Future<int> insertRealtimeEvent(RealtimeEventLogsCompanion entry) {
    return into(realtimeEventLogs).insert(entry);
  }

  Stream<RealtimeEventLog?> watchLatestRealtimeEvent() {
    return (select(realtimeEventLogs)
          ..orderBy([(table) => OrderingTerm.desc(table.receivedAt)])
          ..limit(1))
        .watchSingleOrNull();
  }

  Future<int> enqueueSyncEntry(SyncQueueEntriesCompanion entry) {
    return into(syncQueueEntries).insert(entry);
  }

  Stream<int> watchPendingSyncCount() {
    final pendingCount = syncQueueEntries.id.count();

    return (selectOnly(syncQueueEntries)
          ..addColumns([pendingCount])
          ..where(syncQueueEntries.status.equals('pending')))
        .watchSingle()
        .map((row) => row.read(pendingCount) ?? 0);
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final directory = await getApplicationSupportDirectory();
    final file = File(p.join(directory.path, 'pino_mobile.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}

final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final database = AppDatabase();
  ref.onDispose(database.close);
  return database;
});
