import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate, useLocation } from "@remix-run/react";

export const HorizontalTabs = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the active tab from the URL path with safe navigation
  const getActiveTabFromPath = () => {
    if (!location?.pathname) {
      return "programstatics"; // Default fallback
    }
    const pathParts = location.pathname.split("/");
    const adminIndex = pathParts.indexOf("admin");
    
    if (adminIndex !== -1 && adminIndex + 1 < pathParts.length) {
      const tabPart = pathParts[adminIndex + 1];
      
      // Handle parent-child relationships with safe navigation
      // If we're on a child route, return the parent tab
      if (tabPart === "programstatics" || (location?.pathname && location.pathname.includes("/programstatics"))) {
        return "programstatics";
      }
      
      return tabPart || "programstatics"; // Fallback if tabPart is falsy
    }
    
    return "programstatics"; // Default fallback
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  useEffect(() => {
    // Update activeTab when the URL changes with safe navigation
    if (location?.pathname) {
      setActiveTab(getActiveTabFromPath());
    }
  }, [location?.pathname]);

  const tabItems = [
    { id: "programstatics", label: "إحصاءات البرنامج" },
    { id: "controlpanel", label: "مركز المعرفة" },
    { id: "settings", label: "إعدادات النظام" },
    // { id: "admins", label: "المشرفين" },
    { id: "users", label: "الأعضاء" },
  ];

  return (
    <Tabs
      defaultValue={activeTab}
      className="w-full mb-[20px] lg:mt-[125px] rounded-md"
      onValueChange={setActiveTab}
    >
      <TabsList className="flex flex-col rounded-xl md:flex-row w-full h-auto md:h-14 p-1.5 gap-1 bg-neutral-50 border border-solid border-[#e9e9eb] ">
        {Array.isArray(tabItems) && tabItems.map((tab) => (
          <TabsTrigger
            key={tab?.id || 'default'}
            value={tab?.id || 'default'}
            onClick={() => {
              if (tab?.id) {
                setActiveTab(tab.id);
                navigate(`/dashboard/admin/${tab.id}`);
              }
            }}
            className={`w-full md:flex-1 h-11 rounded-md [direction:rtl] font-bold text-base leading-6 ${
              activeTab === tab?.id
                ? "bg-[#68c35c] text-white shadow-shadows-shadow-sm"
                : "bg-transparent text-[#717680]"
            }`}
          >
            {tab?.label || 'تبويب غير محدد'}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default HorizontalTabs;
