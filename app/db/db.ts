import 'reflect-metadata';
import { DataSource } from 'typeorm';
import entities from './entities';

function getDatabaseUrl() {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error('Database environment variables is not set')
  }

  return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`
}

// Create and export TypeORM DataSource
export const db = new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
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
