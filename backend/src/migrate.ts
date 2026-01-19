import db from './database';

async function migrate() {
  console.log('Starting database migration...');

  // Initialize database
  await db.init();

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Symptoms table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      text TEXT NOT NULL,
      help_text TEXT,
      active INTEGER DEFAULT 1
    );
  `);

  // Rules table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      conditions TEXT NOT NULL,
      result TEXT NOT NULL,
      priority INTEGER NOT NULL,
      description TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );
  `);

  // Categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      level INTEGER NOT NULL,
      color TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);

  // Articles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Diagnoses table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS diagnoses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      selected_symptoms TEXT NOT NULL,
      result TEXT NOT NULL,
      matched_rule_code TEXT,
      trace TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_symptoms_code ON symptoms(code);
    CREATE INDEX IF NOT EXISTS idx_rules_code ON rules(code);
    CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority);
    CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
    CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);
  `);

  console.log('Database migration completed successfully!');
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('\nMigration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrate;
