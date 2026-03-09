import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ ok: false, message: "Pogrešan email ili lozinka" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ ok: false, message: "Pogrešan email ili lozinka" });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ 
      ok: true, 
      user: userWithoutPassword,
      message: "Uspješna prijava!" 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}