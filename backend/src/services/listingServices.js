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

  if (!listing) throw new Error("Listing not found.");

  if (listing.authorId !== userId && userRole !== "ADMIN") {
    throw new Error("You are not the owner of this listing.");
  }

  return await prisma.listing.delete({ where: { id: parseInt(id) } });
};