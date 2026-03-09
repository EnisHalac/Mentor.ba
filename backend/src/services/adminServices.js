import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllPendingRequests = async () => {
  return await prisma.mentorRequest.findMany({
    where: { status: "PENDING" },
    include: { 
      user: { select: { id: true, name: true, email: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const processApproval = async (requestId) => {
  const request = await prisma.mentorRequest.findUnique({ where: { id: parseInt(requestId) } });
  if (!request) throw new Error("Zahtjev nije pronađen.");

  return await prisma.$transaction([
    prisma.user.update({ where: { id: request.userId }, data: { roleId: 5 } }),
    prisma.mentorRequest.update({ where: { id: parseInt(requestId) }, data: { status: "APPROVED" } }),
    prisma.notification.create({
      data: { userId: request.userId, message: "Čestitamo! Vaš zahtjev za mentorstvo je ODOBREN.", type: "SUCCESS" }
    })
  ]);
};

export const processRejection = async (requestId, reason) => {
  const request = await prisma.mentorRequest.findUnique({ where: { id: parseInt(requestId) } });
  
  return await prisma.$transaction([
    prisma.mentorRequest.update({ where: { id: parseInt(requestId) }, data: { status: "REJECTED" } }),
    prisma.notification.create({
      data: { userId: request.userId, message: `Zahtjev odbijen. Razlog: ${reason}`, type: "ERROR" }
    })
  ]);
};

export const getSystemStats = async () => {
  const [users, mentors, pending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { roleId: 5 } }),
    prisma.mentorRequest.count({ where: { status: "PENDING" } })
  ]);
  return { users, mentors, pending };
};