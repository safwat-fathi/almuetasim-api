import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const dbConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
  migrationsTableName: process.env.MIGRATIONS_TABLE_NAME,
  synchronize: false,
  ssl: false,
};

const dataSource = new DataSource(dbConfig);
export default dataSource;
