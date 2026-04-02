class RouteSummary {
  const RouteSummary({
    required this.id,
    required this.storeId,
    required this.vendorId,
    required this.clientIds,
    required this.routeDate,
    required this.status,
    this.notes,
  });

  final String id;
  final String storeId;
  final String vendorId;
  final List<String> clientIds;
  final DateTime? routeDate;
  final String status;
  final String? notes;

  factory RouteSummary.fromJson(Map<String, dynamic> json) {
    final rawClientIds = json['clientIds'];
    final clientIds = rawClientIds is List
        ? rawClientIds.map((value) => value.toString()).toList()
        : <String>[];

    return RouteSummary(
      id: json['id']?.toString() ?? '',
      storeId: json['storeId']?.toString() ?? '',
      vendorId: json['vendorId']?.toString() ?? '',
      clientIds: clientIds,
      routeDate: DateTime.tryParse('${json['routeDate'] ?? ''}'),
      status: json['status']?.toString() ?? 'pending',
      notes: json['notes']?.toString(),
    );
  }
}
