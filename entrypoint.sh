#!/bin/sh

set -e

echo "Running Prisma migrations..."

pnpm prisma migrate deploy

echo "Starting NestJS..."

exec node dist/main.js