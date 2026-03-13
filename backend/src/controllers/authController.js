import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: { connect: { name: "USER" } } 
      },
      include: { role: true }, 
    });

    res.status(201).json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Error on server." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, 
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        ok: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role.name ,avatar: user.avatar},
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error on server." });
  }
};