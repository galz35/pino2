class CatalogProduct {
  const CatalogProduct({
    required this.id,
    required this.storeId,
    required this.description,
    required this.salePrice,
    required this.currentStock,
    required this.unitsPerBulk,
    required this.stockBulks,
    required this.stockUnits,
    this.barcode,
    this.brand,
    this.department,
    this.subDepartment,
    this.minStock = 0,
  });

  final String id;
  final String storeId;
  final String description;
  final double salePrice;
  final int currentStock;
  final int unitsPerBulk;
  final int stockBulks;
  final int stockUnits;
  final String? barcode;
  final String? brand;
  final String? department;
  final String? subDepartment;
  final int minStock;

  bool get isLowStock => currentStock <= minStock;

  String get stockLabel {
    if (unitsPerBulk <= 1) {
      return '$currentStock unidades';
    }
    return '$stockBulks bultos • $stockUnits sueltas';
  }

  factory CatalogProduct.fromJson(Map<String, dynamic> json) {
    return CatalogProduct(
      id: json['id']?.toString() ?? '',
      storeId: json['storeId']?.toString() ?? '',
      description: json['description']?.toString() ?? 'Producto',
      salePrice: double.tryParse('${json['salePrice'] ?? 0}') ?? 0,
      currentStock: int.tryParse('${json['currentStock'] ?? 0}') ?? 0,
      unitsPerBulk: int.tryParse('${json['unitsPerBulk'] ?? 1}') ?? 1,
      stockBulks: int.tryParse('${json['stockBulks'] ?? 0}') ?? 0,
      stockUnits: int.tryParse('${json['stockUnits'] ?? 0}') ?? 0,
      barcode: json['barcode']?.toString(),
      brand: json['brand']?.toString(),
      department: json['departmentName']?.toString() ?? json['department']?.toString(),
      subDepartment: json['subDepartment']?.toString(),
      minStock: int.tryParse('${json['minStock'] ?? 0}') ?? 0,
    );
  }
}
