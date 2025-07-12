import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";

import { Button } from "./trainer+/assets/button";
import { NavFeaturedCard } from "./trainer+/NavFeatureCard";
import { Outlet, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { PlusCircleIcon } from "lucide-react";
import HorizontalTabs from "./admin+/horizontalTabs";
import { useState, useEffect } from "react";

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
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Track navigation state
  const isNavigating = navigation.state === "loading";

  // Show loading when navigating between admin routes
  useEffect(() => {
    if (isNavigating) {
      setIsLoading(true);
    } else {
      // Add a small delay to show loading even for fast transitions
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden">
      <HorizontalTabs />
      
      {/* Show loading overlay when navigating between admin routes */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[500px] bg-[#f9f9f9]">
          <div className="bg-white rounded-xl p-10 flex flex-col items-center gap-6 shadow-lg border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#17b169] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <p className="text-gray-800 text-lg font-semibold mb-2">جاري تحميل الصفحة</p>
              <p className="text-gray-600 text-sm">يرجى الانتظار قليلاً...</p>
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Trainer;
