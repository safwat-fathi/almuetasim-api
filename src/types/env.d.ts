declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      APP_URL: string;
      PORT: number;
      DB_HOST: string;
      DB_PORT: number;
      DB_USER: string;
      DB_NAME: string;
      DB_PASS: string;
      MIGRATIONS_TABLE_NAME: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      JWT_ACCESS_EXPIRATION: string;
      JWT_REFRESH_EXPIRATION: string;
      ADMIN_PASS_SEED: string;
    }
  }
}

export {};
