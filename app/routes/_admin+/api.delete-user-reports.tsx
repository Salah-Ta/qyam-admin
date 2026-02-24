import { ActionFunctionArgs, data } from "@remix-run/cloudflare";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import reportDB from "~/db/report/report.server";

/**
 * Admin API endpoint to delete all reports for a specific user.
 *
 * POST /admin/api/delete-user-reports
 * Body: { userId: string } or { email: string }
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const user = await getAuthenticated({ request, context });

  if (!user || (user as any).role !== "admin") {
    return data(
      { status: "error", message: "غير مصرح لك بالوصول" },
      { status: 403 }
    );
  }

  const dbUrl = context.cloudflare.env.DATABASE_URL;

  try {
    const formData = await request.formData();
    let userId = formData.get("userId")?.toString();
    const email = formData.get("email")?.toString();

    // If email provided instead of userId, look up the user
    if (!userId && email) {
      const userDB = (await import("~/db/user/user.server")).default;
      const userResult = await userDB.getUserByEmail(email, dbUrl);
      if (userResult.status === "error" || !userResult.data) {
        return data(
          { status: "error", message: "المستخدم غير موجود" },
          { status: 404 }
        );
      }
      const userData: any = Array.isArray(userResult.data)
        ? userResult.data[0]
        : userResult.data;
      userId = userData.id;
    }

    if (!userId) {
      return data(
        { status: "error", message: "يرجى توفير معرف المستخدم أو البريد الإلكتروني" },
        { status: 400 }
      );
    }

    const result = await reportDB.deleteUserReports(userId, dbUrl);

    return {
      status: result.status,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return data(
      { status: "error", message: "فشل حذف التقارير" },
      { status: 500 }
    );
  }
}
