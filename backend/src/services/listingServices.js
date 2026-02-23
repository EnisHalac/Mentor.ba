import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createNewListing = async (listingData, authorId) => {
  return await prisma.listing.create({
    data: {
      ...listingData,
      price: parseFloat(listingData.price),
      authorId: authorId,
    },
  });
};

export const fetchAllListings = async (filters = {}) => {
  return await prisma.listing.findMany({
    where: filters,
    include: {
      author: {
        select: {
          name: true,
          email: true,
          mentorProfile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteListingById = async (id, userId, userRole) => {
  const listing = await prisma.listing.findUnique({ where: { id: parseInt(id) } });

  if (!listing) throw new Error("Oglas nije pronađen.");

  if (listing.authorId !== userId && userRole !== "ADMIN") {
    throw new Error("Nemate dozvolu za brisanje ovog oglasa.");
  }

  return await prisma.listing.delete({ where: { id: parseInt(id) } });
};