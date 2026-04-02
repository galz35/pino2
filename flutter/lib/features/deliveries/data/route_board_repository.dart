import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/delivery_summary.dart';
import '../domain/models/route_summary.dart';

class RouteBoardSnapshot {
  const RouteBoardSnapshot({
    required this.routes,
    required this.deliveries,
  });

  final List<RouteSummary> routes;
  final List<DeliverySummary> deliveries;
}

class RouteBoardRepository {
  const RouteBoardRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<RouteBoardSnapshot> getSnapshot({
    required String storeId,
    required String accessToken,
    String? vendorId,
    String? ruteroId,
  }) async {
    try {
      final results = await Future.wait([
        _client.getList(
          '/routes',
          bearerToken: accessToken,
          queryParameters: {
            'storeId': storeId,
            if (vendorId != null && vendorId.isNotEmpty) 'vendorId': vendorId,
          },
        ),
        _client.getList(
          '/pending-deliveries',
          bearerToken: accessToken,
          queryParameters: {
            'storeId': storeId,
            if (ruteroId != null && ruteroId.isNotEmpty) 'ruteroId': ruteroId,
          },
        ),
      ]);

      final routes = results[0]
          .map(
            (item) => RouteSummary.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      final deliveries = results[1]
          .map(
            (item) => DeliverySummary.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      await _localCache.cacheRoutes(storeId: storeId, routes: routes);
      await _localCache.cacheDeliveries(
        storeId: storeId,
        deliveries: deliveries,
      );

      return RouteBoardSnapshot(routes: routes, deliveries: deliveries);
    } catch (error) {
      final routes = (await _localCache.getRoutes(storeId)).where((route) {
        if (vendorId != null && vendorId.isNotEmpty) {
          return route.vendorId == vendorId;
        }
        return true;
      }).toList();

      final deliveries = (await _localCache.getDeliveries(storeId)).where((
        delivery,
      ) {
        if (ruteroId != null && ruteroId.isNotEmpty) {
          return delivery.ruteroId == ruteroId;
        }
        return true;
      }).toList();

      if (routes.isNotEmpty || deliveries.isNotEmpty) {
        return RouteBoardSnapshot(routes: routes, deliveries: deliveries);
      }
      rethrow;
    }
  }
}

final routeBoardRepositoryProvider = Provider<RouteBoardRepository>((ref) {
  return RouteBoardRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
