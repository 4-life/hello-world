import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import entities from './entities';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create and export TypeORM DataSource
export const db = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
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
