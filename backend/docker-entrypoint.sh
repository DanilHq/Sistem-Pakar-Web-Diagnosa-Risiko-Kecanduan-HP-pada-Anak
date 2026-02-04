#!/bin/sh
# Database initialization script for Docker

echo "Waiting for PostgreSQL to be ready..."
until node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});p.connect().then(c=>{c.release();p.end();process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - running migrations and seeding..."
node dist/migrate.js
if [ $? -ne 0 ]; then
  echo "Migration failed, but continuing..."
fi

node dist/seed.js
if [ $? -ne 0 ]; then
  echo "Seeding failed, but continuing..."
fi

echo "Starting server..."
node dist/server.js
