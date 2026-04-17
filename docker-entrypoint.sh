#!/bin/sh
set -e

echo "Running database setup..."
npx prisma db push --accept-data-loss 2>&1 || echo "Warning: db push failed, database may already be set up"

# Seed only if no data exists (check for households)
HOUSEHOLD_COUNT=$(node --input-type=commonjs -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*) FROM \"Household\"').then(r => { console.log(r.rows[0].count); pool.end(); }).catch(() => { console.log('0'); pool.end(); });
" 2>/dev/null || echo "0")

if [ "$HOUSEHOLD_COUNT" = "0" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts 2>&1 || echo "Warning: seed failed"
else
  echo "Database already has data, skipping seed."
fi

echo "Starting application..."
exec node server.js
