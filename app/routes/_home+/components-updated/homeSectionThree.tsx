import { type ClassValue, clsx } from "clsx";

import React from "react";
import { twMerge } from "tailwind-merge";
import MessageCircleIcon from "../../../assets/icons/message-chat-circle.svg"
import ZapIcon from "../../../assets/icons/featured-icon.svg"
import UsersIcon from "../../../assets/icons/users-03.svg"
import StarIcon from "../../../assets/icons/message-chat-circle.svg"
import SmileIcon from "../../../assets/icons/message-smile-circle.svg"
import CommandIcon from "../../../assets/icons/command.svg"

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
        "border-transparent bg-primary text-primary-foreground ",
        variant === "secondary" &&
          "border-transparent bg-secondary text-secondary-foreground ",
        variant === "destructive" &&
          "border-transparent bg-destructive text-destructive-foreground ",
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

export const HomeSectionThree = (): JSX.Element => {
  const features = [
    {
      icon: MessageCircleIcon,
      title:
        "تطوير المهارات الشخصية الحياتية للفتاة وتهيئتها للانخراط في المجتمع بوعي",
    },
    {
      icon: ZapIcon,
      title: "توفير بيئة تطوعية ملائمة تناسب متطلبات واحتياجات الفتيات",
    },
    {
      icon: UsersIcon,
      title:
        "زيادة وعي الفتيات بالعمل التطوعي وزيادة مشاركاتهن في التنمية والمجتمع",
    },
    {
      icon: StarIcon,
      title: "تعزيز القيم والسلوكيات الإيجابية لدى الفتيات",
    },
    {
      icon: SmileIcon,
      title: "تعزيز مسؤولية الفتاة تجاه ذاتها وأسرتها ومجتمعها",
    },
    {
      icon: SmileIcon,
      title: "تعزيز مسؤولية الفتاة تجاه ذاتها وأسرتها ومجتمعها",
    },
    {
      icon: CommandIcon,
      title: "بناء علاقات اجتماعية واعية لدى الفتيات",
    },
  ];

  return (
<section className="flex flex-col items-center gap-16 py-24 bg-white">
  <div className="flex flex-col max-w-screen-xl items-start gap-8 px-8 w-full">
    <div className="flex flex-col items-center gap-12 w-full">
      <div className="flex flex-col max-w-screen-md items-center gap-5 w-full">
        <div className="flex flex-col items-center gap-3 w-full">
          <Badge
            variant="outline"
            className="bg-[#fafafa] border-[#e9e9eb] px-2.5 py-1"
          >
            <span className="font-medium text-[#414651] text-sm text-center [direction:rtl]">
              الأهداف
            </span>
          </Badge>

          <h2 className="font-display-md-semibold text-[#181d27]">
            أهداف برنامج يانعة
          </h2>
        </div>
      </div>
    </div>
  </div>

  <div className="flex flex-col items-start gap-16 px-8 w-full">
    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 w-full lg:px-[80px]">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`flex flex-col min-w-80 items-center gap-5 flex-1 my-[32px] ${
            features.length % 3 === 1 && index === features.length - 1
              ? 'md:flex-[0_0_calc(66.666%_-_32px)]' // Centers last item when 3n+1
              : 'md:flex-[0_0_calc(33.333%_-_32px)]' // Default 3-column width
          }`}
        >
          <Card className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic">
            <div className="flex items-center justify-center">
              

              <img src={feature.icon} alt="" />
            </div>
          </Card>

          <div className="flex flex-col items-center gap-2 w-full">
            <h3 className="font-bold text-[#181d27] text-xl text-center tracking-[0] leading-[30px] [direction:rtl]">
              {feature.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
  );
};