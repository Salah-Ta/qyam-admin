import { CreateMessageData, Message, StatusResponse } from '~/types/types';
import { client } from '../db-client.server';
import glossary from "~/lib/glossary";

const initializeDatabase = (dbUrl?: string) => {
  const db = dbUrl ? client(dbUrl) : client();
  if (!db) {
    throw new Error("فشل الاتصال بقاعدة البيانات");
  }
  return db;
};

const transformUser = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    phone: user.phone?.toString() || null
  };
};


const sendMessage = 
(data: CreateMessageData, fromUserId: string, dbUrl?: string): 
Promise<StatusResponse<Message>> => {
  if (!data.content || data.content.trim().length === 0) {
    return Promise.reject({
      status: "error",
      message: "محتوى الرسالة مطلوب"
    });
  }

  if (!data.toUserId || !fromUserId) {
    return Promise.reject({
      status: "error", 
      message: "معرف المستخدم مطلوب"
    });
  }
  const db = initializeDatabase(dbUrl);

  return new Promise((resolve, reject) => {
    db.message.create({
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
    })
      .then((res) => {
        const transformedMessage = {
          ...res,
          fromUser: transformUser(res.fromUser),
          toUser: transformUser(res.toUser)
        } as Message;
        resolve({
          status: "success",
          data: transformedMessage,
          message: "تم إرسال الرسالة بنجاح"
        });
      })
      .catch((error: any) => {
        console.log("ERROR [sendMessage]: ", error);
        reject({
          status: "error",
          message: "فشل إرسال الرسالة"
        });
      });
  });
};

/**
 * Get all messages for a user (both sent and received)
 */
const getUserMessages =
  (userId: string, dbUrl?: string):
    Promise<StatusResponse<Message[]>> => {
      const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.message.findMany({
        where: {
          OR: [
            { fromUserId: userId },
            { toUserId: userId }
          ],
          isDeleted: false
        },
        include: {
          fromUser: true,
          toUser: true
        },
        orderBy: {
          sentAt: 'desc'
        }
      })
        .then((res) => {
          const transformedMessages = res.map(message => ({
            ...message,
            fromUser: transformUser(message.fromUser),
            toUser: transformUser(message.toUser)
          })) as Message[];
          resolve({
            status: "success",
            data: transformedMessages
          });
        })
        .catch((error: any) => {
          console.log("ERROR [getUserMessages]: ", error);
          reject({
            status: "error",
            message: "فشل جلب الرسائل"
          });
        });
    });
  };

/**
 * Get all incoming messages for a user
 */
const getIncomingMessages =
  (userId: string, dbUrl?: string):
    Promise<StatusResponse<Message[]>> => {
    const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.message.findMany({
        where: {
          toUserId: userId,
          isDeleted: false
        },
        include: {
          fromUser: true,
          toUser: true
        },
        orderBy: {
          sentAt: 'desc'
        }
      })
        .then((res) => {
          const transformedMessages = res.map(message => ({
            ...message,
            fromUser: transformUser(message.fromUser),
            toUser: transformUser(message.toUser)
          })) as Message[];
          resolve({
            status: "success",
            data: transformedMessages
          });
        })
        .catch((error: any) => {
          console.log("ERROR [getIncomingMessages]: ", error);
          reject({
            status: "error",
            message: "فشل جلب الرسائل الواردة"
          });
        });
    });
  };

/**
 * Get unread messages count for a user
 */
const getUnreadCount =
  (userId: string, dbUrl?: string):
    Promise<StatusResponse<number>> => {
    const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.message.count({
        where: {
          toUserId: userId,
          isRead: false,
          isDeleted: false
        }
      })
        .then((res) => {
          resolve({
            status: "success",
            data: res
          });
        })
        .catch((error: any) => {
          console.log("ERROR [getUnreadCount]: ", error);
          reject({
            status: "error",
            message: "فشل حساب الرسائل غير المقروءة"
          });
        });
    });
  };

/**
 * Mark a message as read
 */
const markAsRead =
  (messageId: string, dbUrl?: string):
    Promise<StatusResponse<Message>> => {
    const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.message.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date()
        },
        include: {
          fromUser: true,
          toUser: true
        }
      })
        .then((res) => {
          const transformedMessage = {
            ...res,
            fromUser: transformUser(res.fromUser),
            toUser: transformUser(res.toUser)
          } as Message;
          resolve({
            status: "success",
            data: transformedMessage,
            message: "تم تحديث حالة الرسالة بنجاح"
          });
        })
        .catch((error: any) => {
          console.log("ERROR [markAsRead]: ", error);
          reject({
            status: "error",
            message: "فشل تحديث حالة الرسالة"
          });
        });
    });
  };

/**
 * Delete a message (soft delete)
 */
const deleteMessage =
  (messageId: string, dbUrl?: string):
    Promise<StatusResponse<null>> => {
    const db = initializeDatabase(dbUrl);

    return new Promise((resolve, reject) => {
      db.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      })
        .then(() => {
          resolve({
            status: "success",
            message: "تم حذف الرسالة بنجاح"
          });
        })
        .catch((error: any) => {
          console.log("ERROR [deleteMessage]: ", error);
          reject({
            status: "error",
            message: "فشل حذف الرسالة"
          });
        });
    });
  };

export default {
  sendMessage,
  getUserMessages,
  getIncomingMessages,
  getUnreadCount,
  markAsRead,
  deleteMessage
};