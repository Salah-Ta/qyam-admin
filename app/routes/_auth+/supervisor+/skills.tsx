import React from "react";
import { PlusIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import column1 from "../../../assets/images/new-design/column-1.svg";
import { SupervisorPageLayout } from "~/components/supervisor/SupervisorPageLayout";
import { LoaderFunctionArgs, data } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import skillDb from "../../../db/skill/skill.server";
import testimonialDb from "../../../db/testimonial/testimonial.server";
import userDB from "~/db/user/user.server";
import ClientWordCloud from "../../../components/ClientWordCloud";
import WordCloudErrorBoundary from "../../../components/WordCloudErrorBoundary";
import SmoothColumnTestimonials from "../../../components/SmoothColumnTestimonials";
import { getAuthenticated } from "~/lib/get-authenticated.server";

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

  const currentUser = (loaderData as any)?.currentUser;

  return (
    <SupervisorPageLayout
      currentUser={currentUser}
      title="إحصاءات البرنامج"
      subtitle="المهارات الأكثر تعليما وانطباعات الطالبات"
    >

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
    </SupervisorPageLayout>
  );
};

export default Skills;
