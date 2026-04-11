import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NetworkStatus { online, offline }

class ConnectivityService {
  ConnectivityService() : _connectivity = Connectivity();

  final Connectivity _connectivity;

  Stream<NetworkStatus> get statuses =>
      _connectivity.onConnectivityChanged.map(_mapResults).distinct();

  Future<NetworkStatus> getCurrentStatus() async {
    final results = await _connectivity.checkConnectivity();
    return _mapResults(results);
  }

  Future<bool> isOnline() async {
    return (await getCurrentStatus()) == NetworkStatus.online;
  }

  NetworkStatus _mapResults(ConnectivityResult result) {
    if (result == ConnectivityResult.none) {
      return NetworkStatus.offline;
    }
    return NetworkStatus.online;
  }
}

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

final networkStatusProvider = StreamProvider<NetworkStatus>((ref) {
  return ref.read(connectivityServiceProvider).statuses;
});
