/**
 * Prisma Client Singleton (Prisma 7+)
 * 
 * WHY: Prisma 7 requires a "driver adapter" to connect to the database.
 * Instead of embedding the URL in schema.prisma, we create a PostgreSQL
 * connection pool and pass it as an adapter to PrismaClient.
 * 
 * The singleton pattern prevents connection pool exhaustion during
 * Next.js hot-reloads in development.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString, max: 3 });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
