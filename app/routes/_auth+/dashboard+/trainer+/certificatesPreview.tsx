import React from "react";
import { DownloadCloudIcon } from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import pagesvg from "../../../../assets/icons/file-type-blue.svg"
// Utility function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
    size?: "default" | "sm";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" &&
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Card Components
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
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none  ",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

// Main Component
const certificatesPreview = () => {
  const formFields = [
    {
      id: "fullName",
      label: "الاسم الرباعي",
      value: "خالد محمد المسلم",
      required: true,
      width: "flex-1",
    },
    {
      id: "administration",
      label: "الإدارة",
      value: "إدارة تعليم",
      required: true,
      width: "flex-1",
    },
    {
      id: "school",
      label: "المدرسة",
      value: "المدرسة",
      required: true,
      width: "flex-1",
    },
    {
      id: "hours",
      label: "الساعات",
      value: "الساعات",
      required: true,
      width: "w-[106px]",
    },
  ];

  return (
    <Card className="w-full rounded-xl border border-[#d5d6d9]">
      <CardContent className="flex flex-col gap-5 p-[18px]">
        {/* Download button at the top */}
        <div className="self-start">
          <Button
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            تحميل الكل
          </Button>
        </div>

        {/* Form Fields */}
        <div className="flex items-start text-right justify-start gap-[18px] w-full [direction:rtl] ">
          {formFields.map((field) => (
            <div
              key={field.id}
              className={`flex flex-col items-start gap-1.5 ${field.width}`}
            >
              <div className="flex flex-col items-start gap-1.5 w-full">
                <div className="inline-flex items-start gap-0.5">
                {field.required && (
                    <span className="mt-[-1.00px] text-x-1c-8-1ac text-sm font-medium">
                      *
                    </span>
                  )}
                  <Label
                    htmlFor={field.id}
                    className="mt-[-1.00px] font-medium text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]"
                  >
                    {field.label}
                  </Label>
      
                </div>
                <Input
                  id={field.id}
                  readOnly
                  defaultValue={field.value}
                  className="flex items-center justify-start gap-2 px-3.5 py-2.5 w-full bg-white  rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs   font-normal text-[#717680] text-base tracking-[0] leading-6 [direction:rtl]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* File Upload Card */}
        <Card className="w-full rounded-xl border border-[#e9e9eb] bg-white [direction:rtl] ">
          <CardContent className="flex items-center justify-between gap-3 p-4">

         

            <div className="relative h-10 w-10">
              <div className="relative left-1 h-10 w-8">
                <img className="h-10 w-8" alt="PDF file" src={pagesvg} />
                <div className="absolute left-0 top-[22px] w-8 font-sans text-[9px] font-bold text-white text-center">
                   
                </div>
              </div>
            </div>
      
            <div className="flex flex-1 flex-col gap-1">
              <div className="text-sm font-medium text-[#414651]">
                شهادة خالد
              </div>
              <div className="text-sm font-normal text-[#535861]">
                حجم الملف
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 rounded-md border-[#d5d6d9] bg-white shadow-shadows-shadow-xs-skeuomorphic"
            >
             
              <span className="font-bold text-[#414651] text-sm">تحميل</span>
              <DownloadCloudIcon className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default certificatesPreview;
