// @ts-nocheck
/**
 * Database Seed Script
 * 
 * WHY: The 5 services (Study, Internship, Scholarship, Sabbatical, Employment)
 * need to exist in the database BEFORE users can apply. This script creates
 * them with their correct keys and default pricing.
 * 
 * It also creates a default admin account for managing the platform.
 * 
 * RUN: npx tsx prisma/seed.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create Prisma client with driver adapter (Prisma 7 requirement)
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...\n');

  // ============================================================
  // SEED SERVICES (5 core services)
  // ============================================================
  const services = [
    { key: 'study',       price: 150.00 },
    { key: 'internship',  price: 150.00 },
    { key: 'scholarship', price: 150.00 },
    { key: 'sabbatical',  price: 150.00 },
    { key: 'employment',  price: 150.00 },
  ];

  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { key: service.key },
      update: { price: service.price },
      create: {
        key: service.key,
        price: service.price,
        isActive: true,
      },
    });
    console.log(`  ✅ Service: ${created.key} (ID: ${created.id})`);
  }

  // ============================================================
  // SEED ADMIN USER (default admin account)
  // Password: Admin@Bolila2026
  // ============================================================
  const bcryptModule = await import('bcryptjs');
  const bcrypt = bcryptModule.default || bcryptModule;
  const adminPassword = await bcrypt.hash('Admin@Bolila2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bolila.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Bolila',
      email: 'admin@bolila.com',
      phone: '+000000000',
      country: 'International',
      city: 'HQ',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`  ✅ Admin: ${admin.email} (Role: ${admin.role})`);

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
