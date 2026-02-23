import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Čistim bazu podataka...");
  
  // 1. Brisanje postojećih podataka (Redoslijed je bitan!)
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  
  console.log("✅ Baza je očišćena.");

  // 2. Kreiranje Uloga (Role)
  const roles = ['USER', 'MENTOR', 'ADMIN'];
  const roleObjects = {};

  for (const roleName of roles) {
    const createdRole = await prisma.role.create({
      data: { name: roleName },
    });
    roleObjects[roleName] = createdRole;
  }

  console.log("✅ Uloge ponovo kreirane.");

  // 3. Priprema heširane lozinke
  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('lozinka123', salt);

  // 4. Kreiranje 3 testna korisnika
  const usersToCreate = [
    { name: 'Test User', email: 'user@gmail.com', role: 'USER' },
    { name: 'Test Mentor', email: 'mentor@gmail.com', role: 'MENTOR' },
    { name: 'Test Admin', email: 'admin@gmail.com', role: 'ADMIN' },
  ];

  for (const u of usersToCreate) {
    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: commonPassword,
        roleId: roleObjects[u.role].id,
      },
    });
  }

  console.log("🚀 Testni profili su spremni:");
  console.log("- user@gmail.com / lozinka123");
  console.log("- mentor@gmail.com / lozinka123");
  console.log("- admin@gmail.com / lozinka123");
}

main()
  .catch((e) => {
    console.error("❌ Greška pri seedovanju:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });