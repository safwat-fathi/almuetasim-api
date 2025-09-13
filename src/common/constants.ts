const CONSTANTS = {
  ACCESS_TOKEN: 'access_token',
  AUTH_GUARDS: {
    JWT: 'jwt',
    JWT_REFRESH: 'jwt-refresh',
  },
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX: 10,
  },
  FILE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
} as const;

export default CONSTANTS;
