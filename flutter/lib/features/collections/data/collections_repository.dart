import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/receivable_account.dart';

class CollectionsRepository {
  const CollectionsRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<List<ReceivableAccount>> getPendingAccounts({
    required String storeId,
    required String accessToken,
  }) async {
    try {
      final response = await _client.getList(
        '/accounts-receivable',
        bearerToken: accessToken,
        queryParameters: {
          'storeId': storeId,
          'pending': 'true',
        },
      );

      final accounts = response
          .map(
            (item) => ReceivableAccount.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      await _localCache.cacheReceivableAccounts(
        storeId: storeId,
        accounts: accounts,
      );

      return accounts;
    } catch (error) {
      final cachedAccounts = await _localCache.getReceivableAccounts(storeId);
      if (cachedAccounts.isNotEmpty) {
        return cachedAccounts;
      }
      rethrow;
    }
  }

  Future<CollectionsSummary> getSummary({
    required String storeId,
    required String accessToken,
    String? ruteroId,
  }) async {
    try {
      final response = await _client.getMap(
        '/collections/summary',
        bearerToken: accessToken,
        queryParameters: {
          'storeId': storeId,
          if (ruteroId != null && ruteroId.isNotEmpty) 'ruteroId': ruteroId,
        },
      );

      final summary = CollectionsSummary.fromJson(response);
      await _localCache.cacheCollectionsSummary(
        storeId: storeId,
        ruteroId: ruteroId,
        summary: summary,
      );

      return summary;
    } on ApiFailure catch (error) {
      if (error.isConnectivityIssue) {
        final cachedSummary = await _localCache.getCollectionsSummary(
          storeId: storeId,
          ruteroId: ruteroId,
        );
        if (cachedSummary != null) {
          return cachedSummary;
        }

        return const CollectionsSummary(
          totalCount: 0,
          totalAmount: 0,
          cashTotal: 0,
          otherTotal: 0,
        );
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> registerPayment({
    required String accountId,
    required String storeId,
    required String accessToken,
    required double amount,
    required String paymentMethod,
    required String collectorId,
    String? collectorName,
    String? notes,
  }) async {
    final payload = {
      'amount': amount,
      'paymentMethod': paymentMethod,
      'vendorId': collectorId,
      'externalId': const Uuid().v4(),
      if (collectorName?.trim().isNotEmpty ?? false)
        'vendorName': collectorName!.trim(),
      if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
    };

    try {
      return await _client.postMap(
        '/accounts-receivable/$accountId/payments',
        bearerToken: accessToken,
        data: payload,
      );
    } on ApiFailure catch (error) {
      if (!error.isConnectivityIssue) {
        rethrow;
      }

      await _localCache.enqueueSyncAction(
        method: 'POST',
        endpoint: '/accounts-receivable/$accountId/payments',
        storeId: storeId,
        operationType: 'collection_payment',
        payload: payload,
      );

      return {
        'queuedOffline': true,
        'message': 'Cobro guardado en cola local.',
      };
    }
  }
}

final collectionsRepositoryProvider = Provider<CollectionsRepository>((ref) {
  return CollectionsRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
