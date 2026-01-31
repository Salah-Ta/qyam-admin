import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { getPrismaClient } from "~/db/db-client.server";

/**
 * API endpoint to check user status before login attempt.
 * Returns specific error codes based on acceptenceState.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const emailRaw = formData.get("email")?.toString()?.trim();

  if (!emailRaw) {
    return json({
      status: "error",
      code: "INVALID_EMAIL",
      canLogin: false
    });
  }

  // Normalize email to lowercase for case-insensitive lookup
  const email = emailRaw.toLowerCase();

  try {
    const prisma = await getPrismaClient(
      context.cloudflare.env.DATABASE_URL,
      context
    );

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        acceptenceState: true,
        banned: true
      }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return json({
        status: "ok",
        canLogin: true
      });
    }

    // Check banned status
    if (user.banned) {
      return json({
        status: "blocked",
        code: "ACCOUNT_DEACTIVATED",
        canLogin: false
      });
    }

    // Check acceptenceState
    switch (user.acceptenceState) {
      case "accepted":
        return json({
          status: "ok",
          canLogin: true
        });

      case "pending":
        return json({
          status: "blocked",
          code: "ACCOUNT_PENDING",
          canLogin: false
        });

      case "denied":
        return json({
          status: "blocked",
          code: "ACCOUNT_DENIED",
          canLogin: false
        });

      case "idle":
        return json({
          status: "blocked",
          code: "ACCOUNT_DEACTIVATED",
          canLogin: false
        });

      default:
        // Unknown state - treat as pending
        return json({
          status: "blocked",
          code: "ACCOUNT_PENDING",
          canLogin: false
        });
    }
  } catch (error) {
    console.error("Error checking user status:", error);
    // On error, allow login attempt (let better-auth handle it)
    return json({
      status: "ok",
      canLogin: true
    });
  }
}
