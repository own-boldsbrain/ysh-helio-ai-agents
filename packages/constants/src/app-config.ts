export const APP_CONFIG = {
  // API configuration
  API_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_REQUESTS_PER_MINUTE: 100,

  // Sandbox configuration
  DEFAULT_SANDBOX_ENVIRONMENT: 'nodejs' as const,
  DEFAULT_DISK_SIZE: 1024, // MB
  DEFAULT_MEMORY_SIZE: 512, // MB
  DEFAULT_TIMEOUT: 300, // seconds

  // UI configuration
  TOAST_DURATION: 5000, // ms
  DEBOUNCE_DELAY: 300, // ms

  // Feature flags
  ENABLE_MULTI_AGENT: true,
  ENABLE_CONNECTORS: true,
  ENABLE_GITHUB_INTEGRATION: true,
} as const
