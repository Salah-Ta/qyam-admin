import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import aboutLogo from "../../../assets/images/new-design/aboutLogo.svg"
import footerleft from "../../../assets/images/new-design/footer-left.svg"
 
import backgroundImage2 from "../../../assets/images/new-design/aboutYanuea.png"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "border-transparent bg-primary text-primary-foreground  ",
        variant === "secondary" && "bg-secondary text-secondary-foreground  ",
        variant === "destructive" && "bg-destructive text-destructive-foreground  ",
        variant === "outline" && "text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}

export default function HomeSectionTwo(): JSX.Element {
  return (
    <section
      className="flex flex-col w-full  items-center gap-[38px] relative rounded-3xl bg-cover bg-center m-auto mt-[90px] lg:px-[80px]"
      // style={{ backgroundImage: "url(../frame-1261157952.png)" }}
     >
      <div className="flex flex-col  items-start gap-8 px-8 py-0 relative w-full " >
        <div className="flex flex-col items-center gap-12 relative self-stretch w-full">
          <div className="flex flex-col max-w-screen-md items-center gap-5 relative w-full">
            <div className="flex flex-col items-center gap-3 relative self-stretch w-full">
              <Badge
                 
                className="bg-[#fafafa] border-[#e9e9eb] px-2.5 py-1 rounded-md"
              >
                <span className=" font-medium text-[#414651] text-sm text-center tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                  عن البرنامج
                </span>
              </Badge>

              <h2 className="relative self-stretch font-display-md-semibold   text-[#181d27]  text-center   ">
                عن يانعة
              </h2>
            </div>
          </div>
        </div>
      </div>

      <Card
  className="h-[413px] w-full rounded-[48px] p-0 border-none overflow-hidden relative bg-[#004E5C] max-md:h-auto max-md:min-h-[400px]"
>
  {/* Background image */}
  <div className="absolute inset-0 z-0">
    <img
      className="w-full h-full object-cover opacity-30"
      src={backgroundImage2}
      alt="Background"
    />
  </div>

  <CardContent className="flex flex-col lg:flex-row items-center justify-center lg:gap-[135px] p-6 h-full relative z-10">
    {/* Left image - hidden on mobile */}
    <img
      className="w-[379.2px] h-[369.39px] z-10 max-lg:hidden"
      alt="Yaneah Logo"
      src={footerleft}
    />

    <div className="flex flex-col w-full lg:w-[702px] items-center lg:items-end gap-7 z-10">
      {/* Logo - centered on mobile, right-aligned on desktop */}
      <img
        className="w-[156.99px] h-[74.44px] lg:mr-0 max-lg:mx-auto"
        alt="Yaneah Brand"
        src={aboutLogo}
      />

      {/* Responsive text */}
      <p className="w-full lg:w-[806px] lg:ml-[-104px] font-medium text-white text-base lg:text-2xl text-justify tracking-[0] leading-normal lg:leading-[34px] [direction:rtl]">
        برنامج نوعي على مستوى المملكة موجه للفتيات، لتمكينهن من تحصيل
        الساعات التطوعية المحددة لهن كمتطلب تخرج من التعليم العام ،
        وتوجيههن لاستثمارهن فيما يعود عليهن بصقل شخصياتهن وخبراتهن،
        واكتساب المهارات الحياتية الأساسية التي تمكن الفتاة من الفاعلية
        والتأثير ومواجهة متطلبات الحياة ، وتعزيز القيم والسلوكيات
        الإيجابية لديهن، من خلال برامج تطوعية نوعية، وفريق إشراف تطوعي
        مؤهل في بيئات ملائمة تلبي متطلبات واحتياجات الفتاة في المرحلة
        الثانوية.
      </p>
    </div>
  </CardContent>
</Card>



    </section>
  );
}

