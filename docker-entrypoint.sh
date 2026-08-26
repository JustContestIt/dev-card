#!/bin/sh
set -e

# Apply pending migrations before serving traffic.
# `migrate deploy` is idempotent and safe to run on every boot;
# an empty database is then auto-seeded by SeederService.
echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting dev-card..."
exec node dist/main.js
