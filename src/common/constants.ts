const CONSTANTS = {
  ACCESS_TOKEN: 'access_token',
  AUTH_GUARDS: {
    JWT: 'jwt',
    JWT_REFRESH: 'jwt-refresh',
  },
  SESSION: {
    ACCESS_TOKEN_EXPIRATION_TIME: '15m', // 15 minutes
    REFRESH_TOKEN_EXPIRATION_TIME: '7d', // 7 days
  },
};

export default CONSTANTS;
