import React, { useRef } from "react";
import { DownloadCloudIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import image from "../../../../assets/images/new-design/image-1.png";
import pdfImg from "../../../../assets/images/new-design/Filetypeicon.png";
import image2 from "../../../../assets/images/new-design/image.png";
import ArrowLeft from "../../../../assets/images/new-design/arrow-right-02.png";
import { useNavigate } from "@remix-run/react";


// Utility function
const cn = (...inputs: (string | undefined)[]) => {
  return twMerge(clsx(inputs));
};

// Type definitions
interface ProgramSection {
  id: number;
  title: string;
  files: FileItem[];
}

interface FileItem {
  id: number;
  title: string;
  description: string;
  fileType: string;
  progress?: string;
  uploaded?: string;
}

interface ArticleCard {
  id: number;
  image: string;
  title: string;
  description: string;
}

// Component definitions
const Badge = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
};

const Button = ({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        // variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
};

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
};

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("p-6", className)} {...props} />;
};

const Tabs = ({
  className,
  defaultValue,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { defaultValue: string }) => {
  return (
    <div className={cn("", className)} data-state={defaultValue} {...props} />
  );
};

const TabsList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};

const TabsTrigger = ({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { value: string }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  );
};

// Main component
const NCFiles = () => {
  const navigate = useNavigate();

  const programGuidesRef = useRef<HTMLDivElement>(null);
  const programActivitiesRef = useRef<HTMLDivElement>(null);
  const volunteerOpportunitiesRef = useRef<HTMLDivElement>(null);
  const motivationToolsRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: "program-guides",
      label: "أدلة البرنامج",
      ref: programGuidesRef,
      title: "أدلة البرنامج",
      badge: "3",
      files: [
        {
          id: 1,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "PDF",
        },
        {
          id: 2,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "MP4",
        },
        {
          id: 3,
          title: "خطوات عملية للتطوع",
          description: "4.2 MB – 70% uploaded",
          fileType: "FIG",
          progress: "70%",
          uploaded: "4.2 MB",
        },
      ],
    },
    {
      id: "program-activities",
      label: "أنشطة البرنامج",
      ref: programActivitiesRef,
      title: "أنشطة البرنامج",
      badge: "2",
      files: [
        {
          id: 1,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "PDF",
        },
        {
          id: 2,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "MP4",
        },
      ],
    },
    {
      id: "volunteer-opportunities",
      label: "بنك الفرص التطوعية",
      ref: volunteerOpportunitiesRef,
      title: "بنك الفرص التطوعية",
      badge: "2",
      files: [
        {
          id: 1,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "PDF",
        },
        {
          id: 2,
          title: "التطوع منهج حياة",
          description:
            "هنا وصف الملف الذي سوق يظهر للمستخدم وهو مكون من شرح قصير",
          fileType: "MP4",
        },
      ],
    },
    {
      id: "motivation-tools",
      label: "أدوات التحفيز",
      ref: motivationToolsRef,
      title: "أدوات التحفيز",
      files: [],
    },
  ];

  // Scroll to section
  const handleTabClick = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const elementPosition =
        ref.current.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - 100; // 100px offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Article cards data
  const articleCards: ArticleCard[] = [
    {
      id: 1,
      image: image,
      title: "واقعنا والقيم",
      description: "هنا نص بداية المقال وهو نص حسب المحتوى",
    },
    {
      id: 2,
      image: image2,
      title: "واقعنا والقيم",
      description: "هنا نص بداية المقال وهو نص حسب المحتوى",
    },
    {
      id: 3,
      image: image2,
      title: "واقعنا والقيم",
      description: "هنا نص بداية المقال وهو نص حسب المحتوى",
    },
    {
      id: 4,
      image: image,
      title: "واقعنا والقيم",
      description: "هنا نص بداية المقال وهو نص حسب المحتوى",
    },
  ];

  return (
    <div>
      <Card className="flex flex-col w-full   gap-8 p-4 bg-white mt-[120px] rounded-2xl mb-[265.5px]">
        <div className="flex flex-col gap-12 w-full">
          {sections.map(
            (section) =>
              // if section not motivation-tools render it
              section.id !== "motivation-tools" && (
                <div key={section.id} ref={section.ref}>
                  <section className="flex flex-col gap-14 w-full">
                    <div className="flex items-center justify-end gap-2 pb-3 px-1 border-b-2 border-[#006173]">
                      <Badge className="bg-[#1994910f] text-[#006173] border-[#19949166] rounded-full">
                        {section.badge || ""}
                      </Badge>
                      <h2 className="text-[#006173] font-bold text-base [direction:rtl]">
                        {section.title}
                      </h2>
                    </div>
                    <div className="flex flex-col items-center gap-4 w-full">
                      {section.files.length > 0 ? (
                        section.files.map((file) => (
                          <Card
                            key={file.id}
                            className="w-full bg-white border-[#e9e9eb] rounded-xl overflow-hidden"
                          >
                            <CardContent className="p-0">
                              <div className="flex items-start justify-end gap-3 p-5 [direction:rtl]">
                                <div className="w-10 h-10">
                                  <div className="relative w-8 h-10 left-1">
                                    <img alt="Page" src={pdfImg} />
                                    <div className="absolute w-8 top-[5px] left-0 font-bold text-white text-[9px] text-center">
                                      {file.fileType}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col flex-1">
                                  <h3 className="font-medium text-[#414651] text-sm [direction:rtl]">
                                    {file.title}
                                  </h3>
                                  <p className="font-normal text-[#535861] text-sm [direction:rtl]">
                                    {file.description}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-1 px-3 py-2 bg-white border-[#d5d6d9] rounded-lg shadow-shadows-shadow-xs-skeuomorphic"
                                >
                                  <DownloadCloudIcon className="w-5 h-5" />
                                  <span className="font-bold text-[#414651] text-sm [direction:rtl]">
                                    تحميل
                                  </span>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-[#717680] text-sm [direction:rtl]">
                          لا توجد ملفات متاحة في هذا القسم.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              )
          )}

          {/* Article Cards Section */}
          <section
            className="flex flex-col gap-14 w-full"
            key={"motivation-tools"}
            ref={motivationToolsRef}
          >
            <div className="flex items-center justify-end gap-2 pb-3 px-1 border-b-2 border-[#006173]">
              <h2 className="text-[#006173] font-bold text-base [direction:rtl]">
                أدوات التحفيز
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-[29.61px] w-full">
              {articleCards.map((article) => (
                <Card
                  key={article.id}
                  className="w-[258.91px] bg-white rounded-[11.77px] shadow-[0px_1.47px_2.94px_-1.47px_#1018280f,0px_2.94px_5.88px_-1.47px_#1018281a]"
                >
                  <CardContent className="flex flex-col items-end gap-[17.65px] p-[11.77px]">
                    <img
                      className="w-full h-[183.89px] object-cover"
                      alt="Article image"
                      src={article.image}
                    />
                    <div className="flex flex-col items-end justify-center gap-[5.88px] w-full">
                      <h3 className="self-stretch font-bold text-d-9d-9d-9 text-[13.2px] leading-[20.6px] [direction:rtl]">
                        {article.title}
                      </h3>
                      <p className="font-normal text-[#1f2a37] text-[11.8px] leading-[17.7px] whitespace-nowrap [direction:rtl]">
                        {article.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        console.log("Navigate to article view");
                        navigate("/dashboard/ncFilesView");
                      }}
                      className="h-[29.42px] px-[11.77px] py-0 bg-[#006173] text-white rounded-[5.88px] border-[0.74px] border-[#669ccd] flex items-center gap-[2.94px]"
                    >
                      <div className="w-[17.65px] h-[17.65px] relative">
                        <img
                          className="absolute text-white"
                          alt="Elements"
                          src={ArrowLeft}
                        />
                      </div>
                      <span className="font-medium text-white text-[11.8px] leading-[17.7px] whitespace-nowrap [direction:rtl]">
                        قراءة المقال
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
};

export default NCFiles;
