import React, { useRef } from "react";
import { DownloadCloudIcon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import image from "../../../assets/images/new-design/image-1.png";
import pdfImg from "../../../assets/icons/File-type-red.svg";
import image2 from "../../../assets/images/new-design/image.png";
import ArrowLeft from "../../../assets/icons/arrow-White.svg";
import upload from "../../../assets/icons/download-cloud.svg";

import { useNavigate, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import articleDB from "~/db/articles/articles.server";
import { Material, Article } from "~/types/types";
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";

// Loader function to fetch data from APIs
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const [materialsResult, articlesResult] = await Promise.allSettled([
      materialDB.getAllMaterials(context.cloudflare.env.DATABASE_URL),
      articleDB.getAllArticles(context.cloudflare.env.DATABASE_URL),
    ]);

    const materials = materialsResult.status === 'fulfilled' && materialsResult.value.status === 'success' 
      ? materialsResult.value.data as Material[] 
      : [];
    
    const articles = articlesResult.status === 'fulfilled' && articlesResult.value.status === 'success'
      ? articlesResult.value.data as Article[]
      : [];

    return Response.json({ materials, articles });
  } catch (error) {
    console.error('Error loading data:', error);
    return Response.json({ materials: [], articles: [] });
  }
}

// Utility function
const cn = (...inputs: (string | undefined)[]) => {
  return twMerge(clsx(inputs));
};

// Type definitions
interface ProgramSection {
  id: string;
  label: string;
  ref: React.RefObject<HTMLDivElement>;
  title: string;
  badge?: string;
  files: FileItem[];
  emptyMessage: string;
}

interface FileItem {
  id: string | number;
  title: string;
  description: string;
  fileType: string;
  progress?: string;
  uploaded?: string;
  storageKey?: string;
}

interface ArticleCard {
  id: string;
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
        "inline-flex  items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
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

// Type for serialized data from loader
type SerializedMaterial = Omit<Material, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

type SerializedArticle = Omit<Article, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

// Main component
const NCFiles = () => {
  const navigate = useNavigate();
  const { materials, articles } = useLoaderData<{ 
    materials: SerializedMaterial[], 
    articles: SerializedArticle[] 
  }>();

  const knowledgeCenterRef = useRef<HTMLDivElement>(null);
  const programGuidesRef = useRef<HTMLDivElement>(null);
  const programActivitiesRef = useRef<HTMLDivElement>(null);
  const volunteerOpportunitiesRef = useRef<HTMLDivElement>(null);
  const motivationToolsRef = useRef<HTMLDivElement>(null);
  const articlesRef = useRef<HTMLDivElement>(null);

  // Helper function to get file extension from storageKey or filename
  const getFileType = (storageKey: string) => {
    const extension = storageKey.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  };

  // Transform materials data to match the UI structure
  const transformMaterialsToSections = (materials: SerializedMaterial[]) => {
    // Filter materials by categoryId based on the controlpanel logic (matching the 5 categories)
    const knowledgeCenter = materials.filter(material => material.categoryId === "1"); // مركز المعرفة
    const programGuides = materials.filter(material => material.categoryId === "2"); // أدلة البرنامج
    const programActivities = materials.filter(material => material.categoryId === "3"); // أنشطة البرنامج
    const volunteerOpportunities = materials.filter(material => material.categoryId === "4"); // بنك الفرص التطوعية
    const motivationTools = materials.filter(material => material.categoryId === "5"); // أدوات التحفيز

    return [
      {
        id: "knowledge-center",
        label: "مركز المعرفة",
        ref: knowledgeCenterRef,
        title: "مركز المعرفة",
        badge: knowledgeCenter.length > 0 ? knowledgeCenter.length.toString() : undefined,
        files: knowledgeCenter.map(material => ({
          id: material.id,
          title: material.title,
          description: "مورد معرفي قيم لتطوير المهارات", // Default description
          fileType: getFileType(material.storageKey),
          storageKey: material.storageKey,
        })),
        emptyMessage: "لا توجد موارد معرفية متاحة في الوقت الحالي. سيتم إضافة محتوى جديد قريباً."
      },
      {
        id: "program-guides",
        label: "أدلة البرنامج",
        ref: programGuidesRef,
        title: "أدلة البرنامج",
        badge: programGuides.length > 0 ? programGuides.length.toString() : undefined,
        files: programGuides.map(material => ({
          id: material.id,
          title: material.title,
          description: "مادة تعليمية مفيدة للبرنامج", // Default description
          fileType: getFileType(material.storageKey),
          storageKey: material.storageKey,
        })),
        emptyMessage: "لا توجد أدلة متاحة حالياً. سيتم رفع الأدلة الإرشادية للبرنامج قريباً."
      },
      {
        id: "program-activities",
        label: "أنشطة البرنامج",
        ref: programActivitiesRef,
        title: "أنشطة البرنامج",
        badge: programActivities.length > 0 ? programActivities.length.toString() : undefined,
        files: programActivities.map(material => ({
          id: material.id,
          title: material.title,
          description: "نشاط تفاعلي للبرنامج", // Default description
          fileType: getFileType(material.storageKey),
          storageKey: material.storageKey,
        })),
        emptyMessage: "لا توجد أنشطة متاحة في الوقت الحالي. سيتم إضافة أنشطة تفاعلية قريباً."
      },
      {
        id: "volunteer-opportunities",
        label: "بنك الفرص التطوعية",
        ref: volunteerOpportunitiesRef,
        title: "بنك الفرص التطوعية",
        badge: volunteerOpportunities.length > 0 ? volunteerOpportunities.length.toString() : undefined,
        files: volunteerOpportunities.map(material => ({
          id: material.id,
          title: material.title,
          description: "فرصة تطوعية مميزة", // Default description
          fileType: getFileType(material.storageKey),
          storageKey: material.storageKey,
        })),
        emptyMessage: "لا توجد فرص تطوعية متاحة حالياً. تابعنا لمعرفة الفرص الجديدة."
      },
      {
        id: "motivation-tools",
        label: "أدوات التحفيز",
        ref: motivationToolsRef,
        title: "أدوات التحفيز",
        badge: motivationTools.length > 0 ? motivationTools.length.toString() : undefined,
        files: motivationTools.map(material => ({
          id: material.id,
          title: material.title,
          description: "أداة تحفيزية لرفع الدافعية", // Default description
          fileType: getFileType(material.storageKey),
          storageKey: material.storageKey,
        })),
        emptyMessage: "لا توجد أدوات تحفيز متاحة حالياً. سيتم إضافة أدوات تحفيزية قريباً."
      },
    ];
  };

  const sections = transformMaterialsToSections(materials);

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

  // Transform articles data to match the UI structure
  const articleCards: ArticleCard[] = articles.map(article => ({
    id: article.id,
    image: article.image || image, // Use default image if no image provided
    title: article.title,
    description: article.description,
  }));

  return (
    <Card className="flex flex-col w-full   gap-8 p-4 bg-white rounded-2xl md:mt-[182px] mb-[265.5px]">
      <Tabs defaultValue="knowledge-center" dir="rtl" className="w-full">
        <TabsList className="flex flex-col md:flex-row  items-center justify-center gap-4 md:gap-1 p-1.5 w-full  rounded-xl border border-solid border-[#e9e9eb]">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className={`flex h-8 max-md:mt-3 items-center justify-center gap-2 w-full md:flex-1 rounded-md ${
                section.id === "knowledge-center"
                  ? "bg-white shadow-shadows-shadow-sm text-[#414651]"
                  : "bg-transparent text-[#717680]"
              }`}
              onClick={() => handleTabClick(section.ref)}
            >
              {section.badge && (
                <Badge className="px-2.5 py-0.5 bg-neutral-50 rounded-full border border-solid border-[#e9e9eb]">
                  <span className="font-text-sm-medium font-[number:var(--text-sm-medium-font-weight)] text-[#414651] text-[length:var(--text-sm-medium-font-size)] tracking-[var(--text-sm-medium-letter-spacing)] leading-[var(--text-sm-medium-line-height)]">
                    {section.badge}
                  </span>
                </Badge>
              )}
              <span className="font-bold text-base tracking-[0] leading-6 whitespace-nowrap [direction:rtl]">
                {section.label}
              </span>
            </TabsTrigger>
          ))}
          {/* Articles Tab */}
          <TabsTrigger
            key="articles"
            value="articles"
            className="flex h-8 max-md:mt-3 items-center justify-center gap-2 w-full md:flex-1 rounded-md bg-transparent text-[#717680]"
            onClick={() => handleTabClick(articlesRef)}
          >
            <Badge className="px-2.5 py-0.5 bg-neutral-50 rounded-full border border-solid border-[#e9e9eb]">
              <span className="font-text-sm-medium font-[number:var(--text-sm-medium-font-weight)] text-[#414651] text-[length:var(--text-sm-medium-font-size)] tracking-[var(--text-sm-medium-letter-spacing)] leading-[var(--text-sm-medium-line-height)]">
                {articles.length || "0"}
              </span>
            </Badge>
            <span className="font-bold text-base tracking-[0] leading-6 whitespace-nowrap [direction:rtl]">
              المقالات
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col gap-12 w-full">
        {sections.map((section) => (
          <div key={section.id} ref={section.ref}>
            <section className="flex flex-col gap-14 w-full">
              <div className="flex items-center justify-end gap-2 pb-3 px-1 border-b-2 border-[#006173]">
                <Badge className="bg-[#1994910f] text-[#006173] border-[#19949166] rounded-full">
                  {section.badge || "0"}
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
                          <a
                            href={file.storageKey ? `/download/${file.storageKey}` : '#'}
                            download={file.storageKey ? sanitizeArabicFilenames(file.title) : ''}
                            className="flex items-center gap-1 px-3 py-2 bg-white border-[1px] border-[#d5d6d9] rounded-md shadow-shadows-shadow-xs-skeuomorphic text-decoration-none"
                          >
                            <img src={upload} alt="" />
                            <span className="font-bold text-[#414651] text-sm [direction:rtl]">
                              تحميل
                            </span>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 mb-4 opacity-30">
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 8C35.3137 8 38 10.6863 38 14V18H46C49.3137 18 52 20.6863 52 24V50C52 53.3137 49.3137 56 46 56H18C14.6863 56 12 53.3137 12 50V24C12 20.6863 14.6863 18 18 18H26V14C26 10.6863 28.6863 8 32 8Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M26 32H38M26 40H38" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-[#717680] text-base font-medium mb-2 [direction:rtl]">
                      {section.emptyMessage}
                    </p>
                    <p className="text-[#9CA3AF] text-sm [direction:rtl]">
                      سيتم تحديث المحتوى بانتظام
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ))}

        {/* Article Cards Section - Separate from categories */}
        <section
          className="flex flex-col gap-14 w-full"
          key={"articles-section"}
          ref={articlesRef}
        >
          <div className="flex items-center justify-end gap-2 pb-3 px-1 border-b-2 border-[#006173]">
            <Badge className="bg-[#1994910f] text-[#006173] border-[#19949166] rounded-full">
              {articles.length || "0"}
            </Badge>
            <h2 className="text-[#006173] font-bold text-base [direction:rtl]">
              المقالات
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-[29.61px] w-full" dir="rtl">
            {articleCards.length > 0 ? (
              articleCards.map((article) => (
                <Card
                  key={article.id}
                  className="w-full md:w-[258.91px] bg-white rounded-[11.77px] shadow-[0px_1.47px_2.94px_-1.47px_#1018280f,0px_2.94px_5.88px_-1.47px_#1018281a]"
                >
                  <CardContent className="flex flex-col items-end gap-[17.65px] p-[11.77px]" dir="rtl">
                    <img
                      className="w-full h-[183.89px] object-cover rounded-[8px]"
                      alt="Article image"
                      src={article.image}
                    />
                    <div className="flex flex-col items-end justify-center gap-[5.88px] w-full" dir="rtl">
                      <h3 className="self-stretch font-bold text-[#414651] text-[13.2px] leading-[20.6px] text-right">
                        {article.title}
                      </h3>
                      <p className="font-normal text-[#1f2a37] text-[11.8px] leading-[17.7px] text-right">
                        {article.description}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/dashboard/ncFilesView?articleId=${article.id}`)}
                      className="h-[29.42px] px-[11.77px] py-0 bg-[#006173] text-white rounded-[5.88px] border-[0.74px] border-[#669ccd] flex items-center gap-[2.94px] self-end"
                    >
                      <span className="font-medium text-white text-[11.8px] leading-[17.7px] whitespace-nowrap">
                        قراءة المقال
                      </span>
                      <div className="w-[17.65px] h-[17.65px] relative">
                        <img
                          className="absolute text-white"
                          alt="Elements"
                          src={ArrowLeft}
                        />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center w-full" dir="rtl">
                <div className="w-16 h-16 mb-4 opacity-30">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 4C45.2548 4 56 14.7452 56 28V36C56 49.2548 45.2548 60 32 60C18.7452 60 8 49.2548 8 36V28C8 14.7452 18.7452 4 32 4Z" stroke="#9CA3AF" strokeWidth="2"/>
                    <path d="M24 28C24 30.2091 25.7909 32 28 32C30.2091 32 32 30.2091 32 28C32 25.7909 30.2091 24 28 24C25.7909 24 24 25.7909 24 28Z" fill="#9CA3AF"/>
                    <path d="M40 28C40 30.2091 38.2091 32 36 32C33.7909 32 32 30.2091 32 28C32 25.7909 33.7909 24 36 24C38.2091 24 40 25.7909 40 28Z" fill="#9CA3AF"/>
                    <path d="M20 44C20 44 24 40 32 40C40 40 44 44 44 44" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[#717680] text-base font-medium mb-2 text-right">
                  لا توجد مقالات متاحة حالياً
                </p>
                <p className="text-[#9CA3AF] text-sm text-right">
                  سيتم إضافة مقالات ملهمة ومفيدة قريباً
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Card>
  );
};

export default NCFiles;
