import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../database/local_cache_repository.dart';
import '../../features/auth/domain/models/auth_session.dart';
import 'realtime_event.dart';
import 'websocket_service.dart';

class RealtimeState {
  const RealtimeState({required this.status, this.lastEvent});

  final RealtimeConnectionStatus status;
  final RealtimeEvent? lastEvent;

  factory RealtimeState.initial() {
    return const RealtimeState(status: RealtimeConnectionStatus.disconnected);
  }

  RealtimeState copyWith({
    RealtimeConnectionStatus? status,
    RealtimeEvent? lastEvent,
    bool clearLastEvent = false,
  }) {
    return RealtimeState(
      status: status ?? this.status,
      lastEvent: clearLastEvent ? null : lastEvent ?? this.lastEvent,
    );
  }
}

class RealtimeController extends Notifier<RealtimeState> {
  WebSocketService? _service;
  LocalCacheRepository? _localCache;
  StreamSubscription<RealtimeEvent>? _eventSub;
  StreamSubscription<RealtimeConnectionStatus>? _statusSub;

  @override
  RealtimeState build() {
    _service = ref.read(webSocketServiceProvider);
    _localCache = ref.read(localCacheRepositoryProvider);

    _eventSub ??= _service!.events.listen((event) {
      _localCache?.logRealtimeEvent(event);
      state = state.copyWith(lastEvent: event);
    });

    _statusSub ??= _service!.statuses.listen((status) {
      state = state.copyWith(status: status);
    });

    ref.onDispose(() async {
      await _eventSub?.cancel();
      await _statusSub?.cancel();
    });

    return RealtimeState.initial();
  }

  Future<void> connect(AuthSession session, {String? storeId}) async {
    await _service?.connect(
      token: session.accessToken,
      storeId: storeId ?? session.user.primaryStoreId,
    );
  }

  void disconnect() {
    _service?.disconnect();
    state = state.copyWith(
      status: RealtimeConnectionStatus.disconnected,
      clearLastEvent: true,
    );
  }
}

final realtimeControllerProvider =
    NotifierProvider<RealtimeController, RealtimeState>(RealtimeController.new);
