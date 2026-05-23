#!/bin/bash
# Clean build artifacts and regenerate Prisma
echo "Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.prisma

echo "Regenerating Prisma Client..."
npx prisma generate --skip-engine-check

echo "Done! Restart your dev server."
