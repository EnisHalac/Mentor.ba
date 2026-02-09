import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";

export async function createUser({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("EMAIL_EXISTS");
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: passwordHash, name: name ?? null },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return user;
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });
}
