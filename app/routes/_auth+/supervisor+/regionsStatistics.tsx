import React from "react";
import { MoreVerticalIcon } from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import arrowDown from "../../../assets//icons/arrow-down-gray.svg";
import School from "../../../assets/icons/schools.svg";
import students from "../../../assets/icons/students.svg";

import teacher from "../../../assets/icons/teachers.svg";
import { useNavigate } from "react-router-dom"; // Import useNavigate

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Stats Data
const statsData = [
  {
    id: 1,
    icon: School,
    iconAlt: "School",
    title: "عدد المدارس",
    value: "52",
    max: "100",
    color: "#539c4a",
    percentage: 37,
  },
  {
    id: 2,
    icon: teacher,
    iconAlt: "Teacher",
    title: "عدد المعلمات",
    value: "128",
    max: "200",
    color: "#199491",
    percentage: 87,
  },
  {
    id: 3,
    icon: students,
    iconAlt: "Students",
    title: "عدد الطالبات",
    value: "4321",
    max: "5000",
    color: "#004E5C",
    percentage: 27,
  },
];

// Education departments data
const educationDepartments = [
  { name: "قرطبة", color: "#539C4A", value: 25 },
  { name: "العليا", color: "#30B0C7", value: 20 },
  { name: "طويق", color: "#FFCC00", value: 15 },
  { name: "الملز", color: "#AF52DE", value: 12 },
  { name: "النسيم", color: "#FF2D55", value: 10 },
  { name: "الروضة", color: "#68C35C", value: 8 },
  { name: "المعذر", color: "#E9EAEB", value: 6 },
  { name: "الملقا", color: "#006173", value: 4 },
];

// Reports metrics data
const reportMetrics = [
  {
    value: "87",
    unit: "مهارة",
    title: "المهارات المدرب عليها",
    color: "#68C35C",
    percentage: 47,
  },
  {
    value: "240",
    unit: "ساعة",
    title: "الساعات التطوعية",
    color: "#68C35C",
    percentage: 40,
  },
  {
    value: "76",
    unit: "نشاط",
    title: "الأنشطة المنفذة",
    color: "#68C35C",
    percentage: 36,
  },
  {
    value: "240",
    unit: "مهارة",
    title: "القيمة الاقتصادية للمهارات",
    color: "#68C35C",
    percentage: 20,
  },
  {
    value: "9832",
    unit: "ساعة تطوعية",
    title: "الساعات التطوعية المحققة",
    color: "#68C35C",
    percentage: 18,
  },
  {
    value: "231",
    unit: "قيمة",
    title: "القيمية الاقتصادية من التطوع",
    color: "#68C35C",
    percentage: 37,
  },
  {
    value: "42",
    unit: "Active users",
    title: "القيمة الاقتصادية للمهارات",
    color: "#68C35C",
    percentage: 42,
  },
];

// Regions data
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

const barColors = [
  "#006173",
  "#004E5C",
  "#199491",
  "#539C4A",
  "#004E5C",
  "#68C35C",
  "#199491",
  "#006173",
];

export const RegionsStatistics = (): JSX.Element => {
  const navigate = useNavigate(); // Initialize navigate

  const getRadialChartDataTotal = (percentage: number, color: string) => ({
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, "#E9EAEB"],
        borderWidth: 0,
        circumference: 360,
        rotation: 0,
      },
    ],
  });
  const getRadialChartDataReports = (percentage: number, color: string) => ({
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: [color, "#E9EAEB"],
        borderWidth: 0,
        circumference: 240,
        rotation: 240,
      },
    ],
  });
  const radialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const doughnutData = {
    labels: educationDepartments.map((dept) => dept.name),
    datasets: [
      {
        data: educationDepartments.map((dept) => dept.value),
        backgroundColor: educationDepartments.map((dept) => dept.color),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "60%",
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
      path: "/supervisor/regionsStatistics",
      active: false,
      hasIndicator: true,
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
  return (
    <div className="bg-[#f9f9f9]  ">
      <div className="py-6  [direction:rtl] max-lg:px-[10px]  lg:mr-[50px] ">
        <div className="w-full   py-6 rounded-xl  ">
          {/* Header Section */}
          <div className="flex flex-col items-start mb-6 pb-4 max-lg:items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {"إحصاءات المناطق"}
            </h1>
            <p className="text-lg font-normal text-[#535862]">
              بيانات المناطق والمدراس والإدرات
            </p>
          </div>
        </div>

        {/* start from here */}

        <div className="flex flex-col gap-4 relative self-stretch w-full">
          <div className="w-full">
            <div className="flex flex-col md:flex-row">
              {tabItems.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`min-h-10 px-4 py-2   border border-[#D5D7DA] w-full md:w-auto ${
                    tab.active ? "bg-[#FAFAFA]" : "bg-white"
                  } [direction:rtl] ${!tab.active ? "z-[1]" : "z-[-5]"}
          ${index === 0 ? "md:rounded-r-md rounded-t-md md:rounded-l-none" : ""}
          ${
            index === tabItems.length - 1
              ? "md:rounded-l-md rounded-b-md md:rounded-r-none"
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
      <main className="flex flex-col  mx-auto gap-9 max-lg:px-[10px] lg:px-[112px]">
        <div className="flex flex-col items-baseline gap-6 [direction:rtl] md:flex-row   lg:mt-[76px]">
          {/* المنطقة (Area) */}
          <div className="flex flex-col w-1/3  max-lg:w-full ">
            <div className="mb-2 text-start text-sm text-gray-500">المنطقة</div>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10">
                <option className=" ">الكل</option>
              </select>
              <img
                src={arrowDown}
                alt="Arrow Down"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ml-1"
              />
            </div>
          </div>

          {/* إدارة التعليم (Education Management) */}
          <div className="flex flex-col  w-1/3  max-lg:w-full">
            <div className="mb-2 text-start text-sm text-gray-500">
              إدارة التعليم
            </div>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10">
                <option className="">الكل</option>
              </select>
              <img
                src={arrowDown}
                alt="Arrow Down"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ml-1"
              />
            </div>
          </div>

          {/* المدرسة (School) */}
          <div className="flex flex-col w-1/3  max-lg:w-full">
            <div className="mb-2 text-start text-sm text-gray-500">المدرسة</div>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10">
                <option className="">الكل</option>
              </select>
              <img
                src={arrowDown}
                alt="Arrow Down"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ml-1"
              />
            </div>
          </div>
        </div>
        {/* Stats Section */}

        <div className="flex flex-col lg:flex-row items-center gap-[27px] relative self-stretch w-full flex-[0_0_auto] [direction:rtl] mt-[108px]">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="flex h-[142px] max-lg:w-full lg:w-auto items-center justify-center gap-6 p-6 relative flex-1 grow bg-white rounded-xl border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs mb-4 lg:mb-0 "
            >
              <div className="flex flex-col lg:flex-row  items-center justify-center gap-6 p-0 w-full ">
                <div className="relative w-[120px] h-[120px]">
                  <Doughnut
                    data={getRadialChartDataTotal(stat.percentage, stat.color)}
                    options={radialChartOptions}
                  />
                  {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-[#181d27] text-2xl font-bold">
                      {stat.percentage}%
                    </div>
                  </div> */}
                </div>

                <div className="flex flex-col items-end md:items-end gap-6 relative flex-1 grow ">
                  <div className="self-stretch mt-[-1.00px] font-bold text-base leading-6 relative text-[#181d27] tracking-[0] [direction:rtl] text-center md:text-right">
                    {stat.title}
                  </div>

                  <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="flex items-end justify-center md:justify-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="relative flex-1 mt-[-1.00px] font-bold text-[#181d27] text-5xl text-center md:text-right tracking-[0] leading-[38px]">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  className="relative w-[54px] h-[54px] "
                  alt={stat.iconAlt}
                  src={stat.icon}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex lg:flex-row max-lg:flex-col max-lg:items-center  items-start justify-end gap-9">
          {/* Education Departments Card */}
          <div className="flex flex-col   gap-6 max-lg:w-full">
            <div className="flex flex-col items-start gap-5 w-full">
              <div className="flex items-start gap-4 w-full">
                <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                  <h2 className="self-stretch  font-bold text-[#181d27] text-lg tracking-[0] leading-7 [direction:rtl]">
                    إدارات التعليم
                  </h2>
                </div>
              </div>
            </div>

            <div className="h-[321px] w-full overflow-hidden border-[#e9e9eb] shadow-shadows-shadow-xs bg-white rounded-xl">
              <div className="p-0">
                <div className="flex flex-col items-end gap-6 p-6 w-full">
                  <div className="flex flex-col items-start gap-5 w-full">
                    <div className="flex items-start gap-4 w-full">
                      <div className="inline-flex flex-col items-start">
                        <MoreVerticalIcon className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                        <div className="self-stretch  font-bold text-[#181d27] text-base leading-6 tracking-[0] [direction:rtl]">
                          إدارات التعليم
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-6 w-full">
                    <div className="inline-flex items-start gap-4">
                      <div className="relative w-[200px] h-[200px]">
                        <Doughnut
                          data={doughnutData}
                          options={doughnutOptions}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-1">
                      {educationDepartments.map((department, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-end gap-2 w-full"
                        >
                          <div className="w-fit mt-[-1.00px]  font-normal text-[#535861] text-sm text-left leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
                            {department.name}
                          </div>
                          <div className="inline-flex items-start gap-2.5 pt-1.5 pb-0 px-0">
                            <div
                              className="relative w-2 h-2 rounded"
                              style={{ backgroundColor: department.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="flex flex-col w-full   items-start gap-6">
            {/* Header section - unchanged */}
            <div className="flex flex-col items-start gap-5 w-full">
              <div className="flex items-start gap-4 w-full">
                <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                  <h2 className="self-stretch font-bold text-[#181d27] text-lg tracking-[0] leading-7 [direction:rtl]">
                    التقارير
                  </h2>
                </div>
              </div>
            </div>

            {/* Metrics section - modified for mobile */}
            <div className="w-full border-[#e9eaeb] bg-white rounded-xl">
              <div className="p-6 flex justify-center lg:justify-end">
                <div className="flex flex-wrap justify-center lg:justify-end w-full lg:w-[774px] gap-y-6 gap-x-4 lg:gap-[16px_42px]">
                  {reportMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center gap-3 w-[calc(50%-8px)] lg:w-auto"
                    >
                      <div className="relative w-32 lg:w-40 h-[70px] lg:h-[88px]">
                        <Doughnut
                          data={getRadialChartDataReports(
                            metric.percentage,
                            metric.color
                          )}
                          options={radialChartOptions}
                        />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-[#535861] text-xs mb-1">
                            {metric.unit}
                          </div>
                          <div className="text-[#181d27] text-xl lg:text-2xl font-bold">
                            {metric.value}
                          </div>
                        </div>
                      </div>
                      <div className="w-full font-medium text-[#181d27] text-sm text-center tracking-[0] leading-[14.2px] [direction:rtl]">
                        {metric.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regions Section */}
        <section className="flex flex-col gap-6 w-full ">
          <div className="flex flex-col gap-5 w-full">
            <div className="flex items-start gap-4 w-full h-full">
              <div className="flex flex-col gap-5 w-full">
                <div className="flex items-center w-full">
                  {" "}
                  {/* Changed to items-center for vertical alignment */}
                  <div className="flex rounded-md border border-[#d5d6d9] overflow-hidden">
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
      </main>
    </div>
  );
};

export default RegionsStatistics;
// programStatics
