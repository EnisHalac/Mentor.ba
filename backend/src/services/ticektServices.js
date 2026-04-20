import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createTicket = async (userId, subject, description) => {
  return await prisma.ticket.create({
    data: { subject, description, creatorId: userId }
  });
};

export const getUserTickets = async (userId) => {
  return await prisma.ticket.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const getTicketDetails = async (ticketId, userId, userRole) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(ticketId) },
    include: {
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) throw new Error("Tiket nije pronađen.");
  if (userRole !== "ADMIN" && ticket.creatorId !== userId) throw new Error("Nemate pristup ovom tiketu.");
  
  return ticket;
};

export const addMessage = async (ticketId, userId, message) => {
  return await prisma.ticketMessage.create({
    data: { message, ticketId: Number(ticketId), senderId: userId }
  });
};

export const getAllTicketsAdmin = async () => {
  return await prisma.ticket.findMany({
    include: { creator: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateTicketStatus = async (ticketId, status) => {
  return await prisma.ticket.update({
    where: { id: Number(ticketId) },
    data: { status }
  });
};