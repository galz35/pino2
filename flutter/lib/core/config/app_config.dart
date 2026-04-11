class AppConfig {
  const AppConfig._();

  static const appName = 'Pino Mobile';

  // Base URL for API REST
  static const apiBaseUrl = String.fromEnvironment(
    'PINO_API_BASE_URL',
    defaultValue: 'https://www.rhclaroni.com/api-dev',
  );

  // Socket base URL
  static const socketBaseUrl = String.fromEnvironment(
    'PINO_SOCKET_BASE_URL',
    defaultValue: 'https://www.rhclaroni.com/api-dev',
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
