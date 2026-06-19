import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_URL || 'file:local.db';

const client = createClient({
  url: dbPath,
});

export const db = drizzle(client, { schema });
