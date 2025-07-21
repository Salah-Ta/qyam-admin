import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import skillDb from "../../../../db/skill/skill.server";
import testimonialDb from "../../../../db/testimonial/testimonial.server";
// import ClientWordCloud from "../../../../../components/ClientWordCloud";
// import WordCloudErrorBoundary from "../../../../../components/WordCloudErrorBoundary";
import { WordCloud } from "@isoterik/react-word-cloud";
import SmoothColumnTestimonials from "../../../../components/SmoothColumnTestimonials";
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
    console.log("=== Loader Debug Info ===");
    console.log("Environment:", typeof context?.cloudflare?.env);
    console.log("Has DATABASE_URL:", !!context?.cloudflare?.env?.DATABASE_URL);

    // Check authentication
    // const user = await getAuthenticated({ request, context });
    // if (!user) {
    //   console.log("Authentication failed");
    //   return Response.json({ error: "Unauthorized" }, { status: 401 });
    // }
    // console.log("User authenticated:", !!user);

    const dbUrl = context.cloudflare.env.DATABASE_URL;
    console.log("DB URL exists:", !!dbUrl);

    // Fetch skills with usage counts first
    console.log("Fetching skills data...");
    let skillsResult;
    try {
      // skillsResult = await skillDb.getSkillsWithUsageCount(dbUrl);
      skillsResult = await skillDb.getAllSkills(dbUrl);

      console.log("Skills fetch completed:", skillsResult);
      console.log("Skills success:", skillsResult.success);
      console.log("Skills data length:", skillsResult.data?.length);
    } catch (skillsError) {
      console.error("Skills fetch error:", skillsError);
      console.error(
        "Skills error stack:",
        skillsError instanceof Error ? skillsError.stack : "No stack trace"
      );
      return Response.json(
        {
          error: "Failed to fetch skills",
          details:
            skillsError instanceof Error
              ? skillsError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Fetch testimonials separately
    console.log("Fetching testimonials data...");
    let testimonialsResult;
    try {
      testimonialsResult = await testimonialDb.getAllTestimonials(dbUrl);
      console.log("Testimonials fetch completed:", testimonialsResult);
      console.log("Testimonials success:", testimonialsResult.success);
      console.log("Testimonials data length:", testimonialsResult.data?.length);
    } catch (testimonialsError) {
      console.error("Testimonials fetch error:", testimonialsError);
      console.error(
        "Testimonials error stack:",
        testimonialsError instanceof Error
          ? testimonialsError.stack
          : "No stack trace"
      );
      // Don't fail the whole request if testimonials fail
      testimonialsResult = { success: false, data: [] };
    }

    // if (!skillsResult.success) {
    //   console.error("Skills fetch failed:", skillsResult);
    //   return Response.json(
    //     { error: "Failed to fetch skills" },
    //     { status: 500 }
    //   );
    // }

    const response = {
      skills: [],
      testimonials: testimonialsResult.success
        ? testimonialsResult.data || []
        : [],
    };

    console.log("Final response:", response);
    console.log("=== End Loader Debug Info ===");

    return Response.json(response);
  } catch (error) {
    console.error("Error in skills loader:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
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

  // Only use real data from database, no sample data fallback
  const finalWordCloudData = wordCloudData;

  // Debug logging for deployment issues
  console.log("=== WordCloud Debug Info ===");
  console.log("loaderData:", loaderData);
  console.log("loaderData.skills:", loaderData?.skills);
  console.log("loaderData.skills length:", loaderData?.skills?.length);
  console.log("wordCloudData:", wordCloudData);
  console.log("finalWordCloudData:", finalWordCloudData);
  console.log("Is array:", Array.isArray(finalWordCloudData));
  console.log(
    "Has length > 0:",
    finalWordCloudData && finalWordCloudData.length > 0
  );
  console.log("=== End Debug Info ===");

  // Word cloud configuration
  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
  ];

  const options = {
    colors: colors,
    enableTooltip: true,
    deterministic: false,
    fontFamily: "Arial, sans-serif",
    fontSizes: [18, 65] as [number, number],
    fontStyle: "normal",
    fontWeight: "normal",
    padding: 3,
    rotations: 3,
    rotationAngles: [-45, 45] as [number, number],
    scale: "sqrt" as const,
    spiral: "archimedean" as const,
    transitionDuration: 1000,
    tooltipOptions: {
      style: {
        backgroundColor: "#333",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
        direction: "rtl",
        textAlign: "right",
      },
    },
    getWordTooltip: (word: any) => `هذه المهارة ظهرت ${word.value} مرة`,
  };

  // Console log the words that will be displayed in the word cloud
  console.log("WordCloud Data:", finalWordCloudData);
  console.log(
    "Has database data:",
    finalWordCloudData && finalWordCloudData?.length > 0
  );
  console.log("Total words:", finalWordCloudData?.length || 0);

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
            {finalWordCloudData &&
            Array.isArray(finalWordCloudData) &&
            finalWordCloudData.length > 0 ? (
              <WordCloud
                words={finalWordCloudData}
                width={900}
                height={600}
                fill={(word, index) => colors[index % (colors?.length || 8)]}
                enableTooltip={true}
                font="Arial, sans-serif"
                fontWeight="normal"
                fontSize={(word) => {
                  const minSize = 18;
                  const maxSize = 65;
                  const maxValue = Math.max(
                    ...(finalWordCloudData?.map((w) => w.value) || [1])
                  );
                  const scale = Math.sqrt(word.value / maxValue);
                  return Math.max(
                    minSize,
                    Math.min(maxSize, minSize + (maxSize - minSize) * scale)
                  );
                }}
                rotate={(word, index) => {
                  const angles = [-45, 0, 45];
                  return angles[index % (angles?.length || 3)];
                }}
                padding={3}
                spiral="archimedean"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-[#1f77b4] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 text-xl">
                    جاري تحميل بيانات المهارات...
                  </p>
                </div>
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
        {loaderData?.testimonials &&
        Array.isArray(loaderData.testimonials) &&
        loaderData.testimonials.length > 0 ? (
          <SmoothColumnTestimonials testimonials={loaderData.testimonials} />
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 text-lg">لا توجد آراء متاحة حالياً</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Skills;
