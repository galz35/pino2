import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../domain/models/vendor_product.dart';

class VendorInventoryRepository {
  const VendorInventoryRepository(this._client);

  final AppApiClient _client;

  Future<List<VendorProduct>> getInventory({
    required String vendorId,
    required String accessToken,
  }) async {
    final data = await _client.getList(
      '/vendor-inventories/$vendorId',
      bearerToken: accessToken,
    );
    return data
        .map(
          (item) => VendorProduct.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList();
  }
}

final vendorInventoryRepositoryProvider =
    Provider<VendorInventoryRepository>((ref) {
  return VendorInventoryRepository(ref.read(appApiClientProvider));
});
