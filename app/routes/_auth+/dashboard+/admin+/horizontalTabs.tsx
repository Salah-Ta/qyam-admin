import React from "react";
import { Link, useLocation } from "@remix-run/react";

export const HorizontalTabs = (): JSX.Element => {
  const location = useLocation();

  const getActiveTabFromPath = () => {
    if (!location?.pathname) return "programstatics";
    if (location.pathname === "/dashboard/admin/leaderboard") return "leaderboard";

    const pathParts = location.pathname.split("/");
    const adminIndex = pathParts.indexOf("admin");

    if (adminIndex !== -1 && adminIndex + 1 < pathParts.length) {
      const tabPart = pathParts[adminIndex + 1];
      if (tabPart === "programstatics" || location.pathname.includes("/programstatics")) {
        return "programstatics";
      }
      return tabPart || "programstatics";
    }
    return "programstatics";
  };

  const activeTab = getActiveTabFromPath();

  const tabItems = [
    { id: "leaderboard", label: "لوحة المتصدرين", path: "/dashboard/admin/leaderboard" },
    { id: "programstatics", label: "إحصاءات البرنامج", path: "/dashboard/admin/programstatics" },
    { id: "controlpanel", label: "مركز المعرفة", path: "/dashboard/admin/controlpanel" },
    { id: "settings", label: "إعدادات النظام", path: "/dashboard/admin/settings" },
    { id: "users", label: "الأعضاء", path: "/dashboard/admin/users" },
  ];

  return (
    <div className="w-full mb-[20px] lg:mt-[125px] rounded-md">
      <div className="flex flex-col rounded-xl md:flex-row w-full h-auto md:h-14 p-1.5 gap-1 bg-neutral-50 border border-solid border-[#e9e9eb]">
        {tabItems.map((tab) => (
          <Link
            key={tab.id}
            to={tab.path}
            reloadDocument
            className={`w-full md:flex-1 h-11 rounded-md [direction:rtl] font-bold text-base leading-6 flex items-center justify-center ${
              activeTab === tab.id
                ? "bg-[#68c35c] text-white shadow-shadows-shadow-sm"
                : "bg-transparent text-[#717680] hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTabs;
