import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/services/push_notification_service.dart';

import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Push Notifications
  await PushNotificationService.instance.initialize();
  
  runApp(const ProviderScope(child: PinoApp()));
}
