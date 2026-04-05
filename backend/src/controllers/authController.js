import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, message: "All fields are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email format." });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ ok: false, message: "Password must have at least 6 characters." });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ ok: false, message: "User with this email already exists." });
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

    return res.status(201).json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name, xp: user.xp },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ ok: false, message: "Error on server." });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: "Email and password are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email format." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, 
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        ok: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role.name ,avatar: user.avatar,xp: user.xp},
        token: generateToken(user.id),
      });
    } else {
      return res.status(401).json({ ok: false, message: "Invalid email or password." });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ ok: false, message: "Error on server." });
  }
};