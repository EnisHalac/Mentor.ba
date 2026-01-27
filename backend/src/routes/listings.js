import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

/**
 * GET /listings
 */
router.get("/", async (req, res) => {
  const { category, minPrice, maxPrice, mode, location, level } = req.query;

  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(mode ? { mode } : {}),
    ...(level ? { level } : {}),
    ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
    ...(minPrice || maxPrice
      ? {
          pricePerHour: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
  };

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { instructor: { include: { user: true } } },
  });

  res.json({ ok: true, listings });
});

/**
 * POST /listings
 */
router.post("/", async (req, res) => {
  const {
    instructorId,
    title,
    description,
    category,
    pricePerHour,
    level,
    mode,
    location,
  } = req.body;

  if (!instructorId || !title || !description || !category || !pricePerHour || !level || !mode) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  const listing = await prisma.listing.create({
    data: {
      instructorId: Number(instructorId),
      title,
      description,
      category,
      pricePerHour: Number(pricePerHour),
      level,
      mode,
      location: location || null,
    },
  });

  res.status(201).json({ ok: true, listing });
});

export default router;
