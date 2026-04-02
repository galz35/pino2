import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';

class QuickOrderRepository {
  const QuickOrderRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<Map<String, dynamic>> createOrder({
    required String accessToken,
    required String storeId,
    required String clientId,
    required String clientName,
    String? vendorId,
    String? salesManagerName,
    required String paymentType,
    String? notes,
    required List<Map<String, dynamic>> items,
  }) async {
    final payload = {
      'storeId': storeId,
      'clientId': clientId,
      'clientName': clientName,
      'vendorId': vendorId,
      'salesManagerName': salesManagerName,
      'paymentType': paymentType,
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
      'items': items,
    };

    try {
      return await _client.postMap(
        '/orders',
        bearerToken: accessToken,
        data: payload,
      );
    } on ApiFailure catch (error) {
      if (!error.isConnectivityIssue) {
        rethrow;
      }

      await _localCache.enqueueSyncAction(
        method: 'POST',
        endpoint: '/orders',
        storeId: storeId,
        operationType: 'quick_order',
        payload: payload,
      );

      return {
        'queuedOffline': true,
        'message': 'Pedido guardado en cola local.',
      };
    }
  }
}

final quickOrderRepositoryProvider = Provider<QuickOrderRepository>((ref) {
  return QuickOrderRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
