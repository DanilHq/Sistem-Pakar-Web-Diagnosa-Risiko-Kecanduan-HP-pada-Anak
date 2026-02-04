import db from './database';

async function migrate() {
  console.log('Starting database migration...');

  // Initialize database
  await db.init();

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Created users table');

  // Symptoms table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS symptoms (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      text TEXT NOT NULL,
      help_text TEXT,
      active INTEGER DEFAULT 1
    );
  `);
  console.log('✓ Created symptoms table');

  // Rules table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      conditions TEXT NOT NULL,
      result TEXT NOT NULL,
      priority INTEGER NOT NULL,
      description TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      active INTEGER DEFAULT 1
    );
  `);
  console.log('✓ Created rules table');

  // Categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      level INTEGER NOT NULL,
      color TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);
  console.log('✓ Created categories table');

  // Articles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      published INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Created articles table');

  // Diagnoses table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS diagnoses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      selected_symptoms TEXT NOT NULL,
      result TEXT NOT NULL,
      matched_rule_code TEXT,
      trace TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✓ Created diagnoses table');

  // About content table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS about_content (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      vision TEXT,
      mission TEXT,
      developer_name TEXT,
      developer_info TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✓ Created about_content table');

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_symptoms_code ON symptoms(code);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rules_code ON rules(code);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_categories_code ON categories(code);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);
  `);
  console.log('✓ Created indexes');

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
