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
    where: { userId },
    include: {
      review: true,
      listing: {
        include: { author: { select: { name: true, email: true, avatar: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

export const getAuthorListingsWithStatsService = async (authorId) => {
  const listings = await prisma.listing.findMany({
    where: { authorId },
    include: {
      author : {
        select: {
          name: true,
          email: true,
          avatar: true,
        }
      },
      enrollments: {
        select: { status: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return listings.map(l => ({
    ...l,
    activeCount: l.enrollments.filter(e => e.status === "ACTIVE").length,
    pendingCount: l.enrollments.filter(e => e.status === "PENDING").length
  }));
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

    await tx.notification.create({
      data: {
        userId: studentId,
        message: `The session for "${listing.title}" is completed. You can now leave a review for your mentor!`,
        type: "SUCCESS"
      }
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

export const rejectEnrollmentService = async (mentorId, listingId, studentId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.authorId !== mentorId) {
    throw new Error("No permission.");
  }
  return await prisma.enrollment.delete({
    where: { userId_listingId: { userId: studentId, listingId } }
  });
};

export const getListingEnrollmentsService = async (mentorId, listingId) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  if (!listing || listing.authorId !== mentorId) {
    throw new Error("Unauthorized access to this data.");
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
    throw new Error("You can only review completed sessions.");
  }

  return await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      studentId,
      mentorId: enrollment.listing.authorId,
      enrollmentId
    }
  });
};

export const getMentorReviewsService = async (mentorId) => {
  return await prisma.review.findMany({
    where: { 
      mentorId: Number(mentorId)
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};