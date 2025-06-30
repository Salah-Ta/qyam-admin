import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import vector15 from "../../../assets/icons/Vector15.svg";
import vector21 from "../../../assets/icons/Vector21.svg";
import vector17 from "../../../assets/icons/Vector17.svg";
import vector20 from "../../../assets/icons/Vector20.svg";
import stepiconbase from "../../../assets/icons/sttep-icon-base.svg";
import connector from "../../../assets/icons/Connector-wrap.svg";

// import backgrounmaskSection71 from "../../../assets/images/new-design/_Background.png";
// import backgrounmaskSection72 from "../../../assets/images/new-design/_Backgroudmasksection72.png";


function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Badge({
  className,
  variant = "default",
  children,
  ...props
}: {
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "border-transparent bg-primary text-primary-foreground ",
        variant === "secondary" &&
          "border-transparent bg-secondary text-secondary-foreground ",
        variant === "destructive" &&
          "border-transparent bg-destructive text-destructive-foreground ",
        variant === "outline" && "text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}




interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio: number;
  children: React.ReactNode;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        style={{ paddingBottom: `${100 / ratio}%` }}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }
);
AspectRatio.displayName = "AspectRatio";

export const HomeSectionSeven = (): JSX.Element => {
  // Program steps data
  const steps = [
    {
      id: 1,
      title: "الإعداد والتجهيز",
      isActive: true,
      isCompleted: true,
    },
    {
      id: 2,
      title: "الإعلان والتسجيل",
      isActive: true,
      isCompleted: false,
    },
    {
      id: 3,
      title: "الفرز والاعتماد",
      isActive: false,
      isCompleted: false,
    },
    {
      id: 4,
      title: "التدريب والتمكين",
      isActive: false,
      isCompleted: false,
    },
  ];

  const secondarySteps = [
    {
      id: 5,
      title: "تدريب الطالبات",
      isActive: false,
      isCompleted: false,
    },
    {
      id: 6,
      title: "إعداد التقارير",
      isActive: false,
      isCompleted: false,
    },
    {
      id: 7,
      title: "الاحتفال بالنجاح",
      isActive: false,
      isCompleted: false,
    },
  ];

  // Step indicator component
  const StepIndicator = ({
    isActive,
    isCompleted,
  }: {
    isActive: boolean;
    isCompleted: boolean;
  }) => {
    if (isCompleted) {
      return (
        <div className="relative w-10 h-10">
          <img className="w-10 h-10" alt="Step icon base" src={stepiconbase} />
        </div>
      );
    }

    return (
      <div className="relative w-10 h-10 bg-neutral-50 rounded-full overflow-hidden">
        <div className="h-10 rounded-[20px] border-2 border-solid border-[#e9e9eb]">
          <div className="relative w-3 h-3 top-[12.4px] left-[12.4px] bg-[#d5d6d9] rounded-md" />
        </div>
      </div>
    );
  };

  return (
<div className="relative w-full   mx-auto mt-[110px] mb-[235.5px] [background:radial-gradient(10%_80%_at_0%_50%,rgba(104,195,92,0.8)_0%,rgba(104,195,92,0)_60%),radial-gradient(10%_80%_at_100%_50%,rgba(104,195,92,0.8)_0%,rgba(255,255,255,0.5)_70%)]">
  <div className="flex flex-col w-full items-center gap-8 px-8 py-0">
    <div className="flex flex-col items-center gap-12 relative w-full max-w-screen-xl">
      <div className="flex flex-col w-full max-w-screen-md items-center gap-5">
        <div className="flex flex-col items-center gap-3 w-full">
          <Badge
            variant="outline"
            className="bg-[#fafafa] border-[#e9e9eb] rounded-md px-2.5 py-1"
          >
            <span className="font-medium text-[#414651] text-sm text-center leading-5 whitespace-nowrap [direction:rtl]">
              مراحل التنفيذ{" "}
            </span>
          </Badge>

          <h1 className="md:font-semibold font-[700] text-[#006173] text-[36px] text-center tracking-[-0.02px] leading-[44px] [direction:rtl]">
            خط سير البرنامج{" "}
          </h1>
        </div>
      </div>
    </div>
  </div>

  <div className="relative h-[434px] w-full max-w-[1218px] mx-auto">
    {/* Main steps flow */}
    <div className="absolute w-[264px] h-11 top-[186px] left-[752px] lg:block hidden">
      <div className="flex w-[188px] h-11 items-center justify-normal gap-4 absolute top-0 left-[76px]">
        <div className="flex flex-col h-9 items-center gap-0.5 pt-1.5 pb-8 px-0 relative flex-1 grow">
          <div className="self-stretch mt-[-1.00px] mb-[-25.00px] font-bold text-[#414651] text-base  leading-6 relative tracking-[0] [direction:rtl]">
            الإعداد والتجهيز
          </div>
        </div>

        <div className="inline-flex flex-col items-center gap-1 pt-0 pb-1 px-0 relative self-stretch flex-[0_0_auto]">
          <img
            className="relative w-10 h-10"
            alt="Step icon base"
            src={connector}
          />
        </div>
      </div>

      <img
        className="absolute w-[86px] h-[7px] top-[21px] left-0 object-cover"
        alt="Vector"
        src={vector15}
      />
    </div>

    <div className="absolute w-[266px] h-11 top-[186px] left-[468px] lg:block hidden">
      <div className="flex w-[188px] h-11 top-0 left-[78px] items-center justify-end gap-4 absolute">
        <div className="inline-flex h-[26px] flex-[0_0_auto] flex-col items-start gap-0.5 relative">
          <div className="self-stretch mt-[-1.00px] font-bold text-[#006173] text-base leading-6 relative tracking-[0] [direction:rtl]">
            الإعلان والتسجيل
          </div>
        </div>

        <div className="inline-flex flex-col items-center gap-1 pt-0 pb-1 px-0 relative flex-[0_0_auto]">
          <StepIndicator isActive={true} isCompleted={false} />
        </div>
      </div>

      <img
        className="absolute w-[86px] h-[7px] top-[21px] left-0 object-cover"
        alt="Vector"
        src={vector15}
      />
    </div>

    <div className="absolute w-[232px] h-[153px] top-[186px] left-[220px] lg:block hidden">
      <div className="absolute w-[232px] h-[135px] top-0 left-0">
        <div className="inline-flex top-0 left-11 items-center justify-end gap-4 absolute">
          <div className="flex w-[132px] h-10 pt-1.5 pb-8 px-0 flex-col items-start gap-0.5 relative">
            <div className="self-stretch mt-[-1.00px] mb-[-21.00px] font-bold text-[#414651] text-base leading-6 relative tracking-[0] [direction:rtl]">
              الفرز والاعتماد
            </div>
          </div>

          <div className="inline-flex flex-col items-center gap-1 pt-0 pb-1 px-0 relative flex-[0_0_auto]">
            <StepIndicator isActive={false} isCompleted={false} />
          </div>
        </div>

        <img
          className="absolute w-11 h-[110px] top-6 left-0"
          alt="Vector"
          src={vector20}
        />
      </div>

      <div className="flex w-[171px] h-11 top-[109px] left-[60px] items-center justify-end gap-4 absolute">
        <div className="flex h-[26px] flex-1 grow flex-col items-start gap-0.5 relative">
          <div className="self-stretch mt-[-1.00px] font-bold text-[#414651] text-base leading-6 relative tracking-[0] [direction:rtl]">
            التدريب والتمكين
          </div>
        </div>

        <div className="inline-flex flex-col items-center gap-1 pt-0 pb-1 px-0 relative self-stretch flex-[0_0_auto]">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>
    </div>

    {/* Mobile version with buttons */}
    <div className="lg:hidden flex flex-col gap-6 p-4">
      {/* Step 1 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          الإعداد والتجهيز
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            className="w-full h-full"
            alt="Step icon base"
            src={stepiconbase}
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#006173] text-base">
          الإعلان والتسجيل
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={true} isCompleted={false} />
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          الفرز والاعتماد
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      {/* Step 4 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          التدريب والتمكين
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      {/* Step 5 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          تدريب الطالبات
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      {/* Step 6 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          إعداد التقارير
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      {/* Step 7 */}
      <div className="flex flex-row-reverse items-center gap-4">
        <button className="flex-1 text-right font-bold text-[#414651] text-base">
          الاحتفال بالنجاح
        </button>
        <div className="w-10 h-10 flex items-center justify-center">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>
    </div>

    {/* Secondary steps - Desktop only */}
    <div className="hidden lg:block">
      <div className="flex w-[165px] h-11 top-[295px] left-[852px] items-center justify-end gap-4 absolute">
        <div className="flex h-9 justify-center flex-1 grow flex-col items-start gap-0.5 relative">
          <div className="self-stretch font-bold text-[#414651] text-base leading-6 relative tracking-[0] [direction:rtl]">
            تدريب الطالبات
          </div>
        </div>

        <div className="inline-flex flex-col items-center gap-1 pt-0 pb-1 px-0 relative self-stretch flex-[0_0_auto]">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      <div className="absolute w-[266px] h-10 top-[297px] left-[468px]">
        <div className="flex w-[188px] h-10 top-0 left-[78px] items-center justify-end gap-4 absolute">
          <div className="flex h-10 pt-1.5 pb-8 px-0 flex-1 grow flex-col items-start gap-0.5 relative">
            <div className="self-stretch mt-[-1.00px] mb-[-21.00px] font-bold text-[#414651] text-base leading-6 relative tracking-[0] [direction:rtl]">
              إعداد التقارير
            </div>
          </div>

          <div className="inline-flex flex-col items-center gap-1 pt-0 px-0 relative self-stretch flex-[0_0_auto]">
            <StepIndicator isActive={false} isCompleted={false} />
          </div>
        </div>

        <img
          className="absolute w-[86px] h-[7px] top-4 left-0 object-cover"
          alt="Vector"
          src={vector17}
        />
      </div>

      <div className="flex w-[188px] h-10 top-[394px] left-[544px] items-center justify-end gap-4 absolute">
        <div className="flex h-[26px] justify-center flex-1 grow flex-col items-start gap-0.5 relative">
          <div className="self-stretch font-bold text-[#414651] text-base leading-6 relative tracking-[0] [direction:rtl]">
            الاحتفال بالنجاح
          </div>
        </div>

        <div className="inline-flex flex-col items-center gap-1 pt-0 px-0 relative self-stretch flex-[0_0_auto]">
          <StepIndicator isActive={false} isCompleted={false} />
        </div>
      </div>

      {/* Connecting lines */}
      <img
        className="absolute w-[247px] h-[72px] top-[349px] left-[750px]"
        alt="Vector"
        src={vector21}
      />

      <img
        className="absolute w-[86px] h-[7px] top-[313px] left-[753px] object-cover"
        alt="Vector"
        src={vector17}
      />
    </div>
  </div>
</div>
  );
};
