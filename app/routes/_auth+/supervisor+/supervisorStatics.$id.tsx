import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('SupervisorStatistics Error Boundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-[#f9f9f9] min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في عرض الصفحة</h2>
              <p className="text-gray-600 mb-6">حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                إعادة تحميل
              </button>
              <button 
                onClick={() => window.location.href = "/dashboard/admin/users"}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                العودة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
import content from "../../../assets/images/new-design/supervisor-profile.png";
import verified from "../../../assets/icons/Verified-tick.svg";
import students from "../../../assets/icons/students.svg";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useParams } from "@remix-run/react";
import { QUser } from "~/types/types";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { cn } from "~/lib/utils";
import { useNavigate } from "@remix-run/react";
import { PlusIcon, ArrowLeftIcon } from "lucide-react";

// Client-only wrapper component to prevent hydration issues
const ClientOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return fallback as React.ReactElement;
  }
  
  return children as React.ReactElement;
};

// Ensure Chart.js is properly initialized on client side
if (typeof window !== 'undefined') {
  // Register Chart.js components
  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
}

// Chart.js registration moved to imports section to prevent SSR issues

// Add loader function to get the user data and statistics based on ID
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const userId = params?.id;
  
  if (!userId) {
    throw new Response("User ID is required", { status: 400 });
  }
  
  try {
    // Import database functions with safe fallback
    const userDB = (await import("~/db/user/user.server")).default;
    const reportDB = (await import("~/db/report/report.server")).default;
    
    // Get user data with timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 10000)
    );
    
    const userPromise = userDB.getUser(userId, context?.cloudflare?.env?.DATABASE_URL);
    const userResult = await Promise.race([userPromise, timeoutPromise]) as any;
    
    if (!userResult || userResult.status === "error" || !userResult.data) {
      throw new Response("User not found", { status: 404 });
    }
    
    // Get user statistics using the new getUserTotalStats function
    let userReports = [];
    let finalStatistics = {
      reportCount: 0,
      volunteerHours: 0,
      economicValue: 0,
      volunteerOpportunities: 0,
      activitiesCount: 0,
      volunteerCount: 0,
      skillsEconomicValue: 0,
      skillsTrainedCount: 0
    };
    
    try {
      // Get user statistics from the new getUserTotalStats function
      if (reportDB && typeof reportDB.getUserTotalStats === 'function') {
        console.log('Fetching user statistics for userId:', userId);
        const statsPromise = reportDB.getUserTotalStats(userId, context?.cloudflare?.env?.DATABASE_URL);
        const statsResult = await Promise.race([statsPromise, timeoutPromise]) as any;
        
        console.log('User stats result:', statsResult);
        
        if (statsResult?.success && statsResult.data) {
          finalStatistics = {
            reportCount: statsResult.data.reportCount || 0,
            volunteerHours: statsResult.data.volunteerHours || 0,
            economicValue: statsResult.data.economicValue || 0,
            volunteerOpportunities: statsResult.data.volunteerOpportunities || 0,
            activitiesCount: statsResult.data.activitiesCount || 0,
            volunteerCount: statsResult.data.volunteerCount || 0,
            skillsEconomicValue: statsResult.data.skillsEconomicValue || 0,
            skillsTrainedCount: statsResult.data.skillsTrainedCount || 0
          };
        }
      }
      
      // Also get user reports for additional context if needed
      if (reportDB && typeof reportDB.getAllReports === 'function') {
        const reportsPromise = reportDB.getAllReports(context?.cloudflare?.env?.DATABASE_URL);
        const reportsResult = await Promise.race([reportsPromise, timeoutPromise]) as any;
        
        if (reportsResult?.success && Array.isArray(reportsResult.data)) {
          userReports = reportsResult.data.filter((report: any) => report?.userId === userId);
          console.log('User reports:', userReports.length, 'reports found');
        }
      }
    } catch (error) {
      console.error("Error fetching user statistics and reports:", error);
      // Continue with default statistics and empty reports array
    }
    
    return Response.json({
      user: userResult.data,
      statistics: finalStatistics,
      reports: userReports
    });
  } catch (error) {
    console.error("Error loading user data:", error);
    
    // Return a safe fallback instead of throwing
    return Response.json({
      user: null,
      statistics: {
        reportCount: 0,
        volunteerHours: 0,
        economicValue: 0,
        volunteerOpportunities: 0,
        activitiesCount: 0,
        volunteerCount: 0,
        skillsEconomicValue: 0,
        skillsTrainedCount: 0
      },
      reports: [],
      error: "Failed to load user data"
    }, { status: 200 }); // Return 200 with error info instead of 500
  }
}

// Card components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Toggle Group components
const ToggleGroupContext = React.createContext<{
  size: "default" | "sm" | "lg" | undefined;
}>({
  size: "default",
});

// Component interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "icon";
  asChild?: boolean;
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  fallback?: string;
}

// Components
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? "slot" : "button";
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90":
              variant === "default",
            "bg-transparent hover:bg-accent hover:text-accent-foreground":
              variant === "ghost",
            "border border-input hover:bg-accent hover:text-accent-foreground":
              variant === "outline",
            "h-10 px-4 py-2": size === "default",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

export const SupervisorStatistics = (): JSX.Element => {
  // Track hydration state to prevent SSR/client mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Safe hooks usage with error handling
  let loaderData: any = {};
  let params: any = {};
  let navigate: any = () => {};
  
  try {
    loaderData = useLoaderData<typeof loader>() as any;
    params = useParams();
    navigate = useNavigate();
  } catch (error) {
    console.error('Hook usage failed:', error);
    // Fallback to prevent hydration errors
  }
  
  // Set hydrated state after component mounts (client-side only)
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const userData = loaderData?.user as QUser || null;
  const statistics = loaderData?.statistics || {
    reportCount: 0,
    volunteerHours: 0,
    economicValue: 0,
    volunteerOpportunities: 0,
    activitiesCount: 0,
    volunteerCount: 0,
    skillsEconomicValue: 0,
    skillsTrainedCount: 0
  };
  const reports = Array.isArray(loaderData?.reports) ? loaderData.reports : [];
  const userId = params?.id;
  
  // Debug logging to verify getUserTotalStats integration
  console.log('SupervisorStatistics - Loaded data:', {
    userId,
    userName: userData?.name,
    hasStatistics: !!statistics,
    statisticsData: statistics,
    reportsCount: reports.length,
    timestamp: new Date().toISOString()
  });
  
  // Handle error state
  if (loaderData?.error && !userData) {
    return (
      <div className="bg-[#f9f9f9] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 mb-6">لم نتمكن من تحميل بيانات المستخدم. يرجى المحاولة مرة أخرى.</p>
            <button 
              onClick={() => {
                try {
                  navigate("/dashboard/admin/users");
                } catch (e) {
                  // Fallback navigation
                  window.location.href = "/dashboard/admin/users";
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة إلى قائمة المستخدمين
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, image, fallback, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
          )}
          {...props}
        >
          {image ? (
            <img
              src={image}
              alt="Avatar"
              className="aspect-square h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-[#717680]">
              {fallback}
            </div>
          )}
        </div>
      );
    }
  );

  // Data for metric cards using real statistics from getUserTotalStats
  const metricCards = [
    {
      label: "مهارة",
      value: (statistics?.skillsTrainedCount || 0).toString(),
      unit: "",
      description: "المهارات المدرب عليها",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.skillsTrainedCount || 0) * 5)), // Scale for visualization
    },
    {
      label: "ساعة",
      value: Math.round(statistics?.volunteerHours || 0).toString(),
      unit: "",
      description: "الساعات التطوعية",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.volunteerHours || 0) / 5)), // Scale hours for visualization
    },
    {
      label: "نشاط",
      value: (statistics?.activitiesCount || 0).toString(),
      unit: "",
      description: "الأنشطة المنفذة",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.activitiesCount || 0) * 10)), // Scale activities for visualization
    },
    {
      label: "قيمة",
      value: Math.round(statistics?.skillsEconomicValue || 0).toString(),
      unit: "ريال",
      description: "القيمة الاقتصادية للمهارات",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.skillsEconomicValue || 0) / 100)), // Scale economic value
    },
    {
      label: "فرصة",
      value: (statistics?.volunteerOpportunities || 0).toString(),
      unit: "",
      description: "الفرص التطوعية",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.volunteerOpportunities || 0) * 20)), // Scale opportunities
    },
    {
      label: "قيمة",
      value: Math.round(statistics?.economicValue || 0).toString(),
      unit: "ريال",
      description: "القيمة الاقتصادية من التطوع",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.economicValue || 0) / 100)), // Scale economic value
    },
    {
      label: "متطوع",
      value: (statistics?.volunteerCount || 0).toString(),
      unit: "",
      description: "عدد المتطوعين",
      color: "#68C35C",
      percentage: Math.min(100, Math.max(5, (statistics?.volunteerCount || 0) * 5)), // Scale volunteer count
    },
  ];

  // Data for the regions chart - enhanced with real user data
  const userRegionValue = statistics ? Math.min(100, Math.max(10, 
    (statistics.activitiesCount || 0) * 8 + 
    (statistics.volunteerHours || 0) / 20 + 
    (statistics.reportCount || 0) * 5 +
    (statistics.skillsTrainedCount || 0) * 3
  )) : 40;
  
  const regions = [
    { 
      name: userData?.region || "المنطقة الحالية", 
      value: userRegionValue,
      isUserRegion: true
    },
    { name: "الرياض", value: 45, isUserRegion: false },
    { name: "جدة", value: 53, isUserRegion: false },
    { name: "الدمام", value: 25, isUserRegion: false },
    { name: "المدينة", value: 54, isUserRegion: false },
    { name: "مكة", value: 43, isUserRegion: false },
    { name: "القصيم", value: 12, isUserRegion: false },
    { name: "الشرقية", value: 50, isUserRegion: false },
  ];

  const createDoughnutData = (value: any, color: string) => ({
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, "#E9EAEB"],
        borderWidth: -2,
        cutout: "80%",
        circumference: -180, // 90 degrees arc (quarter circle)
        rotation: 270, // Start at 270 degrees (top-right corner)
        borderRadius: {
          innerStart: 20,
          outerStart: 0,
          innerEnd: 0,
          outerEnd: 20,
        },
      },
    ],
  });
  
  const createCircleChartData = (value: number) => ({
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: ["#004E5C", "#E9EAEB"],
        borderWidth: 0,
        cutout: "70%", // Makes it a doughnut chart
        circumference: 360, // Full circle
        rotation: -10, // Starts from top
      },
    ],
  });

  const circleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  
  const doughnutOptions = {
    cutout: "80%", // Slightly smaller cutout to make ring thinner and avoid overlap with text
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const barChartData = {
    labels: regions.map((region) => region.name),
    datasets: [
      {
        label: "Green Segment",
        data: regions.map((region) => region.value),
        backgroundColor: "#17b169",
        borderRadius: 16,
        borderSkipped: false,
        barThickness:
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42, // 24px on mobile, 42px on desktop
        barPercentage: 0.9,
        categoryPercentage: 0.8,
      },
      {
        label: "Gray Segment",
        data: regions.map((region) => Math.max(10, region.value - 15)),
        backgroundColor: "#E9EAEB",
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        barThickness:
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42, // 24px on mobile, 42px on desktop
        barPercentage: 0.9,
        categoryPercentage: 0.8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        stacked: true,
        ticks: {
          stepSize: 20,
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 768
                ? 10
                : 12,
            family: "'Inter', sans-serif",
          },
          color: "#535861",
        },
        grid: { color: "#E9EAEB", drawBorder: false },
        border: { display: false },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 768
                ? 10
                : 12,
            family: "'Ping AR + LT', Helvetica",
            weight: 700,
          },
          color: "#535861",
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        titleAlign: "right" as const,
        bodyAlign: "right" as const,
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `${context.parsed.y}%`;
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#f9f9f9]">
      {/* Return Arrow */}
      <div className="pt-6 pl-6">
        <button 
          onClick={() => {
            try {
              navigate("/dashboard/admin/users");
            } catch (e) {
              // Fallback navigation
              window.location.href = "/dashboard/admin/users";
            }
          }}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
          aria-label="العودة إلى قائمة المدربين"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className=" mx-auto  max-w-full lg:px-[112px]  max-lg:px-[10px]">
        {/* Container Section */}
        <div className="flex flex-col w-full items-end   -mt-[10px]">
          {/* User Profile Section */}
          <div className="flex flex-col items-end gap-6 relative self-stretch w-full">
            {/* Profile Picture with Verification Badge */}
            <div className="relative w-24 h-24 -mt-[48px]">
              {" "}
              {/* Adjusted to pull avatar up */}
              <div className="relative w-[104px] h-[104px]   -left-1">
                <Avatar
                  className="absolute w-[104px] h-[104px] rounded-full border-4 border-solid border-white shadow-shadows-shadow-lg overflow-hidden"
                  image={content}
                  fallback="NA"
                />
                <div className="w-24 h-24 rounded-full border border-solid border-[#00000014]" />
                <img
                  className="absolute w-6 h-6 top-[74px] left-[74px]"
                  alt="Verified tick"
                  src={verified}
                />
              </div>
            </div>

            {/* User Information */}
            <div className="flex flex-col items-end gap-0.5 relative self-stretch w-full">
              <div className="relative self-stretch mt-[-1.00px] font-bold text-[#181d27] text-xl tracking-[0] leading-[30px] [direction:rtl]">
                {userData?.name || "اسم المستخدم"}
                {/* Show report count if available */}
                {statistics?.reportCount > 0 && (
                  <span className="text-sm text-[#535861] font-normal"> - {statistics.reportCount} تقرير</span>
                )}
              </div>
              <div className="self-stretch text-[#535861] text-base leading-6 relative font-normal tracking-[0] [direction:rtl]">
                مدرسة {userData?.schoolId || "غير محددة"} - {userData?.region || "غير محددة"} - تعليم {userData?.eduAdminId || "غير محددة"}
              </div>
              {/* Statistics Summary */}
              {statistics && (statistics.reportCount > 0 || statistics.volunteerHours > 0) && (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-[#535861] [direction:rtl]">
                  {statistics.reportCount > 0 && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {statistics.reportCount} تقرير
                    </span>
                  )}
                  {statistics.volunteerHours > 0 && (
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                      {Math.round(statistics.volunteerHours)} ساعة تطوعية
                    </span>
                  )}
                  {statistics.skillsTrainedCount > 0 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                      {statistics.skillsTrainedCount} مهارة
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full p-4 bg-white rounded-xl border border-[#e4e7ec]   rotate-180 mt-8 ">
            <div className="flex items-start gap-4 p-0 mt-2">
              {/* Message Content */}
              <div className="flex flex-col items-start gap-3 relative flex-1 grow">
                {/* Message Text */}
                <div className="flex flex-col items-end gap-1 relative self-stretch w-full rotate-180">
                  <div className="flex items-center justify-end gap-2 relative self-stretch w-full">
                    <div className="relative w-fit mt-[-1.00px]   font-normal text-[#717680] text-sm tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                      منذ دقيقتين
                    </div>
                    <div className="relative w-fit mt-[-1.00px]   font-bold text-[#181d27] text-sm tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                      اسم المشرف
                    </div>
                  </div>
                  <textarea
                    className="self-stretch mt-[-1.00px] text-[#414651] text-sm leading-5 relative font-normal tracking-[0] [direction:rtl] bg-transparent border-none focus:outline-none resize-none"
                    defaultValue="نص الرسالة يكتب هنا"
                    rows={3}
                    onChange={(e) => {
                      // Handle input change here
                      console.log(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* New Message Button */}
            <div className="flex items-baseline justify-between">
              <Avatar className="w-10 h-10 rotate-180" fallback="OR" />
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white rounded-md rotate-180 shadow-shadows-shadow-xs-skeuomorphic"
              >
                <PlusIcon className="w-5 h-5 -rotate-180" />
                <span className="font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                  رسالة جديدة
                </span>
              </Button>
            </div>
          </div>

          {/* Separator */}
        </div>

        <div className="flex flex-col mx-auto mt-9 mb-[100px]">
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full mb-6 mt-[72px]">
            <div className="flex items-start gap-4 relative self-stretch w-full">
              <div className="flex flex-col items-end justify-center gap-0.5 relative flex-1 self-stretch">
                <h2 className="mt-[-1.00px] relative self-stretch font-bold text-[#181d27] text-lg tracking-[0] leading-7 [direction:rtl]">
                  التقارير
                </h2>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 mb-6 [direction:rtl]">
            {/* Left side - 7/12 width */}
            <div className="md:w-3/12  h-full flex items-center justify-center gap-[27px] relative self-stretch w-full flex-[0_0_auto]">
              <Card className="flex flex-col  h-fit items-center justify-center gap-6 p-6 relative flex-1 grow bg-white rounded-xl border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs">
                <img
                  className="relative w-[54px] h-[54px] mt-[54px] mb-[24px]"
                  alt="Students"
                  src={students}
                />
                <CardContent className="flex items-center justify-center gap-6 relative flex-1 grow p-0 mb-[54px]">
                  <div className="flex items-center justify-center gap-6 relative flex-1 grow">
                    <div className="flex-col items-end gap-6 flex-1 grow flex relative">
                      <div className="self-stretch mt-[-1.00px] font-bold text-base leading-6 relative text-[#181d27] tracking-[0] [direction:rtl]">
                        عدد الطالبات
                      </div>

                      <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                        <div className="flex items-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
                          <div className="relative flex-1 mt-[-1.00px] font-bold text-[#181d27] text-5xl tracking-[0] leading-[38px] [direction:rtl]">
                            {userData?.noStudents || 0}
                          </div>
                          {/* Show data freshness indicator */}
                          {statistics && statistics.reportCount > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1 [direction:rtl]">
                              محدث من {statistics.reportCount} تقرير
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-start gap-4 relative flex-[0_0_auto] mt-[-13.00px] mb-[-13.00px]">
                    <div className="relative w-[120px] h-[120px]">
                      <ClientOnly 
                        fallback={
                          <div className="w-[120px] h-[120px] bg-gray-100 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }
                      >
                        <Doughnut
                          data={createCircleChartData(
                            statistics ? Math.min(100, Math.max(5, (userData?.noStudents || 0) * 2)) : 25
                          )}
                          options={circleChartOptions}
                        />
                      </ClientOnly>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right side - 5/12 width */}
            <div className="w-full md:w-9/12">
              {/* Metrics Section */}
              <section className="flex items-start gap-9 relative self-stretch w-full">
                <div className="flex flex-col w-full items-start gap-6 relative">
                  <div className="w-full border border-solid border-[#e9eaeb] rounded-xl bg-white p-6">
                    <div className="flex flex-wrap items-center justify-center gap-[16px_42px]">
                      {metricCards.map((card, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center gap-3"
                        >
                          <div className="relative w-40 h-[88px]">
                            <div className="relative w-36 h-36">
                              <div className="absolute w-36 h-36">
                                <ClientOnly
                                  fallback={
                                    <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center">
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                  }
                                >
                                  <Doughnut
                                    data={createDoughnutData(
                                      card.percentage || 0,
                                      card.color
                                    )}
                                    options={doughnutOptions}
                                  />
                                </ClientOnly>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                  <div className="text-xs text-[#535861] mb-2 mt-8">
                                    {card.label}
                                  </div>
                                  <div className="text-2xl font-bold text-[#181d27]">
                                    {card.value}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`${
                              card.description ===
                                "القيمة الاقتصادية للمهارات" && index === 3
                                ? "w-[152px]"
                                : card.description ===
                                    "القيمة الاقتصادية للمهارات" && index === 6
                                ? "w-[126px]"
                                : card.description ===
                                  "الساعات التطوعية المحققة"
                                ? "w-40"
                                : "relative self-stretch"
                            } font-medium text-[#181d27] text-sm text-center tracking-[0] leading-[14.2px] m-3 [direction:rtl]`}
                          >
                            {card.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Regions Section */}
          <section className="flex flex-col gap-6 w-full mt-[36px]">
            <div className="flex flex-col gap-5 w-full">
              <div className="flex items-start gap-4 w-full h-full">

                <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                  <h2 className=" font-bold text-[#181d27] text-lg leading-7 [direction:rtl]">
                    المناطق
                  </h2>
                </div>
              </div>
            </div>

            <div className="border border-[#e9eaeb] rounded-xl bg-white p-6">
              <div className="h-[228px]">
                <ClientOnly
                  fallback={
                    <div className="h-[228px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm">جاري تحميل الرسم البياني...</p>
                      </div>
                    </div>
                  }
                >
                  <Bar data={barChartData} options={barChartOptions} />
                </ClientOnly>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default SupervisorStatistics;
