import { PrismaClient } from '@prisma/client';
import { CreateMessageData, Message, StatusResponse } from '~/types/types';

/**
 * Send a new message from one user to another
 */
async function sendMessage(data: CreateMessageData, fromUserId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const message = await prisma.message.create({
      data: {
        content: data.content,
        fromUserId: fromUserId,
        toUserId: data.toUserId,
        isRead: false,
        isDeleted: false
      },
      include: {
        fromUser: true,
        toUser: true
      }
    });

    return { success: true, data: message };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get all messages for a user (both sent and received)
 */
async function getUserMessages(userId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: userId, isDeleted: false },
          { toUserId: userId, isDeleted: false }
        ]
      },
      include: {
        fromUser: true,
        toUser: true
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    return { success: true, data: messages };
  } catch (error: any) {
    console.error("Error fetching user messages:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get all incoming messages for a user
 */
async function getIncomingMessages(userId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const messages = await prisma.message.findMany({
      where: {
        toUserId: userId,
        isDeleted: false
      },
      include: {
        fromUser: true
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    return { success: true, data: messages };
  } catch (error: any) {
    console.error("Error fetching incoming messages:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get unread messages count for a user
 */
async function getUnreadCount(userId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const count = await prisma.message.count({
      where: {
        toUserId: userId,
        isRead: false,
        isDeleted: false
      }
    });

    return { success: true, data: count };
  } catch (error: any) {
    console.error("Error counting unread messages:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Mark a message as read
 */
async function markAsRead(messageId: string, dbUrl: string) {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return { success: true, data: message };
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Delete a message (soft delete)
 */
async function deleteMessage(messageId: string, dbUrl: string): Promise<StatusResponse<Message>> {
  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return {
      status: "success",
      message: "تم حذف الرسالة بنجاح",
    };
  } catch (error: any) {
    console.error("Error deleting message:", error);
    return {
      status: "error",
      message: "فشل حذف الرسالة",
    };
  } finally {
    await prisma.$disconnect();
  }
}

export default {
  sendMessage,
  getUserMessages,
  getIncomingMessages,
  getUnreadCount,
  markAsRead,
  deleteMessage
};