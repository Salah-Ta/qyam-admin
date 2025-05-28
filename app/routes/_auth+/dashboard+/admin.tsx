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
  const navigate = useNavigate();
  const location = useLocation();

  // Data for sidebar menu items
  const menuItems = [
    {
      id: 0,
      title: "تقرير إنجازاتي",
      path: "/dashboard/trainer/trainerProfile",
    },
    { id: 2, title: "شهاداتي", path: "/dashboard/trainer/certificates" },
    {
      id: 3,
      title: "ركائز نجاح البرنامج",
      path: "/dashboard/trainer/achievements",
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden">
      <HorizontalTabs />
      <Outlet />
    </div>
  );
};

export default Trainer;
