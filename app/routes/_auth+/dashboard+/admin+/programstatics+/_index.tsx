import React, { useState, useEffect } from "react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
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
import arrowDown from "../../../../../assets/icons/arrow-down-gray.svg";
import School from "../../../../../assets/icons/schools.svg";
import students from "../../../../../assets/icons/students.svg";
import teacher from "../../../../../assets/icons/teachers.svg";
import reportDB from "~/db/report/report.server";
import regionDB from "~/db/region/region.server";
import schoolDB from "~/db/school/school.server";
import userDB from "~/db/user/user.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { ReportStatistics } from "~/types/types";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const user = await getAuthenticated({ request, context });
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUrl = context.cloudflare.env.DATABASE_URL;

    // Fetch statistics and other data in parallel
    const [statistics, regions, schools, users, eduAdmins] = await Promise.all([
      reportDB.calculateStatistics(dbUrl),
      regionDB.getAllRegions(dbUrl),
      schoolDB.getAllSchools(dbUrl),
      userDB.getAllUsers(dbUrl),
      eduAdminDB.getAllEduAdmins(dbUrl),
    ]);

    return Response.json({
      statistics,
      regions: regions.data || [],
      schools: schools.data || [],
      users: users.data || [],
      eduAdmins: eduAdmins.data || [],
    });
  } catch (error) {
    console.error("Error loading statistics:", error);
    return Response.json({ error: "Failed to load data" }, { status: 500 });
  }
}

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export default function ProgramStatisticsContent(): JSX.Element {
  const loaderData = useLoaderData<{
    statistics: ReportStatistics;
    regions: any[];
    schools: any[];
    users: any[];
    eduAdmins: any[];
  }>();

  // State for dropdown selections
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedEduAdmin, setSelectedEduAdmin] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  // Handle potential error state
  if ("error" in loaderData) {
    return (
      <div className="bg-[#f9f9f9] p-6">
        <div className="text-center text-red-500">
          فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      </div>
    );
  }

  const { statistics, regions, schools, users, eduAdmins } = loaderData;

  // Filter eduAdmins based on selected region
  const filteredEduAdmins = selectedRegion
    ? eduAdmins.filter((eduAdmin) => eduAdmin.regionId === selectedRegion)
    : eduAdmins;

  // Filter schools based on selected eduAdmin and region
  const filteredSchools = selectedEduAdmin
    ? schools.filter((school) => school.eduAdminId === selectedEduAdmin)
    : selectedRegion
    ? schools.filter((school) => school.regionId === selectedRegion)
    : [];

  // Reset dependent dropdowns when parent changes
  useEffect(() => {
    if (selectedRegion) {
      setSelectedEduAdmin("");
      setSelectedSchool("");
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedEduAdmin) {
      setSelectedSchool("");
    }
  }, [selectedEduAdmin]);

  // Calculate stats data from real data
  const statsData = [
    {
      id: 1,
      icon: School,
      iconAlt: "School",
      title: "عدد المدارس",
      value: statistics.globalTotals.schoolsCount.toString(),
      max: "100",
      color: "#539c4a",
      percentage: Math.min(
        100,
        (statistics.globalTotals.schoolsCount / 100) * 100
      ),
    },
    {
      id: 2,
      icon: teacher,
      iconAlt: "Teacher",
      title: "عدد المعلمات",
      value: statistics.globalTotals.trainers.toString(),
      max: "200",
      color: "#199491",
      percentage: Math.min(100, (statistics.globalTotals.trainers / 200) * 100),
    },
    {
      id: 3,
      icon: students,
      iconAlt: "Students",
      title: "عدد الطالبات",
      value: users
        .reduce((acc, user) => acc + (user.noStudents || 0), 0)
        .toString(),
      max: "5000",
      color: "#004E5C",
      percentage: Math.min(
        100,
        (users.reduce((acc, user) => acc + (user.noStudents || 0), 0) / 5000) *
          100
      ),
    },
  ];

  // Create education departments data from regional statistics
  const educationDepartments = statistics.eduAdminStats
    .slice(0, 8)
    .map((stat, index) => ({
      name: stat.eduAdminName,
      color: [
        "#539C4A",
        "#30B0C7",
        "#FFCC00",
        "#AF52DE",
        "#FF2D55",
        "#68C35C",
        "#E9EAEB",
        "#006173",
      ][index % 8],
      value: Math.round(stat.volunteerHoursPercentage),
    }));

  // Create reports metrics data from global totals
  const reportMetrics = [
    {
      value: statistics.globalTotals.skillsTrainedCount.toString(),
      unit: "مهارة",
      title: "المهارات المدرب عليها",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.skillsTrainedCount / 100) * 100
      ),
    },
    {
      value: Math.round(statistics.globalTotals.volunteerHours).toString(),
      unit: "ساعة",
      title: "الساعات التطوعية",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.volunteerHours / 1000) * 100
      ),
    },
    {
      value: statistics.globalTotals.activitiesCount.toString(),
      unit: "نشاط",
      title: "الأنشطة المنفذة",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.activitiesCount / 100) * 100
      ),
    },
    {
      value: Math.round(statistics.globalTotals.skillsEconomicValue).toString(),
      unit: "مهارة",
      title: "القيمة الاقتصادية للمهارات",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.skillsEconomicValue / 1000) * 100
      ),
    },
    {
      value: Math.round(statistics.globalTotals.volunteerHours).toString(),
      unit: "ساعة تطوعية",
      title: "الساعات التطوعية المحققة",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.volunteerHours / 10000) * 100
      ),
    },
    {
      value: Math.round(statistics.globalTotals.economicValue).toString(),
      unit: "قيمة",
      title: "القيمية الاقتصادية من التطوع",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (statistics.globalTotals.economicValue / 1000) * 100
      ),
    },
    {
      value: statistics.globalTotals.trainers.toString(),
      unit: "مدربة نشطة",
      title: "المدربات النشطات",
      color: "#68C35C",
      percentage: Math.min(100, (statistics.globalTotals.trainers / 100) * 100),
    },
  ];

  // Create regions data from regional statistics
  const regionsData = statistics.regionStats.map((regionStat) => ({
    name: regionStat.regionName,
    value: Math.round(regionStat.volunteerHoursPercentage),
  }));

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
    labels: regionsData.map((region) => region.name),
    datasets: [
      {
        label: "Green Segment",
        data: regionsData.map((region) => region.value),
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
        data: regionsData.map((region) => Math.max(10, region.value - 15)),
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

  return (
    <main className="flex flex-col mx-auto gap-9 max-lg:px-[10px] lg:px-[112px]">
      <div className="flex flex-col items-baseline gap-6 [direction:rtl] md:flex-row lg:mt-[76px]">
        {/* المنطقة (Area) */}
        <div className="flex flex-col w-1/3 max-lg:w-full">
          <div className="mb-2 text-start text-sm text-gray-500">المنطقة</div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">الكل</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <img
              src={arrowDown}
              alt="Arrow Down"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ml-1"
            />
          </div>
        </div>

        {/* إدارة التعليم (Education Management) */}
        <div className="flex flex-col w-1/3 max-lg:w-full">
          <div className="mb-2 text-start text-sm text-gray-500">
            إدارة التعليم
          </div>
          <div className="relative">
            <select
              className={`appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10 ${
                !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
              }`}
              value={selectedEduAdmin}
              onChange={(e) => setSelectedEduAdmin(e.target.value)}
              disabled={!selectedRegion}
            >
              <option value="">الكل</option>
              {filteredEduAdmins.map((eduAdmin) => (
                <option key={eduAdmin.id} value={eduAdmin.id}>
                  {eduAdmin.name}
                </option>
              ))}
            </select>
            <img
              src={arrowDown}
              alt="Arrow Down"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ml-1"
            />
          </div>
        </div>

        {/* المدرسة (School) */}
        <div className="flex flex-col w-1/3 max-lg:w-full">
          <div className="mb-2 text-start text-sm text-gray-500">المدرسة</div>
          <div className="relative">
            <select
              className={`appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10 ${
                !selectedEduAdmin ? "opacity-50 cursor-not-allowed" : ""
              }`}
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              disabled={!selectedEduAdmin}
            >
              <option value="">الكل</option>
              {filteredSchools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
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
            className="flex h-[142px] max-lg:w-full lg:w-auto items-center justify-center gap-6 p-6 relative flex-1 grow bg-white rounded-xl border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs mb-4 lg:mb-0"
          >
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 p-0 w-full">
              <div className="relative w-[120px] h-[120px]">
                <Doughnut
                  data={getRadialChartDataTotal(stat.percentage, stat.color)}
                  options={radialChartOptions}
                />
              </div>

              <div className="flex flex-col items-end md:items-end gap-6 relative flex-1 grow">
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
                className="relative w-[54px] h-[54px]"
                alt={stat.iconAlt}
                src={stat.icon}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex lg:flex-row max-lg:flex-col max-lg:items-center items-start justify-end gap-9">
        {/* Education Departments Card */}
        <div className="flex flex-col gap-6 max-lg:w-full">
          <div className="flex flex-col items-start gap-5 w-full">
            <div className="flex items-start gap-4 w-full">
              <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                <h2 className="self-stretch font-bold text-[#181d27] text-lg tracking-[0] leading-7 [direction:rtl]">
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
                      <div className="self-stretch font-bold text-[#181d27] text-base leading-6 tracking-[0] [direction:rtl]">
                        إدارات التعليم
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-end gap-6 w-full">
                  <div className="inline-flex items-start gap-4">
                    <div className="relative w-[200px] h-[200px]">
                      <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-1">
                    {educationDepartments.map((department, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-end gap-2 w-full"
                      >
                        <div className="w-fit mt-[-1.00px] font-normal text-[#535861] text-sm text-left leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
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
        <div className="flex flex-col w-full items-start gap-6">
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
      <section className="flex flex-col gap-6 w-full">
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
              <h2 className="font-bold text-[#181d27] text-lg leading-7 [direction:rtl]">
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
  );
}
