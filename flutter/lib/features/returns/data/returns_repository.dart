import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/sale_lookup.dart';

class ReturnsRepository {
  const ReturnsRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<SaleLookup> findSale({
    required String saleReference,
    required String storeId,
    required String accessToken,
  }) async {
    final response = await _client.getMap(
      '/sales/$saleReference',
      bearerToken: accessToken,
      queryParameters: {'storeId': storeId},
    );

    return SaleLookup.fromJson(response);
  }

  Future<Map<String, dynamic>> createReturn({
    required String accessToken,
    required String storeId,
    required String saleId,
    required List<Map<String, dynamic>> items,
    String? notes,
  }) async {
    final payload = {
      'storeId': storeId,
      'saleId': saleId,
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      'items': items,
    };

    try {
      return await _client.postMap(
        '/returns',
        bearerToken: accessToken,
        data: payload,
      );
    } on ApiFailure catch (error) {
      if (!error.isConnectivityIssue) {
        rethrow;
      }

      await _localCache.enqueueSyncAction(
        method: 'POST',
        endpoint: '/returns',
        storeId: storeId,
        operationType: 'return_create',
        payload: payload,
      );

      return {
        'queuedOffline': true,
        'message': 'Devolución guardada en cola local.',
      };
    }
  }
}

final returnsRepositoryProvider = Provider<ReturnsRepository>((ref) {
  return ReturnsRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
