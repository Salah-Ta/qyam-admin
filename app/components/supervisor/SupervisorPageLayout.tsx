import React from "react";
import { Link, useLocation } from "@remix-run/react";
import supervisorProfile from "../../assets/icons/user.png";
import verifiedTick from "../../routes/_auth+/supervisor+/assets/verified-tick.svg";

interface SupervisorPageLayoutProps {
  currentUser?: {
    name?: string;
    image?: string;
    regionName?: string;
    region?: string;
  } | null;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const tabItems = [
  {
    id: "trainers-data",
    label: "بيانات المدربين",
    path: "/supervisor/allTrainers",
    matchFn: (pathname: string) => pathname.includes("/allTrainers"),
  },
  {
    id: "program-statistics",
    label: "إحصاءات البرنامج",
    path: "/supervisor/skills",
    matchFn: (pathname: string) =>
      pathname === "/supervisor/skills" || pathname === "/supervisor/skills/",
  },
  {
    id: "leaderboard",
    label: "لوحة المتصدرين",
    path: "/supervisor/leaderboard",
    matchFn: (pathname: string) => pathname === "/supervisor/leaderboard",
  },
];

export function SupervisorPageLayout({
  currentUser,
  title,
  subtitle,
  children,
}: SupervisorPageLayoutProps) {
  const location = useLocation();

  const tabs = tabItems.map((tab) => ({
    ...tab,
    active: tab.matchFn(location.pathname),
  }));

  return (
    <div className="w-full mx-auto py-6 pt-12 md:pt-24 pb-36 lg:px-[112px] bg-section min-h-screen">
      <div className="w-full rounded-2xl border border-gray-300 overflow-hidden rounded-xl bg-card text-card-foreground shadow">
        {/* Banner Gradient */}
        <div className="relative w-full h-24 bg-gradient-to-l from-[#17b169] to-[#0a5c3a] rounded-t-2xl" />

        <div className="flex flex-col w-full p-6">
          {/* Supervisor Profile Section */}
          <div className="flex flex-col items-end gap-4 relative self-stretch w-full [direction:rtl] mb-6">
            <div className="relative w-24 h-24 -mt-[72px]">
              <div className="absolute w-[96px] h-[96px] rounded-full border-4 border-solid border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={currentUser?.image || supervisorProfile}
                  alt="صورة المشرف"
                  className="w-full h-full object-cover"
                />
              </div>
              <img
                className="absolute w-6 h-6 top-[70px] right-[70px]"
                alt="Verified"
                src={verifiedTick}
              />
            </div>
            <div className="flex flex-col items-end gap-1 w-full">
              <h2 className="text-xl font-bold text-[#181d27]">
                {currentUser?.name || "المشرف"}
              </h2>
              <p className="text-sm text-[#535862]">
                {currentUser?.regionName || currentUser?.region || ""}
              </p>
            </div>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-baseline w-full mx-auto py-6 rounded-xl [direction:rtl]">
            <div className="flex flex-col items-start mb-6 pb-4 max-md:m-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {title}
              </h1>
              <p className="text-lg font-normal text-[#535862]">{subtitle}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-col gap-4 relative self-stretch w-full [direction:rtl] mb-6">
            <div className="w-full">
              <div className="flex flex-col md:flex-row">
                {tabs.map((tab, index) => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    reloadDocument
                    className={`min-h-10 px-4 py-2 border border-[#D5D7DA] w-full md:w-auto [direction:rtl] transition-colors ${
                      tab.active
                        ? "bg-white shadow-sm z-10 -mb-px"
                        : "bg-[#F8F9FA] hover:bg-white z-[1]"
                    }
        ${index === 0 ? "md:rounded-r-md rounded-t-md md:rounded-l-none" : ""}
        ${
          index === tabs.length - 1
            ? "md:rounded-l-md rounded-b-md md:rounded-r-none"
            : ""
        }
        ${index !== tabs.length - 1 ? "md:border-b" : ""}`}
                  >
                    <div className="flex items-center justify-center md:justify-start flex-row-reverse">
                      {tab.active && (
                        <div className="relative w-2.5 h-2.5 ml-2">
                          <div className="relative w-2 h-2 top-px -left-[5px] bg-[#17b169] rounded" />
                        </div>
                      )}
                      <span
                        className={`font-bold text-sm text-center md:text-right tracking-[0] leading-5 whitespace-nowrap ${
                          tab.active ? "text-[#17b169]" : "text-[#414651]"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
