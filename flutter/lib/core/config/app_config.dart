class AppConfig {
  const AppConfig._();

  static const appName = 'Pino Mobile';

  // Base URL for API REST
  static const apiBaseUrl = String.fromEnvironment(
    'PINO_API_BASE_URL',
    defaultValue: 'http://190.56.16.85:3010/api',
  );

  // Socket base URL
  static const socketBaseUrl = String.fromEnvironment(
    'PINO_SOCKET_BASE_URL',
    defaultValue: 'http://190.56.16.85:3010',
  );

  // Path for socket.io
  static const socketPath = String.fromEnvironment(
    'PINO_SOCKET_PATH',
    defaultValue: '/socket.io',
  );

  // Namespace for events
  static const socketNamespace = String.fromEnvironment(
    'PINO_SOCKET_NAMESPACE',
    defaultValue: '/events',
  );
}
