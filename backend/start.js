const { Pool } = require('pg');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function waitForDb() {
    console.log('Waiting for PostgreSQL...');
    let retries = 30;
    while (retries > 0) {
        try {
            const client = await pool.connect();
            console.log('PostgreSQL is ready!');
            client.release();
            await pool.end();
            return true;
        } catch (err) {
            retries--;
            console.log(`PostgreSQL not ready yet. Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    throw new Error('Could not connect to PostgreSQL');
}

async function runMigrateAndSeed() {
    try {
        console.log('Running migrations...');
        await execPromise('node dist/migrate.js');
        console.log('Migrations completed');
    } catch (err) {
        console.log('Migration skipped or failed:', err.message);
    }

    try {
        console.log('Running seeding...');
        await execPromise('node dist/seed.js');
        console.log('Seeding completed');
    } catch (err) {
        console.log('Seeding skipped or failed:', err.message);
    }
}

async function start() {
    try {
        await waitForDb();
        await runMigrateAndSeed();

        console.log('Starting main server...');
        require('./dist/server.js');
    } catch (error) {
        console.error('Startup failed:', error);
        process.exit(1);
    }
}

start();
