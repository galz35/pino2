class WarehouseOrderItem {
  const WarehouseOrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitsPerBulk,
    required this.presentation,
  });

  final String id;
  final String productId;
  final String productName;
  final int quantity;
  final int unitsPerBulk;
  final String presentation;

  int get totalUnits =>
      presentation.toUpperCase() == 'BULTO' ? quantity * unitsPerBulk : quantity;

  int get pickingBulks => unitsPerBulk <= 1 ? 0 : totalUnits ~/ unitsPerBulk;
  int get pickingUnits => unitsPerBulk <= 1 ? totalUnits : totalUnits % unitsPerBulk;

  factory WarehouseOrderItem.fromJson(Map<String, dynamic> json) {
    return WarehouseOrderItem(
      id: json['id']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      productName: json['productName']?.toString() ?? 'Producto',
      quantity: int.tryParse('${json['quantity'] ?? 0}') ?? 0,
      unitsPerBulk: int.tryParse('${json['unitsPerBulk'] ?? 1}') ?? 1,
      presentation: json['presentation']?.toString() ?? 'UNIT',
    );
  }
}

class WarehouseOrder {
  const WarehouseOrder({
    required this.id,
    required this.storeId,
    required this.status,
    required this.total,
    this.clientName,
    this.vendorId,
    this.salesManagerName,
    this.notes,
    this.createdAt,
    this.items = const [],
  });

  final String id;
  final String storeId;
  final String status;
  final double total;
  final String? clientName;
  final String? vendorId;
  final String? salesManagerName;
  final String? notes;
  final DateTime? createdAt;
  final List<WarehouseOrderItem> items;

  factory WarehouseOrder.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final items = rawItems is List
        ? rawItems
              .map(
                (item) => WarehouseOrderItem.fromJson(
                  Map<String, dynamic>.from(item as Map),
                ),
              )
              .toList()
        : <WarehouseOrderItem>[];

    return WarehouseOrder(
      id: json['id']?.toString() ?? '',
      storeId: json['storeId']?.toString() ?? '',
      status: json['status']?.toString() ?? 'RECIBIDO',
      total: double.tryParse('${json['total'] ?? 0}') ?? 0,
      clientName: json['clientName']?.toString(),
      vendorId: json['vendorId']?.toString(),
      salesManagerName: json['salesManagerName']?.toString(),
      notes: json['notes']?.toString(),
      createdAt: DateTime.tryParse('${json['createdAt'] ?? ''}'),
      items: items,
    );
  }
}

class WarehouseAssignee {
  const WarehouseAssignee({
    required this.id,
    required this.name,
    required this.role,
  });

  final String id;
  final String name;
  final String role;

  factory WarehouseAssignee.fromJson(Map<String, dynamic> json) {
    return WarehouseAssignee(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Usuario',
      role: json['role']?.toString() ?? '',
    );
  }
}
