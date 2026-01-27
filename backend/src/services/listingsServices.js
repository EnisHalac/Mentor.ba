import { prisma } from "../prisma.js";

export async function listListings(filters) {
  const { category, minPrice, maxPrice, mode, location, level } = filters;

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

  return prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      instructor: {
        include: { user: true },
      },
    },
  });
}

export async function createListing(payload) {
  const {
    instructorId,
    title,
    description,
    category,
    pricePerHour,
    level,
    mode,
    location,
  } = payload;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: Number(instructorId) },
    select: { id: true },
  });

  if (!instructor) {
    const err = new Error("INSTRUCTOR_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  return prisma.listing.create({
    data: {
      instructorId: Number(instructorId),
      title,
      description,
      category,
      pricePerHour: Number(pricePerHour),
      level,
      mode,
      location: location ?? null,
      isActive: true,
    },
  });
}
