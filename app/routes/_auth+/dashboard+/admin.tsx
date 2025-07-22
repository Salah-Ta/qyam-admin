import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";

import { Button } from "./trainer+/assets/button";
import { NavFeaturedCard } from "./trainer+/NavFeatureCard";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { PlusCircleIcon } from "lucide-react";
import HorizontalTabs from "./admin+/horizontalTabs";
import { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";

// Error Boundary for hydration errors
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في التحميل</h2>
              <p className="text-gray-600 mb-6">حدث خطأ أثناء تحميل لوحة التحكم</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [isLoading, setIsLoading] = useState(false);
  
  // Safe navigation and location hooks with error boundaries
  let navigation;
  let location;
  
  try {
    navigation = useNavigation();
    location = useLocation();
  } catch (error) {
    console.warn('Navigation hooks failed:', error);
    // Fallback values
    navigation = { state: 'idle', location: null };
    location = { pathname: '/dashboard/admin', search: '', hash: '', state: null, key: 'default' };
  }

  // Track navigation state with safe access
  const isNavigating = navigation?.state === "loading";

  // Show loading when navigating, but check if it's just query params
  useEffect(() => {
    if (isNavigating && navigation && location) {
      // If navigation.location exists, compare pathnames
      if (navigation.location) {
        // Only show loading if pathname is different (route change)
        if (navigation.location.pathname !== location.pathname) {
          setIsLoading(true);
        }
        // If pathname is same but search is different, it's just query params - no loading
      } else {
        // No navigation.location means initial load or page refresh
        setIsLoading(true);
      }
    } else {
      // Navigation completed
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNavigating, location.pathname, navigation.location]);

  return (
    <AdminErrorBoundary>
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
              <p className="text-gray-800 text-lg font-semibold mb-2">
                جاري تحميل الصفحة
              </p>
              <p className="text-gray-600 text-sm">يرجى الانتظار قليلاً...</p>
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
    </AdminErrorBoundary>
  );
};

export default Trainer;
