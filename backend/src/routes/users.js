import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { id: "desc" },
  });
  res.json({ ok: true, users });
});

router.post("/", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "email i password su obavezni" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ ok: false, message: "email je vec registrovan" });
    }

    if (typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ ok: false, message: "email nije validan, mora sadržavati @" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: name ?? null,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "server error" });
  }
});

export default router;
