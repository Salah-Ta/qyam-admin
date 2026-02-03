import { ActionFunctionArgs, data } from "@remix-run/cloudflare";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import schoolDB from "~/db/school/school.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";

/**
 * Admin API endpoint to clean up duplicate schools and eduAdmins.
 * This should be run before applying the unique constraint migration.
 *
 * POST /admin/api/cleanup-duplicates
 * Body: { type: "schools" | "eduAdmins" | "all" }
 */
export async function action({ request, context }: ActionFunctionArgs) {
  // Verify admin access
  const user = await getAuthenticated({ request, context });

  if (!user || user.role !== "admin") {
    return data({
      status: "error",
      message: "غير مصرح لك بالوصول"
    }, { status: 403 });
  }

  const dbUrl = context.cloudflare.env.DATABASE_URL;

  try {
    const formData = await request.formData();
    const type = formData.get("type")?.toString() || "all";

    const results: {
      schools?: { removed: number };
      eduAdmins?: { removed: number };
    } = {};

    if (type === "schools" || type === "all") {
      const schoolResult = await schoolDB.removeDuplicateSchools(dbUrl);
      results.schools = schoolResult.data;
    }

    if (type === "eduAdmins" || type === "all") {
      const eduAdminResult = await eduAdminDB.removeDuplicateEduAdmins(dbUrl);
      results.eduAdmins = eduAdminResult.data;
    }

    return {
      status: "success",
      message: "تم تنظيف البيانات المكررة بنجاح",
      data: results
    };

  } catch (error) {
    return data({
      status: "error",
      message: "فشل تنظيف البيانات المكررة"
    }, { status: 500 });
  }
}
