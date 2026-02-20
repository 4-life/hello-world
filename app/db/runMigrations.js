require('dotenv/config');
const { DataSource } = require('typeorm');
const path = require('path');

function getDatabaseUrl() {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error('Database environment variables is not set');
  }

  return `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}`;
}

const db = new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [path.join(__dirname, 'migrations/*.js')],
  subscribers: [],
});

(async () => {
  try {
    await db.initialize();
    await db.runMigrations();
    console.log('Migrations executed');
    await db.destroy();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
