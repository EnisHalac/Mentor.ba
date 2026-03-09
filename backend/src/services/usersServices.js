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
    data: { email, password: passwordHash, name: name ?? null ,roleId: 4},
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

export async function updateUser(userId, data) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      avatar: data.avatar,
      portfolioUrl: data.portfolioUrl
    },
    select: { id: true, email: true, name: true, avatar: true, portfolioUrl: true, role: true }
  });
}

