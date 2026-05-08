import 'reflect-metadata';
import { DataSource } from 'typeorm';
import entities from './entities';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

const databaseUrl =
  POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB
    ? `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`
    : null;

export const db = new DataSource({
  type: 'postgres',
  url: databaseUrl ?? undefined,
  synchronize: false,
  logging: false,
  entities,
  migrations: [__dirname + '/migrations/**/*.js'],
  subscribers: [],
});

if (databaseUrl) {
  db.initialize().catch((_err) => {
    // eslint-disable-next-line no-console
    console.error('Database connection error:', _err);
    process.exit(1);
  });
}
