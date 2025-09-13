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
      CSRF_SECRET: string;
      CLIENT_URL: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_BUCKET_NAME: string;
    }
  }
}

export {};
