import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'Okinte.placement@gmail.com' }
  });
  console.log("Current user:", user);

  if (user) {
    const updated = await prisma.user.update({
      where: { email: 'Okinte.placement@gmail.com' },
      data: {
        firstName: 'Peniel',
        lastName: 'Amani',
        phone: '+20 10 36264095'
      }
    });
    console.log("Updated user:", updated);
  } else {
    console.log("User not found!");
  }
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
