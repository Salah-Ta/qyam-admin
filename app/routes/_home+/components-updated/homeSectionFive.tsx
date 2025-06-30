import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import backgroundpattern from "../../../assets/images/new-design/tracks.svg"
import Group30547 from "../../../assets/images/new-design/group-goals-heart.svg"
import Group from "../../../assets/images/new-design/group-goals.svg"

import content from "../../../assets/images/new-design/Content.png"
import ZapIcon from "../../../assets/icons/featured-icon.svg"
import MessageCircleIcon from "../../../assets/icons/message-chat-circle.svg"


interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground ",
        secondary: "border-transparent bg-secondary text-secondary-foreground ",
        destructive: "border-transparent bg-destructive text-destructive-foreground ",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Card Components
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-md border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
);
Card.displayName = "Card";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

// Main Component
export const HomeSectionFive = (): JSX.Element => {
  const volunteerPaths = [
    {
      id: 2,
      title: "ثانيا: مسار التعامل الإيجابي مع الخصائص النفسية",
      description:
        "يتضمن هذا المسار مجموعة من الأنشطة التي تمكن الفتاة من فهم ذاتها بشكل أعمق والتعرف على خصائصها النفسية والوعي بمرحلتها العمرية، والقيم التي يجب أن تستحضرها الفتاة وتعمل بها في ممارساتها وتعاملاتها",
      icon: ZapIcon,
    },
    {
      id: 1,
      title: "أولا: مسار المفاهيم الأساسية للعمل التطوعي",
      description:
        "يتضمن هذا المسار عددا من الأنشطة التي تحقق أهدافا متنوعة تعمل على تعزيز ثقافة العمل التطوعي لدى الفتاة، وتمكنها من ممارسة العمل التطوعي بوعي وإدراك.",
      icon: ZapIcon,
    },
    {
      id: 4,
      title: "رابعا: مسار اكتشاف وتطوير الميول المهنية",
      description:
        "يشتمل المسار مجموعة من الأنشطة التي تمكن الفتاة من استكشاف ميولها التعليمي والأكاديمي، سواء لإكمال مرحلتها الثانوية أو لتحديد تخصصها الأكاديمي أو العملي في حياتها بشكل عام.",
      icon: MessageCircleIcon,
    },
    {
      id: 3,
      title: "ثالثا: مسار الأدوار الاجتماعية",
      description:
        "يتضمن هذا المسار أنشطة متنوعة تحقق لدى الفتاة معرفة بأدوارها الاجتماعية المختلفة، ويمكنها من التفاعل مع الأفراد والمجموعات بوعي وإيجابية.",
      icon: ZapIcon,
    },
  ];

  return (
<div className="w-full  lg:mt-[109px]"
    style={{
      backgroundImage: `url(${content})`,
      backgroundSize: "contain",
      backgroundPosition: "right",
      backgroundRepeat: "no-repeat",
    }}
>
  <div className="w-full bg-cover">
    {/* Changed to flex-col on mobile and flex-row on desktop */}
    <div className="flex flex-col lg:flex-row   px-4 h-full">
      {/* Left side - hidden on mobile */}
      <div className="hidden lg:block relative w-full max-w-[567px] gap-[76px]">
        <img
          className="absolute w-[480px] left-[7px]"
          alt="Background pattern"
          src={backgroundpattern}
        />
        <img
          className="absolute w-[107px] h-[102px] top-[290px] left-[232px]"
          alt="Group"
          src={Group30547}
        />
                <img
          className="absolute w-[107px] h-[102px] top-[137px] left-[211px]"
          alt="Group"
          src={Group}
        />
      </div>

      {/* Right side - full width on mobile */}
      <div className="flex flex-col w-full items-center gap-[76px]">
        {/* Header section - centered on mobile */}
        <div className="w-full flex flex-col items-center md:items-start gap-8 px-4 md:px-8">
          <div className="w-full flex flex-col items-center gap-12">
            <div className="w-full max-w-screen-md flex flex-col items-center gap-5">
              <div className="w-full flex flex-col items-center gap-3">
                <Badge className="bg-[#fafafa] border-[#e9e9eb] px-2.5 py-1 rounded-lg">
                  <span className="font-medium text-[#414651] text-sm leading-5 whitespace-nowrap text-center tracking-[0] [direction:rtl]">
                    المسارات
                  </span>
                </Badge>
                <h1 className="font-display-md-semibold font-[700] text-[#006173] text-[36px] text-center tracking-[-0.72px] leading-[44px] [direction:rtl]">
                  مسارات الأنشطة والفرص التطوعية
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Cards container - flex column on mobile, flex row with wrap on desktop */}
        <div className="w-full flex flex-col items-center gap-16 px-4 md:px-8">
          {/* Desktop cards - flex row with wrap */}
          <div className="hidden md:flex flex-wrap justify-center gap-6 w-full">
            {volunteerPaths.map((path) => (
              <div key={path.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(50%-12px)]  pt-[27px]">
                <Card className="w-full h-full bg-neutral-50 rounded-2xl border-none flex flex-col">
                  <CardContent className="flex flex-col items-center gap-5 pt-0 pb-8 px-6 flex-1">
                    <div className="relative self-stretch w-full h-6">
                      <div className="absolute w-12 h-12 -top-6 left-1/2 -translate-x-1/2 bg-white rounded-[10px] overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic flex items-center justify-center">
                     
                         <img src={path.icon} alt="" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-full flex-1">
                      <h3 className="font-bold text-[#181d27] text-xl leading-[30px] text-center tracking-[0] [direction:rtl]">
                        {path.title}
                      </h3>
                      <p className="font-normal text-[#535861] text-base text-justify tracking-[0] leading-6 [direction:rtl] flex-1">
                        {path.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Mobile cards - flex column (unchanged) */}
          <div className="flex flex-col items-center gap-6 w-full max-w-[400px] md:hidden">
            {volunteerPaths.map((path) => (
              <div key={path.id} className="w-full h-full pt-[27px]">
                <Card className="w-full h-full bg-neutral-50 rounded-2xl border-none flex flex-col">
                  <CardContent className="flex flex-col items-center gap-5 pt-0 pb-8 px-6 flex-1">
                    <div className="relative self-stretch w-full h-6">
                      <div className="absolute w-12 h-12 -top-6 left-1/2 -translate-x-1/2 bg-white rounded-[10px] overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic flex items-center justify-center">
                        {path.icon}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-full flex-1">
                      <h3 className="font-bold text-[#181d27] text-xl leading-[30px] text-center tracking-[0] [direction:rtl]">
                        {path.title}
                      </h3>
                      <p className="font-normal text-[#535861] text-base text-justify tracking-[0] leading-6 [direction:rtl] flex-1">
                        {path.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};