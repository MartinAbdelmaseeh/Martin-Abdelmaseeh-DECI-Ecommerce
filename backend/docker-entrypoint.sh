set -e

echo "▶ Applying Prisma migrations..."
npx prisma migrate deploy

echo "▶ Seeding database..."
npx prisma db seed

echo "▶ Starting server..."
exec node server.js