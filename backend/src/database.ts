import { Pool, PoolClient, QueryResult } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or use individual params:
  // host: process.env.DB_HOST || 'localhost',
  // port: parseInt(process.env.DB_PORT || '5432'),
  // database: process.env.DB_NAME || 'diagnosa_hp',
  // user: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper to convert ? placeholders to $1, $2, etc.
function convertPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

// Wrapper class to maintain similar API to the original sql.js implementation
class DatabaseWrapper {
  async prepare(sql: string) {
    const pgSql = convertPlaceholders(sql);

    return {
      run: async (...params: any[]) => {
        try {
          const result = await pool.query(pgSql, params);
          return {
            changes: result.rowCount || 0,
            lastInsertRowid: result.rows[0]?.id || 0,
          };
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      get: async (...params: any[]) => {
        try {
          const result = await pool.query(pgSql, params);
          return result.rows[0] || undefined;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      all: async (...params: any[]) => {
        try {
          const result = await pool.query(pgSql, params);
          return result.rows;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
    };
  }

  // Synchronous version (uses the same async implementation)
  prepare_sync(sql: string) {
    return this.prepare(sql);
  }

  async exec(sql: string) {
    try {
      await pool.query(sql);
    } catch (error) {
      console.error('SQL Error:', error);
      throw error;
    }
  }

  exec_sync(sql: string) {
    return this.exec(sql);
  }

  async pragma(_pragma: string) {
    // PostgreSQL doesn't use PRAGMA, this is a no-op for compatibility
    // You might want to handle specific pragmas differently
  }

  async init() {
    // Test the connection
    try {
      const client = await pool.connect();
      console.log('Database connection initialized');
      client.release();
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw error;
    }
  }

  // Direct query method for more complex queries
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    const pgSql = convertPlaceholders(sql);
    return pool.query(pgSql, params);
  }

  // Get a client from the pool for transactions
  async getClient(): Promise<PoolClient> {
    return pool.connect();
  }

  // Close all connections
  async close() {
    await pool.end();
  }
}

// Export singleton instance
const dbWrapper = new DatabaseWrapper();
export default dbWrapper;

// Export pool for direct access if needed
export { pool };

// Export function for compatibility
export function saveDatabase() {
  // No-op for PostgreSQL - data is persisted automatically
}

export async function initDatabase() {
  await dbWrapper.init();
}

export async function ensureInit() {
  await dbWrapper.init();
}
