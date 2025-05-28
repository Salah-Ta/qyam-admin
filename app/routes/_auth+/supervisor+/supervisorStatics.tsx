import React from "react";
import content from "../supervisor+/assets/content.png";
import verified from "../supervisor+/assets/verified-tick.svg";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { cn } from "~/lib/utils";
import students from "./assets/students.svg";
import { useNavigate } from "@remix-run/react";
import { PlusIcon } from "lucide-react";

// Card components
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

// Toggle Group components
const ToggleGroupContext = React.createContext<{
  size: "default" | "sm" | "lg" | undefined;
}>({
  size: "default",
});
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
// Define the data structure for metric cards
interface MetricCard {
  label: string;
  value: string;
  unit: string;
  description: string;
}

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define the data structure for metric cards
interface MetricCard {
  label: string;
  value: string;
  unit: string;
  description: string;
  color: string;
}

export const SupervisorStatistics = (): JSX.Element => {
  const navigate = useNavigate();

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

  // Data for metric cards
  const metricCards: MetricCard[] = [
    {
      label: "مهارة",
      value: "87",
      unit: "",
      description: "المهارات المدرب عليها",
      color: "#68C35C",
    },
    {
      label: "ساعة",
      value: "240",
      unit: "",
      description: "الساعات التطوعية",
      color: "#68C35C",
    },
    {
      label: "نشاط",
      value: "76",
      unit: "",
      description: "الأنشطة المنفذة",
      color: "#68C35C",
    },
    {
      label: "مهارة",
      value: "240",
      unit: "",
      description: "القيمة الاقتصادية للمهارات",
      color: "#68C35C",
    },
    {
      label: "ساعة تطوعية",
      value: "9832",
      unit: "",
      description: "الساعات التطوعية المحققة",
      color: "#68C35C",
    },
    {
      label: "قيمة",
      value: "231",
      unit: "",
      description: "القيمية الاقتصادية من التطوع",
      color: "#68C35C",
    },
    {
      label: "Active users",
      value: "42",
      unit: "",
      description: "القيمة الاقتصادية للمهارات",
      color: "#68C35C",
    },
  ];

  // Data for the regions chart
  const regions = [
    { name: "الملقا", value: 40 },
    { name: "العارض", value: 45 },
    { name: "الملقا", value: 53 },
    { name: "قرطبة", value: 25 },
    { name: "النسيم", value: 54 },
    { name: "المعذر", value: 43 },
    { name: "طويق", value: 12 },
    { name: "الملز", value: 50 },
  ];

  const createDoughnutData = (value: any, color: string) => ({
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, "#E9EAEB"],
        borderWidth: -2,
        cutout: "80%",
        circumference: -180, // 90 degrees arc (quarter circle)
        rotation: 270, // Start at 270 degrees (top-right corner)
        borderRadius: {
          innerStart: 20,
          outerStart: 0,
          innerEnd: 0,
          outerEnd: 20,
        },
      },
    ],
  });
  const createCircleChartData = (value: number) => ({
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: ["#004E5C", "#E9EAEB"],
        borderWidth: 0,
        cutout: "70%", // Makes it a doughnut chart
        circumference: 360, // Full circle
        rotation: -10, // Starts from top
      },
    ],
  });

  const circleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };
  const doughnutOptions = {
    cutout: "80%", // Slightly smaller cutout to make ring thinner and avoid overlap with text
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };


  const barChartData = {
    labels: regions.map((region) => region.name),
    datasets: [
      {
        label: "Green Segment",
        data: regions.map((region) => region.value),
        backgroundColor: "#17b169",
        borderRadius: 16,
        borderSkipped: false,
        barThickness:
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42, // 24px on mobile, 42px on desktop
        barPercentage: 0.9,
        categoryPercentage: 0.8,
      },
      {
        label: "Gray Segment",
        data: regions.map((region) => Math.max(10, region.value - 15)),
        backgroundColor: "#E9EAEB",
        borderRadius: {
          topLeft: 10,
          topRight: 10,
          bottomLeft: 0,
          bottomRight: 0,
        },
        borderSkipped: false,
        barThickness:
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42, // 24px on mobile, 42px on desktop
        barPercentage: 0.9,
        categoryPercentage: 0.8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        stacked: true,
        ticks: {
          stepSize: 20,
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 768
                ? 10
                : 12,
            family: "'Inter', sans-serif",
          },
          color: "#535861",
        },
        grid: { color: "#E9EAEB", drawBorder: false },
        border: { display: false },
      },
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 768
                ? 10
                : 12,
            family: "'Ping AR + LT', Helvetica",
            weight: 700,
          },
          color: "#535861",
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        titleAlign: "right" as const,
        bodyAlign: "right" as const,
        callbacks: {
          label: function (context: any) {
            if (context.datasetIndex === 0) {
              return `${context.parsed.y}%`;
            }
            return "";
          },
        },
      },
    },
  };
  const tabItems = [
    {
      id: "skills",
      label: "المهارات",
      path: "/supervisor/skills",
      active: false,
    },
    {
      id: "regions",
      label: "المناطق",
      path: "/supervisor/programStatics",
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
      hasIndicator: true,
    },
  ];

  return (

    <div className="bg-[#f9f9f9]">
 
    <div className=" mx-auto  max-w-full lg:px-[112px]  max-lg:px-[10px]">
  

        {/* Container Section */}
        <div className="flex flex-col w-full items-end   -mt-[10px]">
          {/* User Profile Section */}
          <div className="flex flex-col items-end gap-6 relative self-stretch w-full">
            {/* Profile Picture with Verification Badge */}
            <div className="relative w-24 h-24 -mt-[48px]">
              {" "}
              {/* Adjusted to pull avatar up */}
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
            </div>

            {/* Rest of your existing code remains the same */}
            {/* User Information */}
            <div className="flex flex-col items-end gap-0.5 relative self-stretch w-full">
              <div className="relative self-stretch mt-[-1.00px] font-bold text-[#181d27] text-xl tracking-[0] leading-[30px] [direction:rtl]">
                نورة علي الزهراني
              </div>
              <div className="self-stretch text-[#535861] text-base leading-6 relative font-normal tracking-[0] [direction:rtl]">
                مدرسة خالد بن الوليد رضي الله عنه - الرياض - تعليم الزلفي
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-col gap-4 relative self-stretch w-full [direction:rtl] ">
          <div className="w-full">
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

          <div className="w-full p-4 bg-white rounded-xl border border-[#e4e7ec]   rotate-180 mt-8 ">
            <div className="flex items-start gap-4 p-0 mt-2">
              {/* Message Content */}
              <div className="flex flex-col items-start gap-3 relative flex-1 grow">
                {/* Message Text */}
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
                      // Handle input change here
                      console.log(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* New Message Button */}
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
          </div>

          {/* Separator */}
      
        </div>
  

      <div className="flex flex-col mx-auto mt-9 mb-[1346px]">
        <div className="flex flex-col items-start gap-5 relative self-stretch w-full mb-6 mt-[72px]">
          <div className="flex items-start gap-4 relative self-stretch w-full">
            <div className="flex flex-col items-end justify-center gap-0.5 relative flex-1 self-stretch">
              <h2 className="mt-[-1.00px] relative self-stretch font-bold text-[#181d27] text-lg tracking-[0] leading-7 [direction:rtl]">
                التقارير
              </h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 mb-6 [direction:rtl]">
          {/* Left side - 7/12 width */}
          <div className="md:w-3/12  h-full flex items-center justify-center gap-[27px] relative self-stretch w-full flex-[0_0_auto]">
            <Card className="flex flex-col  h-fit items-center justify-center gap-6 p-6 relative flex-1 grow bg-white rounded-xl border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs">
              <img
                className="relative w-[54px] h-[54px] mt-[54px] mb-[24px]"
                alt="Students"
                src={students}
              />
              <CardContent className="flex items-center justify-center gap-6 relative flex-1 grow p-0 mb-[54px]">
                <div className="flex items-center justify-center gap-6 relative flex-1 grow">
                  <div className="flex-col items-end gap-6 flex-1 grow flex relative">
                    <div className="self-stretch mt-[-1.00px] font-bold text-base leading-6 relative text-[#181d27] tracking-[0] [direction:rtl]">
                      عدد الطالبات
                    </div>

                    <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="flex items-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
                        <div className="relative flex-1 mt-[-1.00px] font-bold text-[#181d27] text-5xl tracking-[0] leading-[38px] [direction:rtl]">
                          ٦٣
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-start gap-4 relative flex-[0_0_auto] mt-[-13.00px] mb-[-13.00px]">
                  <div className="relative w-[120px] h-[120px]">
                    <Doughnut
                      data={createCircleChartData(25)}
                      options={circleChartOptions}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right side - 5/12 width */}
          <div className="w-full md:w-9/12">
            {/* Metrics Section */}
            <section className="flex items-start gap-9 relative self-stretch w-full">
              <div className="flex flex-col w-full items-start gap-6 relative">
                <div className="w-full border border-solid border-[#e9eaeb] rounded-xl bg-white p-6">
                  <div className="flex flex-wrap items-center justify-center gap-[16px_42px]">
                    {metricCards.map((card, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-center gap-3"
                      >
                        <div className="relative w-40 h-[88px]">
                          <div className="relative w-36 h-36">
                            <div className="absolute w-36 h-36">
                              <Doughnut
                                data={createDoughnutData(
                                  card.value,
                                  card.color
                                )}
                                options={doughnutOptions}
                              />
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="text-xs text-[#535861] mb-2 mt-8">
                                  {card.label}
                                </div>
                                <div className="text-2xl font-bold text-[#181d27]">
                                  {card.value}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`${
                            card.description === "القيمة الاقتصادية للمهارات" &&
                            index === 3
                              ? "w-[152px]"
                              : card.description ===
                                  "القيمة الاقتصادية للمهارات" && index === 6
                              ? "w-[126px]"
                              : card.description === "الساعات التطوعية المحققة"
                              ? "w-40"
                              : "relative self-stretch"
                          } font-medium text-[#181d27] text-sm text-center tracking-[0] leading-[14.2px] m-3 [direction:rtl]`}
                        >
                          {card.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Regions Section */}
        <section className="flex flex-col gap-6 w-full mt-[36px]">
          <div className="flex flex-col gap-5 w-full">
            <div className="flex items-start gap-4 w-full h-full">
              <div className="flex flex-col gap-5 w-full">
                <div className="flex items-center w-full">
                  {" "}
                  {/* Changed to items-center for vertical alignment */}
                  <div className="flex rounded-lg border border-[#d5d6d9] overflow-hidden">
                    {" "}
                    {/* Added overflow-hidden */}
                    <button className="px-4 py-2 border-r border-[#d5d6d9] bg-white hover:bg-neutral-50 transition-colors [direction:rtl]">
                      <span className="font-bold text-[#414651] text-sm">
                        المدارس
                      </span>
                    </button>
                    <button className="px-4 py-2 border-r border-[#d5d6d9] bg-white hover:bg-neutral-50 transition-colors [direction:rtl]">
                      <span className="font-bold text-[#414651] text-sm">
                        الإدارات
                      </span>
                    </button>
                    <button className="px-4 py-2 bg-neutral-50 [direction:rtl] flex items-center justify-center gap-2">
                      {" "}
                      {/* Removed border-right from last button */}
                      <span className="font-bold text-[#414651] text-sm">
                        المناطق
                      </span>
                      <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#17b169] rounded-full" />{" "}
                        {/* Simplified green dot */}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                <h2 className=" font-bold text-[#181d27] text-lg leading-7 [direction:rtl]">
                  المناطق
                </h2>
              </div>
            </div>
          </div>

          <div className="border border-[#e9eaeb] rounded-xl bg-white p-6">
            <div className="h-[228px]">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
};

export default SupervisorStatistics;
