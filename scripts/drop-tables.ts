import { Pool } from 'pg';
import dotenv from 'dotenv';
import { rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

dotenv.config();

async function dropAllTables() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    // Get all table names
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    const tables = tablesResult.rows.map(row => row.tablename);

    if (tables.length === 0) {
      console.log('No tables to drop');
    } else {
      console.log(`Dropping ${tables.length} tables: ${tables.join(', ')}`);

      // Drop all tables
      for (const table of tables) {
        await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✓ Dropped: ${table}`);
      }
    }

    // Drop drizzle migrations table
    await pool.query(`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
    console.log('✓ Dropped: __drizzle_migrations');

    // Delete migration files
    const drizzleDir = join(process.cwd(), 'drizzle');
    if (existsSync(drizzleDir)) {
      // Delete SQL migration files
      const files = readdirSync(drizzleDir).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        const filePath = join(drizzleDir, file);
        rmSync(filePath);
        console.log(`✓ Deleted: ${file}`);
      }
      
      // Delete meta snapshot files (keep journal)
      const metaDir = join(drizzleDir, 'meta');
      if (existsSync(metaDir)) {
        const metaFiles = readdirSync(metaDir).filter(f => f.endsWith('_snapshot.json'));
        for (const file of metaFiles) {
          const filePath = join(metaDir, file);
          rmSync(filePath);
          console.log(`✓ Deleted: meta/${file}`);
        }
      }
    }

    console.log('\n✅ All tables and migration files dropped successfully');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropAllTables();
