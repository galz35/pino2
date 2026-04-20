import 'package:sqflite/sqflite.dart';
// import 'package:path/path.dart';

class PreventaCache {
  final Database _db;

  PreventaCache(this._db);

  Future<void> upsertProducts(List<Map<String, dynamic>> products) async {
    final batch = _db.batch();
    for (final p in products) {
      batch.insert('cached_products', p, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getClientesDelDia(int diaSemana) async {
    return _db.query('cached_clients', where: 'dia_visita = ?', whereArgs: [diaSemana]);
  }

  Future<void> saveOrderLocal(Map<String, dynamic> order) async {
    await _db.insert('local_orders', order, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> getPendingOrders() async {
    return _db.query('local_orders', where: 'synced = ?', whereArgs: [0]);
  }

  Future<void> markAsSynced(String externalId) async {
    await _db.update('local_orders', {'synced': 1}, where: 'external_id = ?', whereArgs: [externalId]);
  }
}
