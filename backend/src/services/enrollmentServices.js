import { prisma } from "../prisma.js";

export const toggleEnrollmentService = async (userId, listingId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing) throw new Error("Listing not found.");
  if (listing.authorId === userId) throw new Error("You cannot enroll in your own listing.");

  const existing = await prisma.enrollment.findUnique({
    where: { userId_listingId: { userId, listingId } }
  });

  if (existing) {
    const newStatus = existing.status === "CANCELLED" ? "PENDING" : "CANCELLED";
    return await prisma.enrollment.update({
      where: { id: existing.id },
      data: { status: newStatus }
    });
  }

  return await prisma.enrollment.create({
    data: { userId, listingId, status: "PENDING" }
  });
};

export const getMyEnrollmentsService = async (userId) => {
  return await prisma.enrollment.findMany({
    where: { 
      userId: userId
    },
    include: {
      listing: {
        include: { author: { select: { name: true, email: true, avatar: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const getAuthorListingsWithStatsService = async (authorId) => {
  return await prisma.listing.findMany({
    where: { authorId: authorId },
    include: {
      _count: {
        select: { enrollments: { where: { status: "ACTIVE" } } }
      },
      enrollments: {
        where: { status: "COMPLETED" },
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const completeEnrollmentService = async (mentorId, studentId, listingId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing) throw new Error("Listing not found.");
  if (listing.authorId !== mentorId) throw new Error("You do not have permission for this action.");

  return await prisma.$transaction(async (tx) => {
    const updatedEnrollment = await tx.enrollment.update({
      where: { userId_listingId: { userId: studentId, listingId } },
      data: { status: "COMPLETED" }
    });

    await tx.user.update({
      where: { id: studentId },
      data: { xp: { increment: 100 } }
    });

    await tx.user.update({
      where: { id: mentorId },
      data: { xp: { increment: 100 } }
    });

    return updatedEnrollment;
  });
};

export const approveEnrollmentService = async (mentorId, listingId, studentId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing || listing.authorId !== mentorId) {
    throw new Error("You do not have permission to approve enrollments for this listing.");
  }

  return await prisma.enrollment.update({
    where: { userId_listingId: { userId: studentId, listingId } },
    data: { status: "ACTIVE" }
  });
};

export const getListingEnrollmentsService = async (mentorId, listingId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing || listing.authorId !== mentorId) {
    throw new Error("Nemate pristup ovim podacima.");
  }

  return await prisma.enrollment.findMany({
    where: { listingId },
    include: {
      user: { select: { id: true, name: true, avatar: true, email: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const createReviewService = async (studentId, enrollmentId, rating, comment) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { listing: true }
  });

  if (!enrollment || enrollment.userId !== studentId) {
    throw new Error("Enrollment not found or unauthorized.");
  }
  
  if (enrollment.status !== "COMPLETED") {
    throw new Error("You can only review completed courses.");
  }

  return await prisma.review.create({
    data: {
      rating,
      comment,
      studentId,
      mentorId: enrollment.listing.authorId,
      enrollmentId
    }
  });
};