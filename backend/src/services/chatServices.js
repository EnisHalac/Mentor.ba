import { prisma } from "../prisma.js";

export const findOrCreateConversation = async (userIdA, userIdB) => {
  const user1Id = Math.min(userIdA, userIdB);
  const user2Id = Math.max(userIdA, userIdB);

  let conversation = await prisma.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id, user2Id } },
    include: {
      user1: { select: { id: true, name: true, avatar: true } },
      user2: { select: { id: true, name: true, avatar: true } },
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { user1Id, user2Id },
      include: {
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
      }
    });
  }
  return conversation;
};

export const getUserConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: { select: { id: true, name: true, avatar: true } },
      user2: { select: { id: true, name: true, avatar: true } },
      messages: {
        where: { senderId: { not: userId }, isRead: false },
        select: { id: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
  });

  return conversations.map(c => ({
    ...c,
    unreadCount: c.messages.length
  }));
};

export const getMessagesByConversation = async (conversationId, userId) => {
  await prisma.message.updateMany({
    where: { conversationId: parseInt(conversationId), senderId: { not: userId }, isRead: false },
    data: { isRead: true }
  });

  return await prisma.message.findMany({
    where: { conversationId: parseInt(conversationId) },
    orderBy: { createdAt: 'asc' },
  });
};

export const createMessage = async (conversationId, senderId, content) => {
  const message = await prisma.message.create({
    data: {
      conversationId: parseInt(conversationId),
      senderId: parseInt(senderId),
      content,
      isRead: false
    },
  });

  await prisma.conversation.update({
    where: { id: parseInt(conversationId) },
    data: { updatedAt: new Date() }
  });

  return message;
};

export const searchUsersByName = async (searchQuery, currentUserId) => {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      roleId: { not: 9 },
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } }
      ],
    },
    select: { id: true, name: true, email: true, avatar: true },
    take: 10,
  });
  return users;
};