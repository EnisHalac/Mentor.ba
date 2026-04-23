import { prisma } from "../prisma.js";

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
  const { search, category, minPrice, maxPrice, minRating, mode, location, sortBy } = filters;
  const whereClause = {};

  if (category) {
    whereClause.category = { equals: category, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) whereClause.price.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
  }

  if (mode) {
    whereClause.mode = mode; 
  }

  if (location) {
    whereClause.location = { equals: location, mode: "insensitive" };
  }

  let listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          name: true,
          email: true,
          mentorProfile: true,
          avatar: true,
          reviewsReceived: true 
        },
      },
    },
  });

  listings = listings.map(listing => {
    const reviews = listing.author?.reviewsReceived || [];
    let avgRating = 0;
    if (reviews.length > 0) {
      const totalScore = reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0);
      avgRating = totalScore / reviews.length;
    }
    return { ...listing, avgRating };
  });

  if (search) {
    const searchTerms = search.toLowerCase().trim().split(/\s+/);
    
    listings = listings.filter(listing => {
      const textToSearch = `${listing.title} ${listing.description} ${listing.category}`.toLowerCase();
      
      return searchTerms.every(term => {
        const regex = new RegExp(`(^|[^a-zA-Z0-9šđčćžŠĐČĆŽ])${term}`, 'i');
        return regex.test(textToSearch);
      });
    });
  }

  if (minRating) {
    const requiredRating = parseFloat(minRating);
    listings = listings.filter(listing => listing.avgRating >= requiredRating);
  }

  if (sortBy === "price_asc") {
    listings.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price_desc") {
    listings.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating_desc") {
    listings.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sortBy === "date_asc") {
    listings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return listings;
};

export const deleteListingById = async (id, userId, userRole) => {
  const listing = await prisma.listing.findUnique({ where: { id: parseInt(id) } });

  if (!listing) throw new Error("Listing not found.");

  if (listing.authorId !== userId && userRole !== "ADMIN") {
    throw new Error("You do not have permission to delete this listing.");
  }

  return await prisma.listing.delete({ where: { id: parseInt(id) } });
};

export const getListingByIdService = async (id) => {
  return await prisma.listing.findUnique({
    where: { id: id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true,
          portfolioUrl: true,
          reviewsReceived: { 
            include: { student: true },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });
};