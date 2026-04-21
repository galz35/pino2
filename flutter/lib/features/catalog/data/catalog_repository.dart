import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/database/local_cache_repository.dart';
import '../../../core/network/api_client.dart';
import '../domain/models/catalog_product.dart';

class CatalogRepository {
  const CatalogRepository(this._client, this._localCache);

  final AppApiClient _client;
  final LocalCacheRepository _localCache;

  Future<List<CatalogProduct>> getProducts({
    required String storeId,
    required String accessToken,
    String? search,
  }) async {
    try {
      final response = await _client.getList(
        '/products',
        bearerToken: accessToken,
        queryParameters: {
          'storeId': storeId,
          'limit': 200,
          if (search != null && search.trim().isNotEmpty)
            'search': search.trim(),
        },
      );

      final products = response
          .map(
            (item) => CatalogProduct.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      await _localCache.cacheCatalogProducts(
        storeId: storeId,
        products: products,
      );

      return products;
    } catch (error) {
      final cachedProducts = await _localCache.getCatalogProducts(storeId);
      if (cachedProducts.isNotEmpty) {
        if (search == null || search.trim().isEmpty) {
          return cachedProducts;
        }

        final normalizedSearch = search.trim().toLowerCase();
        return cachedProducts.where((product) {
          final haystack = [
            product.description,
            product.brand ?? '',
            product.barcode ?? '',
            product.alternateBarcodes.join(' '),
            product.department ?? '',
            product.subDepartment ?? '',
          ].join(' ').toLowerCase();
          return haystack.contains(normalizedSearch);
        }).toList();
      }
      rethrow;
    }
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(
    ref.read(appApiClientProvider),
    ref.read(localCacheRepositoryProvider),
  );
});
