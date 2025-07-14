import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import skillDb from "../../../../../db/skill/skill.server";
import testimonialDb from "../../../../../db/testimonial/testimonial.server";
import ClientWordCloud from "../../../../../components/ClientWordCloud";
import WordCloudErrorBoundary from "../../../../../components/WordCloudErrorBoundary";
import SmoothColumnTestimonials from "../../../../../components/SmoothColumnTestimonials";
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
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUrl = context.cloudflare.env.DATABASE_URL;

    // Fetch skills with usage counts and testimonials in parallel
    const [skillsResult, testimonialsResult] = await Promise.all([
      skillDb.getSkillsWithUsageCount(dbUrl),
      testimonialDb.getAllTestimonials(dbUrl),
    ]);

    if (!skillsResult.success) {
      return Response.json(
        { error: "Failed to fetch skills" },
        { status: 500 }
      );
    }

    return Response.json({
      skills: skillsResult.data || [],
      testimonials: testimonialsResult.success
        ? testimonialsResult.data || []
        : [],
    });
  } catch (error) {
    console.error("Error in skills loader:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
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
  const wordCloudData = loaderData?.skills?.map((skill) => ({
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

  return (
    <div>
      <div className="w-11/12 m-auto">
        {/* Container Section */}
        <div className="flex flex-col w-full items-end   -mt-[10px]">
          <div className="flex flex-col items-end gap-6 relative self-stretch w-full">
            {/* <div className="relative w-24 h-24 -mt-[48px]">
              {" "} 
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
            </div> */}

            {/* Rest of your existing code remains the same */}
            {/* User Information */}
            {/* <div className="flex flex-col items-end gap-0.5 relative self-stretch w-full">
              <div className="relative self-stretch mt-[-1.00px] font-bold text-[#181d27] text-xl tracking-[0] leading-[30px] [direction:rtl]">
                نورة علي الزهراني
              </div>
              <div className="self-stretch text-[#535861] text-base leading-6 relative font-normal tracking-[0] [direction:rtl]">
                مدرسة خالد بن الوليد رضي الله عنه - الرياض - تعليم الزلفي
              </div>
            </div> */}

            {/* Tabs Navigation - Removed since it's now handled by parent layout */}
          </div>

          {/* <div className="w-full p-4 bg-white rounded-xl border border-solid border-[#e4e7ec]   rotate-180 mt-8 ">
            <div className="flex items-start gap-4 p-0 mt-2">
         
              <div className="flex flex-col items-start gap-3 relative flex-1 grow">
           
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
              
                      console.log(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

   
            <div className="flex items-baseline justify-between">
              <Avatar className="w-10 h-10 rotate-180" fallback="OR" />
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white rounded-lg rotate-180 shadow-shadows-shadow-xs-skeuomorphic"
              >
                <PlusIcon className="w-5 h-5 -rotate-180" />
                <span className="font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                  رسالة جديدة
                </span>
              </Button>
            </div>
          </div> */}
        </div>
      </div>

      {/* Skills Cloud Section */}
      <section className="w-full  mt-[132px] ">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex flex-col items-center gap-5 max-w-screen-md w-full">
            <h2 className="font-display-md-semibold text-[#181d27] text-[36px] text-center tracking-[-0.72px] leading-[44px] font-bold rtl">
              سحابة المهارات
            </h2>
            <p className="  font-normal text-[#535861] text-xl text-center leading-[30px] rtl">
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
        <SmoothColumnTestimonials testimonials={loaderData.testimonials} />
      </section>
    </div>
  );
};

export default Skills;
