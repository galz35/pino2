import 'dart:convert';

enum RealtimeEventType {
  newOrder,
  inventoryTransfer,
  orderStatusChange,
  unknown,
}

class RealtimeEvent {
  const RealtimeEvent({
    required this.channel,
    required this.type,
    required this.payload,
    this.storeId,
  });

  final String channel;
  final RealtimeEventType type;
  final Map<String, dynamic> payload;
  final String? storeId;

  String get label {
    switch (type) {
      case RealtimeEventType.newOrder:
        return 'NEW_ORDER';
      case RealtimeEventType.inventoryTransfer:
        return 'INVENTORY_TRANSFER';
      case RealtimeEventType.orderStatusChange:
        return 'ORDER_STATUS_CHANGE';
      case RealtimeEventType.unknown:
        return 'UNKNOWN';
    }
  }

  factory RealtimeEvent.fromSocket(String channel, dynamic raw) {
    final data = raw is Map
        ? Map<String, dynamic>.from(raw)
        : <String, dynamic>{};

    final rawType = data['type']?.toString() ?? '';
    final rawPayload = data['payload'];

    return RealtimeEvent(
      channel: channel,
      type: _mapType(rawType),
      payload: rawPayload is Map
          ? Map<String, dynamic>.from(rawPayload)
          : <String, dynamic>{},
      storeId: data['storeId']?.toString(),
    );
  }

  factory RealtimeEvent.fromCache({
    required String channel,
    required String eventType,
    required String? storeId,
    required String payloadJson,
  }) {
    final decoded = jsonDecode(payloadJson);

    return RealtimeEvent(
      channel: channel,
      type: _mapType(eventType),
      payload: decoded is Map
          ? Map<String, dynamic>.from(decoded)
          : <String, dynamic>{},
      storeId: storeId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'channel': channel,
      'type': label,
      'payload': payload,
      'storeId': storeId,
    };
  }

  static RealtimeEventType _mapType(String value) {
    switch (value.toUpperCase()) {
      case 'NEW_ORDER':
        return RealtimeEventType.newOrder;
      case 'INVENTORY_TRANSFER':
        return RealtimeEventType.inventoryTransfer;
      case 'ORDER_STATUS_CHANGE':
        return RealtimeEventType.orderStatusChange;
      default:
        return RealtimeEventType.unknown;
    }
  }
}
