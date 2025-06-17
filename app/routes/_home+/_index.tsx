import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import statisticsDB from "~/lib/statistics.server";
import { Header } from "./components-updated/header";
import HomeSectionOne from "./components-updated/homeSectionOne";
import { HomeSectionSeven } from "./components-updated/homeSectionSeven";
import HomeSectionTwo from "./components-updated/homeSectionTwo";

import { HomeSectionThree } from "./components-updated/homeSectionThree";
import { HomeSectionFive } from "./components-updated/homeSectionFive";
import HomeSectionSix from "./components-updated/homeSectionSix";
import { HomeSectionFour } from "./components-updated/homeSectionFour";
export async function loader({ request, context }: LoaderFunctionArgs) {
  const stats = await statisticsDB.getStatistics(
    context.cloudflare.env.DATABASE_URL
  );

  return { stats };
}

export default function Index() {
  return (
    <div className="flex flex-col gap-y-12" >
      <Header />
      <HomeSectionOne />
      <HomeSectionTwo />
      <HomeSectionThree />
      <HomeSectionFour />
      <HomeSectionFive />
      <HomeSectionSix />
      <HomeSectionSeven />
    </div>
  );
}
