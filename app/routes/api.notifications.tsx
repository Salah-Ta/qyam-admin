import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import messageDB from "~/db/message/message.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { Message } from "~/types/types";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const currentUser = await getAuthenticated({ request, context });

  if (!currentUser) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get all incoming messages for the user
    const messagesResult = await messageDB.getIncomingMessages(
      currentUser.id,
      context.cloudflare.env.DATABASE_URL
    );

    // Get unread count
    const unreadCountResult = await messageDB.getUnreadCount(
      currentUser.id,
      context.cloudflare.env.DATABASE_URL
    );

    const messages = messagesResult.status === "success" ? messagesResult.data : [];
    const unreadCount = unreadCountResult.status === "success" ? unreadCountResult.data : 0;

    return Response.json({
      messages: messages || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const currentUser = await getAuthenticated({ request, context });

  if (!currentUser) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "markAsRead") {
      const messageId = formData.get("messageId")?.toString();

      if (!messageId) {
        return Response.json(
          { error: "Message ID is required" },
          { status: 400 }
        );
      }

      await messageDB.markAsRead(messageId, context.cloudflare.env.DATABASE_URL);

      return Response.json({
        success: true,
        message: "Message marked as read"
      });
    }

    if (action === "markAllAsRead") {
      // Get all unread messages for the user and mark them as read
      const messagesResult = await messageDB.getIncomingMessages(
        currentUser.id,
        context.cloudflare.env.DATABASE_URL
      );

      if (messagesResult.status === "success" && messagesResult.data && Array.isArray(messagesResult.data)) {
        const messages = messagesResult.data as Message[];
        const unreadMessages = messages.filter(msg => !msg.isRead);
        
        // Mark each unread message as read
        await Promise.all(
          unreadMessages.map(msg => {
            if (msg.id) {
              return messageDB.markAsRead(msg.id, context.cloudflare.env.DATABASE_URL);
            }
            return Promise.resolve();
          })
        );
      }

      return Response.json({
        success: true,
        message: "All messages marked as read"
      });
    }

    return Response.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error handling notification action:", error);
    return Response.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
