import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import entities from './entities';

dotenv.config();

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_NAME) {
  throw new Error('Database environment variables is not set');
}

const url = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

// Create and export TypeORM DataSource
export const db = new DataSource({
  type: 'postgres',
  url,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: false, // set true only for dev (auto creates tables)
  logging: false,
  entities,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [],
});

// Initialize connection
db.initialize()
  .then(async () => {
    console.log('✅ Data Source has been initialized');
  })
  .catch((err) => {
    console.error('❌ Error during Data Source initialization', err);
  });
