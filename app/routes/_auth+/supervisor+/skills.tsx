import React from "react";
import { PlusIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import content from "../supervisor+/assets/content.png";
import verified from "../supervisor+/assets/verified-tick.svg";
import column1 from "../supervisor+/assets/column-1.svg";
import Skillscloudbackground from "../supervisor+/assets/layer-1.svg";
import Skillscloudvisualization from "../supervisor+/assets/isolation-mode.svg";
import rectangle22099 from "../supervisor+/assets/rectangle-22099.svg";
import { useNavigate } from "@remix-run/react";

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

// Main Supervisor Component
export const Skills = (): JSX.Element => {
  // Navigation menu items data
  const menuItems = [
    { text: "تواصل معنا", hasDropdown: true },
    { text: "مركز المعرفة", hasDropdown: true },
    { text: "المسارات", hasDropdown: true },
    { text: "أهداف البرنامج", hasDropdown: true },
    { text: "يانعة", hasDropdown: true },
    { text: "الرئيسة", hasDropdown: false },
  ];

  // Testimonial columns data
  const testimonialColumns = [
    { id: 1, imageSrc: "/column.svg", alt: "Column" },
    { id: 2, imageSrc: "/column-2.svg", alt: "Column" },
    { id: 3, imageSrc: "/column-1.svg", alt: "Column" },
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
      id: "skills",
      label: "المهارات",
      path: "/supervisor/skills",
      active: false,
      hasIndicator: true,
    },
    {
      id: "regions",
      label: "المناطق",
      path: "/supervisor/regionsStatistics",
      active: false,
    },
    {
      id: "statistics",
      label: "الإحصاءات",
      path: "/supervisor/programStatics",
      active: false,
    },
    {
      id: "trainer-statistics",
      label: "إحصاءات المدربة",
      path: "/supervisor/supervisorStatics",
      active: false,
    },
  ];
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div>
      <div className="w-11/12 m-auto">
        {/* Full-width rectangle with 40px height */}
        {/* <img alt="Rectangle" src={rectangle22099} /> */}

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

            {/* Tabs Navigation */}
            <div className="flex flex-col gap-4 relative self-stretch w-full [direction:rtl] ">
              <div className="w-full mt-7">
                <div className="flex flex-col md:flex-row">
                  {tabItems.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.path)}
                      className={`min-h-10 px-4 py-2   border border-[#D5D7DA] w-full md:w-auto ${
                        tab.active ? "bg-[#FAFAFA]" : "bg-white"
                      } [direction:rtl] ${!tab.active ? "z-[1]" : "z-[-5]"}
          ${index === 0 ? "md:rounded-r-lg rounded-t-lg md:rounded-l-none" : ""}
          ${
            index === tabItems.length - 1
              ? "md:rounded-l-lg rounded-b-lg md:rounded-r-none"
              : ""
          }
          ${
            index !== tabItems.length - 1
              ? "border-b-0 md:border-b md:border-r-0"
              : ""
          }`}
                    >
                      <div className="flex items-center justify-center md:justify-start flex-row-reverse">
                        {tab.hasIndicator && (
                          <div className="relative w-2.5 h-2.5 ml-2">
                            <div className="relative w-2 h-2 top-px -left-[5px] bg-[#17b169] rounded" />
                          </div>
                        )}
                        <span className="font-bold text-[#414651] text-sm text-center md:text-right tracking-[0] leading-5 whitespace-nowrap">
                          {tab.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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

          <div className="relative w-full h-[900px] flex justify-center">
            <img
              className="absolute w-[979px] h-[932px]"
              alt="Skills cloud background"
              // src="/isolation-mode.svg"
              src={Skillscloudvisualization}
            />
            <img
              className="absolute w-[830px] h-[774px] "
              alt="Skills cloud visualization"
              // src="/layer-1.svg"
              src={Skillscloudbackground}
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="flex flex-col w-full items-center mt-24  ">
        <div className="flex flex-col   items-start gap-8 px-8 w-full">
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col max-w-screen-md items-center gap-5 w-full">
              <h2 className="w-full font-display-md-semibold text-[#181d27] text-[36px] text-center tracking-[-0.72px] leading-[44px] [direction:rtl]">
                انطباع الطالبات
              </h2>
              <p className="w-full   font-normal text-[#535861] text-xl text-center tracking-[0] leading-[30px] [direction:rtl]">
                آراء المتدربات اللاتي شاركن في الدورة التدريبة
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col max-w-screen-xl items-start gap-8 px-8 w-full mb-5">
          <div className="flex flex-col items-center gap-10 w-full">
            <div className="flex flex-col md:flex-row md:flex-nowrap items-start gap-8 w-full">
              {testimonialColumns.map((column) => (
                <div key={column.id} className="flex-1">
                  <img
                    className="w-full h-auto"
                    alt={column.alt}
                    src={column1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Skills;
