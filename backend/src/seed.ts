import db from './database';
import migrate from './migrate';
import bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  console.log('Starting database seeding...');

  // Run migration first
  await migrate();

  // Initialize database
  await db.init();

  // Load seed data
  const seedDataPath = path.join(__dirname, '../seed-data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

  console.log('Seed data loaded');

  // Clear existing data (in correct order due to foreign keys)
  await db.exec('DELETE FROM diagnoses');
  await db.exec('DELETE FROM articles');
  await db.exec('DELETE FROM categories');
  await db.exec('DELETE FROM rules');
  await db.exec('DELETE FROM symptoms');
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM about_content');

  console.log('Existing data cleared');

  // Reset sequences (PostgreSQL specific)
  await db.exec('ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1');
  await db.exec('ALTER SEQUENCE IF EXISTS symptoms_id_seq RESTART WITH 1');
  await db.exec('ALTER SEQUENCE IF EXISTS rules_id_seq RESTART WITH 1');
  await db.exec('ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1');
  await db.exec('ALTER SEQUENCE IF EXISTS articles_id_seq RESTART WITH 1');
  await db.exec('ALTER SEQUENCE IF EXISTS diagnoses_id_seq RESTART WITH 1');

  // Insert symptoms
  for (const symptom of seedData.symptoms) {
    const stmt = await db.prepare(
      'INSERT INTO symptoms (code, text, help_text, active) VALUES ($1, $2, $3, $4)'
    );
    await stmt.run(symptom.code, symptom.text, symptom.help_text || null, symptom.active ? 1 : 0);
  }
  console.log(`Inserted ${seedData.symptoms.length} symptoms`);

  // Insert rules
  for (const rule of seedData.rules) {
    const stmt = await db.prepare(
      'INSERT INTO rules (code, conditions, result, priority, description, recommendation, active) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    );
    await stmt.run(
      rule.code,
      JSON.stringify(rule.conditions),
      rule.result,
      rule.priority,
      rule.description,
      rule.recommendation,
      rule.active ? 1 : 0
    );
  }
  console.log(`Inserted ${seedData.rules.length} rules`);

  // Insert categories
  for (const category of seedData.categories) {
    const stmt = await db.prepare(
      'INSERT INTO categories (code, name, level, color, description) VALUES ($1, $2, $3, $4, $5)'
    );
    await stmt.run(category.code, category.name, category.level, category.color, category.description);
  }
  console.log(`Inserted ${seedData.categories.length} categories`);

  // Insert articles
  for (const article of seedData.articles) {
    const stmt = await db.prepare(
      'INSERT INTO articles (title, slug, excerpt, content, category, author, published) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    );
    await stmt.run(
      article.title,
      article.slug,
      article.excerpt,
      article.content,
      article.category,
      article.author,
      article.published ? 1 : 0
    );
  }
  console.log(`Inserted ${seedData.articles.length} articles`);

  // Create users
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminName = process.env.ADMIN_NAME || 'Administrator';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

  const insertUserStmt = await db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)'
  );
  await insertUserStmt.run(adminName, adminEmail, hashedAdminPassword, 'admin');
  console.log(`Created admin user: ${adminEmail}`);

  const userPassword = await bcrypt.hash('User123!', 10);
  await insertUserStmt.run('Sample User', 'user@example.com', userPassword, 'user');
  console.log('Created sample user: user@example.com');

  console.log('\nDatabase seeding completed successfully!');
  console.log('\nDefault credentials:');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log('User: user@example.com / User123!');
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('\nSeeding finished. You can now start the server.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default seed;
