import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/app_config.dart';
import 'realtime_event.dart';

enum RealtimeConnectionStatus { disconnected, connecting, connected, error }

class WebSocketService {
  final _eventsController = StreamController<RealtimeEvent>.broadcast();
  final _statusController =
      StreamController<RealtimeConnectionStatus>.broadcast();

  io.Socket? _socket;
  String? _lastStoreId;

  Stream<RealtimeEvent> get events => _eventsController.stream;
  Stream<RealtimeConnectionStatus> get statuses => _statusController.stream;

  Future<void> connect({required String token, String? storeId}) async {
    if (_socket?.connected == true) {
      if (storeId != null && storeId != _lastStoreId) {
        _socket?.emit('join_store', storeId);
        _lastStoreId = storeId;
      }
      return;
    }

    disconnect();
    _statusController.add(RealtimeConnectionStatus.connecting);

    final namespaceUrl =
        '${AppConfig.socketBaseUrl}${AppConfig.socketNamespace}';
    _lastStoreId = storeId;

    final socket = io.io(
      namespaceUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setPath(AppConfig.socketPath)
          .setAuth(<String, dynamic>{'token': token})
          .build(),
    );

    socket.onConnect((_) {
      _statusController.add(RealtimeConnectionStatus.connected);
      debugPrint('[WebSocket] connected to $namespaceUrl');

      if (_lastStoreId != null && _lastStoreId!.isNotEmpty) {
        socket.emit('join_store', _lastStoreId);
      }
    });

    socket.onDisconnect((reason) {
      _statusController.add(RealtimeConnectionStatus.disconnected);
      debugPrint('[WebSocket] disconnected: $reason');
    });

    socket.onConnectError((error) {
      _statusController.add(RealtimeConnectionStatus.error);
      debugPrint('[WebSocket] connect error: $error');
    });

    socket.onError((error) {
      _statusController.add(RealtimeConnectionStatus.error);
      debugPrint('[WebSocket] socket error: $error');
    });

    socket.on('sync_update', (data) {
      _eventsController.add(RealtimeEvent.fromSocket('sync_update', data));
    });

    socket.on('store_update', (data) {
      _eventsController.add(RealtimeEvent.fromSocket('store_update', data));
    });

    _socket = socket;
    socket.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _statusController.add(RealtimeConnectionStatus.disconnected);
  }

  void dispose() {
    disconnect();
    _eventsController.close();
    _statusController.close();
  }
}

final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  final service = WebSocketService();
  ref.onDispose(service.dispose);
  return service;
});
