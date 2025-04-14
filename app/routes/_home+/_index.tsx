import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import Hero from "./components/hero";
import About from "./components/about";
import TeachingMethods from "./components/teaching-methods";
import EvaluationMethods from "./components/evaluation-methods";
import TargetedUsers from "./components/targeted-users";
import Partners from "./components/partners";
import Outro from "./components/outro";
import Statistics from "./components/statistics";
import statisticsDB from "~/lib/statistics.server";
export async function loader({ request , context}: LoaderFunctionArgs) {
  const stats = await statisticsDB.getStatistics(context.cloudflare.env.DATABASE_URL)
  
return {stats}
}

export default function Index() {
  return (
    <div className="flex flex-col gap-y-12">
      <Hero/>
      <About/>
      <EvaluationMethods/>
      <TeachingMethods/>
      <TargetedUsers/>
      <Statistics/>

      <Partners/>
      <Outro/>
    </div>
  );
}

