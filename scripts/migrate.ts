import { Pool } from 'pg';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Create migrations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    // Get migration files
    const drizzleDir = join(process.cwd(), 'drizzle');
    const migrationFiles = readdirSync(drizzleDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('No migration files found. Run "npm run db:gen" first.');
      return;
    }

    console.log(`Found ${migrationFiles.length} migration(s)`);

    // Run each migration
    for (const file of migrationFiles) {
      const filePath = join(drizzleDir, file);
      const sql = readFileSync(filePath, 'utf-8');
      
      // Split by statement breaker
      const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }

      console.log(`✓ Applied: ${file}`);

      // Record migration
      const hash = file.replace('.sql', '');
      await pool.query(
        `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, Date.now()]
      );
    }

    console.log('\n✅ All migrations applied successfully');
  } catch (error: any) {
    console.error('❌ Migration error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
