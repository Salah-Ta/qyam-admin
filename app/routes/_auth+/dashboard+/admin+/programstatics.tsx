import React from "react";
import { useNavigate, Outlet, useLocation } from "@remix-run/react";

export default function ProgramStaticsLayout(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log the current pathname
  console.log("Current pathname:", location.pathname);

  // More robust active state detection
  const isStatisticsActive =
    location.pathname === "/dashboard/admin/programstatics" ||
    location.pathname === "/dashboard/admin/programstatics/" ||
    (location.pathname.startsWith("/dashboard/admin/programstatics") &&
      !location.pathname.includes("/skills"));

  const isSkillsActive = location.pathname.includes("/skills");

  console.log(
    "Statistics active:",
    isStatisticsActive,
    "Skills active:",
    isSkillsActive
  );

  const tabItems = [
    {
      id: "statistics",
      label: "إحصاءات البرنامج",
      path: "/dashboard/admin/programstatics",
      active: isStatisticsActive,
      hasIndicator: isStatisticsActive,
    },
    {
      id: "skills",
      label: "المهارات",
      path: "/dashboard/admin/programstatics/skills",
      active: isSkillsActive,
      hasIndicator: isSkillsActive,
    },
  ];

  return (
    <div className="bg-[#f9f9f9]">
      <div className="py-6 [direction:rtl] max-lg:px-[10px] lg:mr-[50px]">
        <div className="w-full py-6 rounded-xl">
          {/* Header Section */}
          <div className="flex flex-col items-start mb-6 pb-4 max-lg:items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {"إحصاءات المناطق"}
            </h1>
            <p className="text-lg font-normal text-[#535862]">
              بيانات المناطق والمدراس والإدرات
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col gap-4 relative self-stretch w-full">
          <div className="w-full">
            <div className="flex flex-col md:flex-row">
              {tabItems.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`min-h-10 px-4 py-2 border border-[#D5D7DA] w-full md:w-auto [direction:rtl] transition-colors ${
                    tab.active 
                      ? "bg-white shadow-sm z-10 -mb-px" 
                      : "bg-[#F8F9FA] hover:bg-white z-[1]"
                  }
          ${index === 0 ? "md:rounded-r-md rounded-t-md md:rounded-l-none" : ""}
          ${
            index === tabItems.length - 1
              ? "md:rounded-l-md rounded-b-md md:rounded-r-none"
              : ""
          }
          ${
            index !== tabItems.length - 1
              ? "md:border-b"
              : ""
          }`}
                >
                  <div className="flex items-center justify-center md:justify-start flex-row-reverse">
                    {tab.hasIndicator && (
                      <div className="relative w-2.5 h-2.5 ml-2">
                        <div className="relative w-2 h-2 top-px -left-[5px] bg-[#17b169] rounded" />
                      </div>
                    )}
                    <span className={`font-bold text-sm text-center md:text-right tracking-[0] leading-5 whitespace-nowrap ${
                      tab.active ? "text-[#17b169]" : "text-[#414651]"
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - This will be replaced by the nested routes */}
      <Outlet />
    </div>
  );
}
