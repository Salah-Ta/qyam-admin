import React from "react";
import { PlusIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import column1 from "../../../assets/images/new-design/column-1.svg";
import { useNavigate, useLocation } from "@remix-run/react";
import { LoaderFunctionArgs, data } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import skillDb from "../../../db/skill/skill.server";
import testimonialDb from "../../../db/testimonial/testimonial.server";
import userDB from "~/db/user/user.server";
import ClientWordCloud from "../../../components/ClientWordCloud";
import WordCloudErrorBoundary from "../../../components/WordCloudErrorBoundary";
import SmoothColumnTestimonials from "../../../components/SmoothColumnTestimonials";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import supervisorProfile from "../../../assets/icons/user.png";
import verifiedTick from "./assets/verified-tick.svg";

// Utility function
const cn = (...inputs: any[]) => {
  return twMerge(clsx(inputs));
};

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

// Loader function to fetch skills data
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const user = await getAuthenticated({ request, context });
    if (!user) {
      return data({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUrl = context.cloudflare.env.DATABASE_URL;

    // Fetch current user data
    let currentUserData = null;
    try {
      const fullUserResult = await userDB.getUser((user as any).id, dbUrl) as any;
      if (fullUserResult?.status === "success" && fullUserResult.data) {
        currentUserData = Array.isArray(fullUserResult.data) ? fullUserResult.data[0] : fullUserResult.data;
      }
    } catch (error) {}

    // Fetch skills with usage counts and testimonials in parallel
    const [skillsResult, testimonialsResult] = await Promise.all([
      skillDb.getSkillsWithUsageCount(dbUrl),
      testimonialDb.getAllTestimonials(dbUrl)
    ]);

    if (!skillsResult.success) {
      return data(
        { error: "Failed to fetch skills" },
        { status: 500 }
      );
    }

    return {
      skills: skillsResult.data || [],
      testimonials: testimonialsResult.success ? testimonialsResult.data || [] : [],
      currentUser: currentUserData,
    };
  } catch (error) {
    return data({ error: "Internal server error" }, { status: 500 });
  }
}

// Main Supervisor Component
export const Skills = (): JSX.Element => {
  const loaderData = useLoaderData<{
    skills: Array<{
      id: string;
      name: string;
      description: string | null;
      usageCount: number;
      createdAt: string;
      updatedAt: string;
    }>;
    testimonials: Array<{
      id: string;
      name: string;
      comment: string;
      rating: number;
      createdAt: string;
      updatedAt: string;
    }>;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  // Active state detection
  const isSkillsActive = 
    location.pathname === "/supervisor/skills" ||
    location.pathname === "/supervisor/skills/";

  const isTrainersActive = location.pathname.includes("/allTrainers");
  const isLeaderboardActive = location.pathname === "/supervisor/leaderboard";

  // Transform skills data for the word cloud
  const skills = loaderData?.skills || [];
  const wordCloudData = skills.map((skill) => ({
    text: skill.name,
    value: skill.usageCount || 1, // Ensure minimum value of 1
  }));

  // Add some sample data if no skills exist (for testing)
  const sampleData = [
    { text: "البرمجة", value: 15 },
    { text: "التصميم", value: 12 },
    { text: "التسويق", value: 10 },
    { text: "الإدارة", value: 8 },
    { text: "التحليل", value: 6 },
    { text: "الكتابة", value: 5 },
    { text: "التعليم", value: 4 },
    { text: "التطوير", value: 3 },
  ];

  const finalWordCloudData =
    wordCloudData.length > 0 ? wordCloudData : sampleData;

  // Navigation menu items data
  const menuItems = [
    { text: "تواصل معنا", hasDropdown: true },
    { text: "مركز المعرفة", hasDropdown: true },
    { text: "المسارات", hasDropdown: true },
    { text: "أهداف البرنامج", hasDropdown: true },
    { text: "يانعة", hasDropdown: true },
    { text: "الرئيسة", hasDropdown: false },
  ];

  // Navigation links data for footer
  const navigationLinks = [
    "حول البرنامج",
    "شروط التسجيل",
    "مستويات البرنامج",
    "تواصل معنا",
    "الخصوصية",
  ];

  // Tab items data
  const tabItems = [
    {
      id: "program-statistics",
      label: "إحصاءات البرنامج",
      path: "/supervisor/skills",
      active: isSkillsActive,
      hasIndicator: isSkillsActive,
    },
    {
      id: "trainers-data",
      label: "بيانات المدربين",
      path: "/supervisor/allTrainers",
      active: isTrainersActive,
      hasIndicator: isTrainersActive,
    },
    {
      id: "leaderboard",
      label: "لوحة المتصدرين",
      path: "/supervisor/leaderboard",
      active: isLeaderboardActive,
      hasIndicator: isLeaderboardActive,
    },
  ];

  const currentUser = (loaderData as any)?.currentUser;

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
                إحصاءات البرنامج
              </h1>
              <p className="text-lg font-normal text-[#535862]">
                المهارات الأكثر تعليما وانطباعات الطالبات
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-col gap-4 relative self-stretch w-full [direction:rtl] mb-6">
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

          {/* Skills Cloud Section */}
          <section className="w-full mt-8">
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex flex-col items-center gap-5 max-w-screen-md w-full">
                <h2 className="font-display-md-semibold text-[#181d27] text-[36px] text-center tracking-[-0.72px] leading-[44px] font-bold rtl">
                  سحابة المهارات
                </h2>
                <p className="font-normal text-[#535861] text-xl text-center leading-[30px] rtl">
                  المهارات الأكثر تعليما للمتدربات
                </p>
              </div>

              <div className="relative w-full h-[600px] flex justify-center items-center">
                {finalWordCloudData.length > 0 ? (
                  <WordCloudErrorBoundary>
                    <ClientWordCloud
                      words={finalWordCloudData}
                      width={900}
                      height={600}
                    />
                  </WordCloudErrorBoundary>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-xl">لا توجد مهارات متاحة</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="flex flex-col w-full items-center mt-24">
            <div className="flex flex-col items-center gap-8 px-8 w-full max-w-screen-xl pb-12">
              <div className="flex flex-col max-w-screen-md items-center gap-5 w-full">
                <h2 className="w-full font-display-md-semibold text-[#181d27] text-[36px] text-center tracking-[-0.72px] leading-[44px] [direction:rtl]">
                  انطباع الطالبات
                </h2>
                <p className="w-full font-normal text-[#535861] text-xl text-center tracking-[0] leading-[30px] [direction:rtl]">
                  آراء المتدربات اللاتي شاركن في الدورة التدريبة
                </p>
              </div>
            </div>
            <SmoothColumnTestimonials testimonials={loaderData?.testimonials || []} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Skills;
