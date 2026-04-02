import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/store_summary.dart';

class HomeRepository {
  const HomeRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<List<StoreSummary>> getAssignedStores({
    required String userId,
    required String accessToken,
  }) async {
    try {
      final response = await _client.getList(
        '/users/$userId/stores',
        bearerToken: accessToken,
      );

      final stores = response
          .map(
            (item) =>
                StoreSummary.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList();

      await _localCache.cacheAssignedStores(userId: userId, stores: stores);
      return stores;
    } catch (error) {
      final cachedStores = await _localCache.getAssignedStores(userId);
      if (cachedStores.isNotEmpty) {
        return cachedStores;
      }
      rethrow;
    }
  }
}

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
