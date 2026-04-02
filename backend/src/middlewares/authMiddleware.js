import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

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

      return next();
    } catch (error) {
      return res.status(401).json({ ok: false, message: "Invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role?.name === "ADMIN") {
    return next();
  } else {
    return res.status(403).json({ ok: false, message: "Access denied. Only for administrators." });
  }
};