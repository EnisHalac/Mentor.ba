import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { role: true } 
      });

      next();
    } catch (error) {
      res.status(401).json({ message: "Niste autorizovani, token nije ispravan" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Niste autorizovani, nema tokena" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role.name === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Pristup odbijen. Samo za administratore." });
  }
};