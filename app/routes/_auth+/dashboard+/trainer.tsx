import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";

import { Button } from "./trainer+/assets/button";
import { NavFeaturedCard } from "./trainer+/NavFeatureCard";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { PlusCircleIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { useState } from "react";
import React from "react";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progressData, setProgressData] = useState({
    reportsCompleted: false,
    reportsProgress: 0,
    opinionsCompleted: false,
    skillsCompleted: false
  });

  // Function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    // This will be communicated from the child component via context or props
    // For now, we'll implement a basic check using localStorage or context
    return localStorage.getItem('hasUnsavedReportChanges') === 'true';
  };

  // Function to update progress data from localStorage
  const updateProgressData = () => {
    const storedProgress = localStorage.getItem('trainerProgressData');
    if (storedProgress) {
      try {
        const parsed = JSON.parse(storedProgress);
        setProgressData(parsed);
      } catch (error) {
        console.error('Error parsing progress data:', error);
      }
    }
  };

  // Listen for storage changes to update progress
  React.useEffect(() => {
    updateProgressData();
    
    const handleStorageChange = () => {
      updateProgressData();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events from the profile component
    window.addEventListener('trainerProgressUpdate', updateProgressData);
    
    // Set up interval to check for updates (fallback)
    const interval = setInterval(updateProgressData, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('trainerProgressUpdate', updateProgressData);
      clearInterval(interval);
    };
  }, []);

  const handleNewReport = () => {
    if (hasUnsavedChanges()) {
      setIsDialogOpen(true);
    } else {
      resetAndNavigate();
    }
  };

  const resetAndNavigate = () => {
    // Clear any saved form data
    localStorage.removeItem('hasUnsavedReportChanges');
    localStorage.removeItem('trainerProgressData');
    // Trigger a reset event that the profile component can listen to
    window.dispatchEvent(new CustomEvent('resetTrainerProfile'));
    setIsDialogOpen(false);
    // Reset progress data
    setProgressData({
      reportsCompleted: false,
      reportsProgress: 0,
      opinionsCompleted: false,
      skillsCompleted: false
    });
  };

  // Data for sidebar menu items
  const menuItems = [
    {
      id: 0,
      title: "تقرير إنجازاتي",
      path: "/dashboard/trainer/trainerProfile",
    },
    { id: 1, title: "شهاداتي", path: "/dashboard/trainer/certificates" },
    {
      id: 2,
      title: "ركائز نجاح البرنامج",
      path: "/dashboard/trainer/successpillars",
    },
    {
      id: 3,
      title: "تقرير إنجازاتي",
      path: "/dashboard/trainer/myachievements",
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
                  className={`w-full h-[60px] justify-center items-center gap-2 px-[22px] py-4 rounded-lg border border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic ${
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
            <NavFeaturedCard 
              progressData={progressData}
            />
          )}
        </div>
        <div className="flex-1 w-full max-w-full max-md:w-full">
          <div className="mb-4 flex justify-start">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-[48px] items-center gap-1.5 px-[18px] py-3 rounded-md border border-[#D5D7DA]"
                  onClick={handleNewReport}
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span className="font-bold text-[#414651] text-base text-left whitespace-nowrap [direction:rtl]">
                    تقرير جديد
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] [direction:rtl] [&>button:last-child]:left-4 [&>button:last-child]:right-auto">
                <DialogHeader>
                  <DialogTitle className="text-right">تأكيد إنشاء تقرير جديد</DialogTitle>
                  <DialogDescription className="text-right">
                    يوجد تقدم محفوظ في التقرير الحالي. هل أنت متأكد من أنك تريد الغاء التقدم الحالي وبدء تقرير جديد؟
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 justify-start">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={resetAndNavigate}
                  >
                    نعم، إعادة تعيين
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Trainer;
