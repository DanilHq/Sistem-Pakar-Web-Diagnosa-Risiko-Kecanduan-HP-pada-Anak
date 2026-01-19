import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.db');

let db: SqlJsDatabase | null = null;
let initPromise: Promise<void> | null = null;

// Initialize database
async function initDatabase() {
  if (db) return;

  const SQL = await initSqlJs();

  try {
    // Try to load existing database
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } catch (e) {
    // Create new database if doesn't exist
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
}

// Get init promise (singleton pattern)
function ensureInit() {
  if (!initPromise) {
    initPromise = initDatabase();
  }
  return initPromise;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Wrapper class to mimic better-sqlite3 API
class DatabaseWrapper {
  async prepare(sql: string) {
    await ensureInit();
    if (!db) throw new Error('Database not initialized');

    return {
      run: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          db.run(sql, params);

          // Get changes BEFORE saveDatabase() - must be immediate after run()
          const changes = this.getChangesCount();
          const lastId = this.getLastInsertId();

          saveDatabase();

          return {
            changes: changes,
            lastInsertRowid: lastId
          };
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      get: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const result = stmt.getAsObject();
            stmt.free();
            return result;
          }
          stmt.free();
          return undefined;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      all: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          const results: any[] = [];
          const stmt = db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      }
    };
  }

  prepare_sync(sql: string) {
    if (!db) throw new Error('Database not initialized');

    return {
      run: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          db.run(sql, params);

          // Get changes BEFORE saveDatabase() - must be immediate after run()
          const changes = this.getChangesCount();
          const lastId = this.getLastInsertId();

          saveDatabase();

          return {
            changes: changes,
            lastInsertRowid: lastId
          };
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      get: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const result = stmt.getAsObject();
            stmt.free();
            return result;
          }
          stmt.free();
          return undefined;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      },
      all: (...params: any[]) => {
        if (!db) throw new Error('Database not initialized');
        try {
          const results: any[] = [];
          const stmt = db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (error) {
          console.error('SQL Error:', error);
          throw error;
        }
      }
    };
  }

  async exec(sql: string) {
    await ensureInit();
    if (!db) throw new Error('Database not initialized');

    try {
      db.run(sql);
      saveDatabase();
    } catch (error) {
      console.error('SQL Error:', error);
      throw error;
    }
  }

  exec_sync(sql: string) {
    if (!db) throw new Error('Database not initialized');

    try {
      db.run(sql);
      saveDatabase();
    } catch (error) {
      console.error('SQL Error:', error);
      throw error;
    }
  }

  async pragma(pragma: string) {
    await ensureInit();
    if (!db) throw new Error('Database not initialized');
    db.run(`PRAGMA ${pragma}`);
  }

  private getLastInsertId() {
    if (!db) return 0;
    const result = db.exec('SELECT last_insert_rowid() as id');
    if (result[0] && result[0].values[0]) {
      return result[0].values[0][0] as number;
    }
    return 0;
  }

  private getChangesCount() {
    if (!db) return 0;
    try {
      const result = db.exec('SELECT changes() as changes');
      if (result[0] && result[0].values[0]) {
        const changes = result[0].values[0][0] as number;
        console.log('Changes count:', changes);
        return changes;
      }
      console.log('No changes result');
      return 0;
    } catch (error) {
      console.error('Error getting changes count:', error);
      return 0;
    }
  }

  async init() {
    await ensureInit();
  }
}

// Export singleton instance
const dbWrapper = new DatabaseWrapper();
export default dbWrapper;
export { initDatabase, ensureInit };
