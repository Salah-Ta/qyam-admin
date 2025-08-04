import { Auth, betterAuth, Session, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { sendEmail } from "./send-email.server";
import { AppLoadContext } from "@remix-run/cloudflare";
import { client } from "~/db/db-client.server";
import { getSession } from "../utils/session.server";
import { redirect } from "@remix-run/cloudflare";

export type Environment = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};

export const getAuth = (context: AppLoadContext) => {
  // Create a new auth instance for each request
   const dbClient = client(context.cloudflare.env.DATABASE_URL);
   console.log("db client is null?:   ", !!dbClient);
   console.log("db connection::::",context.cloudflare.env.DATABASE_URL);
  
  

  return betterAuth({
    databaseHooks: {
      session: {
        create: {
          before: async (sessionInstance: any) => {
            const user = (await dbClient.user.findUnique({
              where: { id: sessionInstance.userId },
              select: { acceptenceState: true }
            })) as QUser;

            if (
              user &&
              user.acceptenceState !== "accepted" 
            ) {
              return false;
            }

            return {
              data: {
                ...sessionInstance,
              },
            };
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      // requireEmailVerification: true,
      sendResetPassword: async ({ user, url, token }, request) => {
        await sendEmail(
          {
            to: user.email,
            subject: "إعادة تعيين كلمة المرور",
            template: "password-reset",
            props: {
              resetUrl: url,
            },
            text: `قم بتعيين كلمة مرورك بالضغط على هذا الرابط: ${url}`,
          },
          context.cloudflare.env.RESEND_API,
          context.cloudflare.env.MAIN_EMAIL
        );
      },
    },

    user: {
      additionalFields: {
        cvKey: { type: "string" },
        bio: { type: "string" },
        phone: { type: "number" },
        acceptenceState: { type: "string" },
        trainingHours: { type: "number" },
        noStudents: { type: "number" },
        region: { type: "string" },
        level: { type: "string" },
        role: { type: "string" }, // Add this line
      },
    },
    database: prismaAdapter(
      client(context.cloudflare.env.DATABASE_URL) as any,
      {
        provider: "postgresql",
      }
    ),

    // databaseHooks: {
    //   session: {
    //     create: {
    //       before: async (sessionInstance: any) => {
    //         const user = (await dbClient.user.findUnique({
    //           where: { id: sessionInstance.userId },
    //         })) as QUser;

    //         if (
    //           user &&
    //           user.acceptenceState !== "accepted" &&
    //           user.role === "user"
    //         ) {
    //           return false;
    //         }

    //         return {
    //           data: {
    //             ...sessionInstance,
    //           },
    //         };
    //       },
    //     },
    //   },
    // },
    plugins: [admin()],
  });
};

export async function getAuthenticatedUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) return null;

  const dbClient = client(process.env.DATABASE_URL || "");
  if (!dbClient) {
    return null;
  }
  return dbClient.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function redirectIfAuthenticated(request: Request, context: any) {
  const user = await getAuthenticatedUser(request);
  if (user) throw redirect("/login");
}
