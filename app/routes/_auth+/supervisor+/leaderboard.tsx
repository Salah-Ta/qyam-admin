import React from "react";
import { LoaderFunctionArgs, data } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import statisticsService from "~/db/statistics/statistics.server";
import regionService from "~/db/region/region.server";
import userDB from "~/db/user/user.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent";
import { SupervisorPageLayout } from "~/components/supervisor/SupervisorPageLayout";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const user = await getAuthenticated({ request, context });
    if (!user) {
      return data({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUrl = context.cloudflare.env.DATABASE_URL;
    const url = new URL(request.url);

    const regionId = url.searchParams.get("regionId") || undefined;
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;

    // Fetch leaderboard data, regions, and current user in parallel
    let currentUserData = null;
    try {
      const fullUserResult = await userDB.getUser((user as any).id, dbUrl) as any;
      if (fullUserResult?.status === "success" && fullUserResult.data) {
        currentUserData = Array.isArray(fullUserResult.data) ? fullUserResult.data[0] : fullUserResult.data;
      }
    } catch (error) {}

    const [leaderboardData, regionsResult] = await Promise.all([
      statisticsService.getLeaderboardData(dbUrl, { regionId, startDate, endDate }),
      regionService.getAllRegions(dbUrl),
    ]);

    return {
      teachers: leaderboardData.teachers,
      schools: leaderboardData.schools,
      regionRankings: leaderboardData.regions,
      allRegions: regionsResult.data || [],
      filters: { regionId, startDate, endDate },
      currentUser: currentUserData,
    };
  } catch (error) {
    return data({ error: "Failed to load data" }, { status: 500 });
  }
}

export default function SupervisorLeaderboardPage() {
  const loaderData = useLoaderData<typeof loader>() as any;
  const currentUser = loaderData?.currentUser;

  return (
    <SupervisorPageLayout
      currentUser={currentUser}
      title="لوحة المتصدرين"
      subtitle="ترتيب المعلمات والمدارس والمناطق حسب نظام النقاط"
    >
      <LeaderboardContent
        teachers={loaderData?.teachers || []}
        schools={loaderData?.schools || []}
        regionRankings={loaderData?.regionRankings || []}
        allRegions={loaderData?.allRegions || []}
        filters={loaderData?.filters || {}}
      />
    </SupervisorPageLayout>
  );
}
