import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";

import { Button } from "./trainer+/assets/button";
import { NavFeaturedCard } from "./trainer+/NavFeatureCard";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { PlusCircleIcon } from "lucide-react";
import HorizontalTabs from "./admin+/horizontalTabs";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  return materialDB
    .getAllMaterials(context.cloudflare.env.DATABASE_URL)
    .then((res: any) => {
      return Response.json(res.data);
    })
    .catch(() => {
      return null;
    });
}

export const Trainer = () => {
  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden">
      <HorizontalTabs />
      <Outlet />
    </div>
  );
};

export default Trainer;
