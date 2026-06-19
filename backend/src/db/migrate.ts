import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index.js';

async function runMigrations() {
  console.log('Running migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
