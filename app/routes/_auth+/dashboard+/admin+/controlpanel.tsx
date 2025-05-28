import { CheckIcon, UploadCloudIcon } from "lucide-react";
import React, { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import imageDashed from "../admin+/assets/Image.png";
import plusImg from "../admin+/assets/plus-sign.png";

import pdf01 from "../admin+/assets/pdf-01.svg";
import pageSvg from "../admin+/assets/page.svg";
import featuredIcon from "../admin+/assets/Featured icon.png";
import deleteIcon from "../admin+/assets/group-30519.png";
import HorizontalTabs from "./horizontalTabs";

// Utility function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// File data for mapping
const fileCards = [
  {
    id: 1,
    title: "مقرر القيم 1",
    icon: "/admin+/assets/pdf-01.svg",
    deleteIcon: "/group-30519.png",
  },
  {
    id: 2,
    title: "مقرر القيم 1",
    icon: "../admin+/assets/pdf-01.png",
    deleteIcon: "/group-30519-1.png",
  },
  {
    id: 3,
    title: "مقرر القيم 1",
    icon: "/admin+/assets/pdf-01.svg",
    deleteIcon: "/group-30519-2.png",
  },
  {
    id: 4,
    title: "مقرر القيم 1",
    icon: "/admin+/assets/pdf-01.svg",
    deleteIcon: "/group-30519-3.png",
  },
];

const uploadedFiles = [
  {
    id: 1,
    title: "التطوع منهج حياة",
    type: "PDF",
    size: "200 KB",
    progress: 100,
    status: "complete",
  },
  {
    id: 2,
    title: "كيف يمكن أن أتطوع",
    type: "MP4",
    size: "16 MB",
    progress: 70,
    status: "complete",
  },
  {
    id: 3,
    title: "خطوات عملية للتطوع",
    type: "FIG",
    size: "4.2 MB",
    progress: 70,
    status: "uploading",
  },
];

// Component definitions
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" &&
          "border border-input hover:bg-accent hover:text-accent-foreground",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold   ",
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

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
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
  }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-primary/10",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-secondary  "
      style={{ transform: `translateX(${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("shrink-0 bg-border", "h-[1px] w-full", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

export const ControlPanel = (): JSX.Element => {
  const [selectedButton, setSelectedButton] =
    useState<string>("knowledge-center");

  const handleButtonClick = (buttonName: string) => {
    setSelectedButton(buttonName);
  };

  return (
    <div>
      <div className="lg:flex items-start   relative w-full  h-full pt-6  ">

        <Card className="w-full h-full rounded-2xl border border-[#d0d5dd]  ">
          <CardContent className="p-8 flex flex-col gap-4">
            {/* Upload Area */}
            <div className="flex flex-col items-center gap-3 p-4 bg-[#fdfdfd] rounded-lg border border-[#e4e7ec] [direction:rtl]">
              <div className="relative w-[46px] h-[46px] bg-gray-100 rounded-[28px] border-[6px] border-[#f8f9fb] flex items-center justify-center">
                <UploadCloudIcon className="w-5 h-5" />
              </div>

              <div className="flex flex-col items-center gap-1 w-full">
                <div className="flex items-center justify-center gap-1 w-full">
                  <div className="  font-normal text-gray-600 text-sm leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
                    أو بالسحب والإفلات
                  </div>

                  <div className="inline-flex items-center justify-center gap-2">
                    <div className="  font-bold text-[#8bc53f] text-sm leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
                      قم بالضغط للتحميل
                    </div>
                  </div>
                </div>

                <div className="text-gray-600 text-xs text-center leading-[18px]   font-normal tracking-[0]">
                  SVG, PNG, JPG or GIF (max.4.00 MB)
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="flex flex-col w-full items-end bg-transparent ">
              <div className="flex items-center justify-end gap-4 px-6 py-4 w-full">
                <div className="flex items-start gap-3 ">
                  <Button
                    variant="outline"
                    className="rounded-lg   font-bold text-gray-700 text-sm  px-4 py-[10px] "
                  >
                    إلغاء
                  </Button>

                  <Button className="bg-[#006173] rounded-lg border border-[#0d3151]  px-4 py-[10px] font-bold text-white text-sm ">
                    حفظ الملفات
                  </Button>
                </div>
              </div>

              <Separator className="w-full" />
            </footer>

            {/* Uploaded Items Label */}
            <div className="flex items-center gap-[5px] self-end mt-16">
              <div className="w-[18px] h-[18px] bg-success-100 rounded-[9px] flex items-center justify-center">
                <CheckIcon className="w-[9px] h-[9px]" />
                <img src={featuredIcon} alt="" />
              </div>

              <div className="  font-medium text-[#039754] text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap [direction:rtl]">
                العناصر التي تم تحميلها
              </div>
            </div>

            {/* File Cards */}
            <div className="flex flex-col md:flex-row gap-6 w-full mt-2">
              {fileCards.map((file) => (
                <Card
                  key={file.id}
                  className="w-full md:flex-1 flex items-center justify-center gap-[13.75px] px-[13.75px] py-[11px] bg-white rounded-[11px] border-[2.38px] border-dashed border-[#cfd4dc] shadow-[0px_1.38px_2.75px_#1018280d]"
                >
                  <img
                    className="w-[16.5px] h-[16.5px]"
                    alt="Delete"
                    src={deleteIcon}
                  />

                  <div className="font-normal text-black text-[13.8px] leading-[27.5px] whitespace-nowrap tracking-[0] [direction:rtl]">
                    {file.title}
                  </div>

                  <img className="w-[33px] h-[33px]" alt="PDF" src={pdf01} />
                </Card>
              ))}
            </div>

            {/* Status Messages */}
            <div className="flex flex-col md:flex-row gap-4 self-end mt-[29px]">
              {/* Error Badge */}
              <Badge className="flex items-center justify-between md:justify-start w-full md:w-auto gap-3 pl-2 pr-2 py-1 bg-[#fef3f2] rounded-2xl">
                <div className="text-[#b32318] font-medium text-sm tracking-[0] leading-5 whitespace-nowrap">
                  تأكد من حجم أو نوع الملف
                </div>
                <div className="px-2.5 py-0.5 bg-white rounded-2xl border border-[#fecdc9]">
                  <span className="font-medium text-[#b32218] text-sm text-center leading-5 whitespace-nowrap tracking-[0]">
                    خطأ
                  </span>
                </div>
              </Badge>

              {/* Success Badge */}
              <Badge className="flex items-center justify-between md:justify-start w-full md:w-auto gap-3 pl-2 pr-1 py-1 bg-[#ECFDF3] rounded-2xl">
                <div className="text-[#027A48] font-medium text-sm tracking-[0] leading-5 whitespace-nowrap">
                  تم رفع الملفات بنجاح
                </div>
                <div className="px-2.5 py-0.5 bg-white rounded-2xl border border-[#0dbd7563]">
                  <span className="font-medium text-[#027A48] text-sm text-center leading-5 whitespace-nowrap tracking-[0]">
                    نجاح
                  </span>
                </div>
              </Badge>
            </div>

            {/* Uploaded Files List */}
            <div className="w-full flex flex-col gap-4 mt-8">
              {uploadedFiles.map((file) => (
                <Card
                  key={file.id}
                  className={`w-full h-[72px] rounded-xl border border-[#e9e9eb] overflow-hidden ${
                    file.status === "uploading" ? "relative" : ""
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-3 p-4 w-full">
                      {file.status === "complete" && (
                        <div className="w-4 h-4 bg-[#68c35c] rounded flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col   gap-1 flex-1 [direction:rtl]">
                        <div className="  font-medium text-[#414651] text-sm leading-5 tracking-[0] ">
                          {file.title}
                        </div>
                        <div className="text-[#535861] text-sm leading-5 font-normal">
                          {file.size} – {file.progress}% uploaded
                        </div>
                      </div>

                      <div className="relative w-10 h-10">
                        <div className="relative w-8 h-10 left-1">
                          <img
                            className="absolute w-8 h-10 top-0 left-0"
                            alt="Page"
                            // src="/page.svg"
                            src={pageSvg}
                          />
                          <div className="absolute w-8 top-[5px] left-0 [font-family:'Inter',Helvetica] font-bold text-white text-[9px] text-center tracking-[0] leading-[normal]">
                            {file.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {file.status === "uploading" && (
                    <>
                      {/* Progress spinner */}
                      <div className="absolute left-4 top-6">
                        <div className="w-8 h-8">
                          <div
                            className="w-full h-full rounded-full border-2 border-gray-300  border-t-blue-500 animate-spin"
                            style={{
                              borderTopWidth: "4px",
                              borderRightWidth: "4px",
                              borderBottomWidth: "4px",
                              borderLeftWidth: "4px",
                              transformOrigin: "center",
                              animationDuration: "0s",
                              borderTopColor: "#68c35c", // blue-500
                              borderRightColor: "#68c35c",
                              borderBottomColor: "bg-tertiary",
                              borderLeftColor: "bg-tertiary",
                            }}
                          />
                          {/* Optional progress text inside spinner */}
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
            <div className=" w-full mx-auto rounded-xl   shadow-lg bg-white overflow-hidden p-2">
              <div
                className="w-full h-36 rounded-t-xl"
                style={{
                  backgroundImage: `url(${imageDashed})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>

              <div className="flex flex-col items-end p-4">
                <div className="text-right w-full">
                  <div className="font-bold text-gray-800 mb-1"> نص جديد </div>
                  <div className="text-gray-600 text-sm">
                    هنا نص بداية المقال وهو نص حسب المحتوى{" "}
                  </div>
                </div>
                <button className=" flex items-center justify-center mt-4 px-6 py-1 bg-[#006173] text-white rounded shadow hover:bg-teal-800 transition">
                  <img src={plusImg} alt="" />
                  <span className="ml-2">جديد</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <section className="flex flex-col  items-center bg-gray-100 ml-6  max-lg:hidden">
          {[
            { name: "مركز المعرفة", id: "knowledge-center" },
            { name: "أدلة البرنامج", id: "program-guides" },
            { name: "أنشطة البرنامج", id: "program-activities" },
            { name: "بنك الفرص التطوعية", id: "volunteer-bank" },
            { name: "أدوات التحفيز", id: "motivation-tools" },
          ].map((button) => (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button.id)}
              className={`font-bold py-4 px-3 rounded-xl shadow-sm w-64 mb-6 ${
                selectedButton === button.id
                  ? "bg-[#006173] text-white"
                  : "bg-white text-[#344054]"
              }`}
            >
              {button.name}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ControlPanel;
