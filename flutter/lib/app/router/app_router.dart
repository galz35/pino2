import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/catalog/presentation/screens/product_catalog_screen.dart';
import '../../features/clients/presentation/screens/client_portfolio_screen.dart';
import '../../features/collections/presentation/screens/collections_screen.dart';
import '../../features/auth/presentation/controllers/auth_controller.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/deliveries/presentation/screens/route_board_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/orders/presentation/screens/quick_order_screen.dart';
import '../../features/returns/presentation/screens/returns_screen.dart';
import '../../features/startup/presentation/screens/splash_screen.dart';
import '../../features/warehouse/presentation/screens/warehouse_board_screen.dart';
import '../../features/daily_closing/presentation/screens/daily_closing_screen.dart';
import '../../features/vendor_inventory/presentation/screens/vendor_inventory_screen.dart';
import '../../features/sales_history/presentation/screens/sales_history_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
      GoRoute(
        path: '/catalog/:storeId',
        builder: (context, state) => ProductCatalogScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/clients/:storeId',
        builder: (context, state) => ClientPortfolioScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/route-board/:storeId',
        builder: (context, state) => RouteBoardScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/quick-order/:storeId',
        builder: (context, state) => QuickOrderScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/collections/:storeId',
        builder: (context, state) => CollectionsScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/returns/:storeId',
        builder: (context, state) => ReturnsScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/warehouse/:storeId',
        builder: (context, state) => WarehouseBoardScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/daily-closing/:storeId',
        builder: (context, state) => DailyClosingScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/vendor-inventory/:storeId',
        builder: (context, state) => VendorInventoryScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
      GoRoute(
        path: '/sales-history/:storeId',
        builder: (context, state) => SalesHistoryScreen(
          storeId: state.pathParameters['storeId'] ?? '',
          storeName: state.uri.queryParameters['storeName'],
        ),
      ),
    ],
    redirect: (context, state) {
      final location = state.uri.path;
      final stage = authState.stage;

      if (stage == AuthStage.initial || stage == AuthStage.loading) {
        return location == '/' ? null : '/';
      }

      if (stage == AuthStage.unauthenticated) {
        return location == '/login' ? null : '/login';
      }

      if (stage == AuthStage.authenticated) {
        if (location == '/' || location == '/login') {
          return '/home';
        }
      }

      return null;
    },
  );
});
