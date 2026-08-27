#!/bin/sh
set -e

# CockroachDB Cloud Basic parks an idle cluster and needs a few seconds to wake
# up. Firing a migration at a cold cluster is how a deploy ends up with a
# half-applied schema and Prisma error P3009 on every boot afterwards, so a
# failed attempt is retried instead of killing the container outright.
# `migrate deploy` is idempotent and creates the database if it does not exist.
attempt=1
max_attempts=5

while true; do
  echo "Applying database migrations (attempt ${attempt}/${max_attempts})..."
  if npx prisma migrate deploy; then
    break
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Migrations still failing after ${attempt} attempts — aborting boot." >&2
    echo "If the error is P3009, a previous run left a failed migration behind:" >&2
    echo "point DATABASE_URL at a fresh database, or see DEPLOY.md to recover." >&2
    exit 1
  fi

  echo "Attempt ${attempt} failed — the database may still be waking up; retrying in 5s..." >&2
  attempt=$((attempt + 1))
  sleep 5
done

echo "Starting dev-card..."
exec node dist/main.js
