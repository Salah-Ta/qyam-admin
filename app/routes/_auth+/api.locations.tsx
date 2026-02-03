import { LoaderFunctionArgs, data } from "@remix-run/cloudflare";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import schoolDB from "~/db/school/school.server";

/**
 * API endpoint for fetching filtered location data (eduAdmins and schools).
 *
 * Query parameters:
 * - type: "eduAdmins" | "schools"
 * - regionId: (required for eduAdmins) - filter eduAdmins by region
 * - eduAdminId: (required for schools) - filter schools by eduAdmin
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const regionId = url.searchParams.get("regionId");
  const eduAdminId = url.searchParams.get("eduAdminId");

  try {
    if (type === "eduAdmins" && regionId) {
      const result = await eduAdminDB.getEduAdminsByRegion(regionId, dbUrl);
      return {
        success: true,
        data: result.data || []
      };
    }

    if (type === "schools" && eduAdminId) {
      const result = await schoolDB.getSchoolsByEduAdmin(eduAdminId, dbUrl);
      return {
        success: true,
        data: result.data || []
      };
    }

    return data({
      success: false,
      error: "Invalid request parameters",
      data: []
    }, { status: 400 });

  } catch (error) {
    return data({
      success: false,
      error: "Failed to fetch data",
      data: []
    }, { status: 500 });
  }
}
