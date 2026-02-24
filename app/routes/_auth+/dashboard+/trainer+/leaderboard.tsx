import { LoaderFunctionArgs, data } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import statisticsService from "~/db/statistics/statistics.server";
import regionService from "~/db/region/region.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { LeaderboardContent } from "~/components/leaderboard/LeaderboardContent";

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
    };
  } catch (error) {
    return data({ error: "Failed to load data" }, { status: 500 });
  }
}

export default function TrainerLeaderboardPage() {
  const loaderData = useLoaderData<typeof loader>() as any;

  return (
    <LeaderboardContent
      teachers={loaderData?.teachers || []}
      schools={loaderData?.schools || []}
      regionRankings={loaderData?.regionRankings || []}
      allRegions={loaderData?.allRegions || []}
      filters={loaderData?.filters || {}}
    />
  );
}
