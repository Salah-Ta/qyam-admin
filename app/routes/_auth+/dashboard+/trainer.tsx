import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";

import { Button } from "./trainer+/assets/button";
import { NavFeaturedCard } from "./trainer+/NavFeatureCard";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { PlusCircleIcon } from "lucide-react";

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
    <div className="flex flex-col w-full max-w-full overflow-hidden md:mt-32">
      <div className="flex gap-6 flex-row-reverse w-full max-md:flex-col max-w-full">
        {/* Sidebar */}
        <div className="w-full md:w-[286px] flex flex-col gap-4 max-w-full">
          {/* Menu Items */}
          <div className="flex flex-col gap-4 w-full mt-[51px]">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path; // Check if the current path matches the button's path
              return (
                <Button
                  key={item.id}
                  variant="outline"
                  className={`w-full justify-center items-center gap-2 px-[22px] py-4 rounded-[10px] border border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic ${
                    isActive
                      ? "bg-[#68C35C] text-white hover:bg-[#4E9E48] hover:text-white" // Active styles with hover
                      : "bg-white text-[#414651] hover:bg-[#f0f0f0]" // Default styles with hover
                  }`}
                  onClick={() => item.path && navigate(`${item.path}`)}
                >
                  <span className="  font-bold text-lg leading-7 whitespace-nowrap [direction:rtl]">
                    {item.title}
                  </span>
                </Button>
              );
            })}
          </div>
          {/* Progress Card */}
          {location.pathname === "/dashboard/trainer/trainerProfile" && (
            <NavFeaturedCard />
          )}
        </div>
        <div className="flex-1 w-full max-w-full max-md:w-full">
          <div className="mb-4 flex justify-start">
            <Button
              variant="outline"
              className="flex items-center gap-1.5 px-[18px] py-3 rounded-lg border border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic "
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span className="  font-bold text-[#414651] text-base text-left  whitespace-nowrap [direction:rtl]">
                تقرير جديد
              </span>
            </Button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Trainer;
