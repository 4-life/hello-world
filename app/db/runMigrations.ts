import 'dotenv/config';
import { db } from './db';

(async () => {
  try {
    await db.initialize();
    await db.runMigrations();
    console.log('✅ Migrations executed');
    await db.destroy();
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
})();
