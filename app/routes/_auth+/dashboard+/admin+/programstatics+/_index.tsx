import React, { useState, useEffect } from "react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
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
import SchoolIcon from "../../../../../assets/icons/schools.svg";
import students from "../../../../../assets/icons/students.svg";
import teacher from "../../../../../assets/icons/teachers.svg";
import regionIcon from "../../../../../assets/icons/region.svg";
import usersIcon from "../../../../../assets/icons/users-03.svg";

import statisticsService from "~/db/statistics/statistics.server";
import eduAdminService from "~/db/eduAdmin/eduAdmin.server";
import schoolService from "~/db/school/school.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { DashStatistics, School, QUser } from "~/types/types";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Check authentication
    const user = await getAuthenticated({ request, context });
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUrl = context.cloudflare.env.DATABASE_URL;
    const url = new URL(request.url);

    // Get filter parameters from query string
    const regionId = url.searchParams.get("regionId") || undefined;
    const eduAdminId = url.searchParams.get("eduAdminId") || undefined;
    const schoolId = url.searchParams.get("schoolId") || undefined;

    console.log("Loading statistics with filters:", {
      regionId,
      eduAdminId,
      schoolId,
    });

    // Use the new statistics service
    const [
      dashStatistics,
      regionalBreakdown,
      eduAdminBreakdown,
      schoolBreakdown,
    ] = await Promise.all([
      statisticsService.getAdminDashboardDataStatistics(dbUrl, {
        regionId,
        eduAdminId,
        schoolId,
      }),
      statisticsService.getRegionalBreakdown(dbUrl),
      regionId 
        ? eduAdminService.getEduAdminsByRegion(regionId, dbUrl).then(res => res.data || [])
        : statisticsService.getEduAdminBreakdown(dbUrl),
      eduAdminId 
        ? schoolService.getSchoolsByEduAdmin(eduAdminId, dbUrl).then(res => res.data || [])
        : Promise.resolve([]),
    ]);

    return Response.json({
      statistics: dashStatistics,
      regionalBreakdown,
      eduAdminBreakdown,
      schoolBreakdown,
      filters: { regionId, eduAdminId, schoolId },
    });
  } catch (error) {
    console.error("Error loading statistics:", error);
    return Response.json(
      {
        error: "Failed to load data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Register Chart.js components on client side only
if (typeof window !== 'undefined') {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
  );
}

export default function ProgramStatisticsContent(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loaderData = useLoaderData<{
    statistics: DashStatistics;
    regionalBreakdown: any[];
    eduAdminBreakdown: any[];
    schoolBreakdown: any[];
    filters?: {
      regionId?: string;
      eduAdminId?: string;
      schoolId?: string;
    };
  }>();

  console.log("Loader data:", loaderData);

  // Get filter values from URL parameters
  const selectedRegion = searchParams.get("regionId") || "";
  const selectedEduAdmin = searchParams.get("eduAdminId") || "";
  const selectedSchool = searchParams.get("schoolId") || "";

  const [chartsLoaded, setChartsLoaded] = useState<boolean>(false);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // Set charts as loaded after component mounts (client-side only)
  useEffect(() => {
    // Ensure we're on client side and Chart.js is available
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setChartsLoaded(true);
      }, 100); // Reduced delay to minimize hydration mismatch
      return () => clearTimeout(timer);
    }
  }, []);

  // Show loading when filters change
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 800); // Show loading for filter changes
    return () => clearTimeout(timer);
  }, [selectedRegion, selectedEduAdmin, selectedSchool]);

  // Handle potential error state
  if (!loaderData || "error" in loaderData) {
    return (
      <div className="bg-[#f9f9f9] p-6">
        <div className="text-center text-red-500">
          فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      </div>
    );
  }

  const { statistics, regionalBreakdown, eduAdminBreakdown, schoolBreakdown } =
    loaderData || {};

  // Safety checks for data arrays and statistics structure
  const safeRegionalBreakdown = Array.isArray(regionalBreakdown) ? regionalBreakdown : [];
  const safeEduAdminBreakdown = Array.isArray(eduAdminBreakdown) ? eduAdminBreakdown : [];
  const safeSchoolBreakdown = Array.isArray(schoolBreakdown) ? schoolBreakdown : [];

  // Debug education departments data
  console.log("EduAdmin Breakdown:", safeEduAdminBreakdown);
  console.log("Regional Breakdown:", safeRegionalBreakdown);

  // Ensure statistics has the proper structure with fallback values
  const safeStatistics = statistics || {
    regionsTotal: 0,
    regionsFiltered: 0,
    eduAdminsTotal: 0,
    eduAdminsFiltered: 0,
    schoolsTotal: 0,
    schoolsFiltered: 0,
    reportsTotal: 0,
    reportsFiltered: 0,
    trainersTotal: 0,
    trainersFiltered: 0,
    volunteerHoursTotal: 0,
    volunteerHoursFiltered: 0,
    economicValueTotal: 0,
    economicValueFiltered: 0,
    volunteerOpportunitiesTotal: 0,
    volunteerOpportunitiesFiltered: 0,
    activitiesCountTotal: 0,
    activitiesCountFiltered: 0,
    volunteerCountTotal: 0,
    volunteerCountFiltered: 0,
    skillsEconomicValueTotal: 0,
    skillsEconomicValueFiltered: 0,
    skillsTrainedCountTotal: 0,
    skillsTrainedCountFiltered: 0,
  };

  // Handle filter changes
  const handleRegionChange = (regionId: string) => {
    setIsFiltering(true); // Start loading immediately
    const params = new URLSearchParams();
    if (regionId) {
      params.set("regionId", regionId);
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleEduAdminChange = (eduAdminId: string) => {
    setIsFiltering(true); // Start loading immediately
    const params = new URLSearchParams();
    if (selectedRegion) {
      params.set("regionId", selectedRegion);
    }
    if (eduAdminId) {
      params.set("eduAdminId", eduAdminId);
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleSchoolChange = (schoolId: string) => {
    setIsFiltering(true); // Start loading immediately
    const params = new URLSearchParams();
    if (selectedRegion) {
      params.set("regionId", selectedRegion);
    }
    if (selectedEduAdmin) {
      params.set("eduAdminId", selectedEduAdmin);
    }
    if (schoolId) {
      params.set("schoolId", schoolId);
    }
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Filter eduAdmins based on selected region
  const filteredEduAdmins = safeEduAdminBreakdown;

  // Filter schools based on selected eduAdmin - now comes from server
  const filteredSchools = safeSchoolBreakdown;

  // Calculate stats data from real data
  const statsData = [
    {
      id: 1,
      icon: SchoolIcon,
      iconAlt: "School",
      title: "عدد المدارس",
      value: safeStatistics.schoolsFiltered.toString(),
      max: "100",
      color: "#539c4a",
      percentage:
        !selectedRegion && !selectedEduAdmin && !selectedSchool
          ? 100
          : Math.min(
              100,
              (safeStatistics.schoolsFiltered /
                Math.max(safeStatistics.schoolsTotal, 1)) *
                100
            ),
    },
    {
      id: 2,
      icon: teacher,
      iconAlt: "Teacher",
      title: "عدد المعلمات",
      value: safeStatistics.trainersFiltered.toString(),
      max: "200",
      color: "#199491",
      percentage:
        !selectedRegion && !selectedEduAdmin && !selectedSchool
          ? 100
          : Math.min(
              100,
              (safeStatistics.trainersFiltered /
                Math.max(safeStatistics.trainersTotal, 1)) *
                100
            ),
    },
    {
      id: 3,
      icon: students,
      iconAlt: "Students",
      title: "عدد الطالبات",
      value: safeStatistics.volunteerCountFiltered.toString(),
      max: "5000",
      color: "#30B0C7",
      percentage:
        !selectedRegion && !selectedEduAdmin && !selectedSchool
          ? 100
          : Math.min(
              100,
              (safeStatistics.volunteerCountFiltered /
                Math.max(safeStatistics.volunteerCountTotal, 1)) *
                100
            ),
    },
    {
      id: 4,
      icon: regionIcon,
      iconAlt: "Region",
      title: "عدد المناطق",
      value: safeStatistics.regionsFiltered.toString(),
      max: "20",
      color: "#004E5C",
      percentage:
        !selectedRegion && !selectedEduAdmin && !selectedSchool
          ? 100
          : Math.min(
              100,
              (safeStatistics.regionsFiltered /
                Math.max(safeStatistics.regionsTotal, 1)) *
                100
            ),
    },
    {
      id: 5,
      icon: usersIcon,
      iconAlt: "Education Departments",
      title: "عدد إدارات التعليم",
      value: safeStatistics.eduAdminsFiltered.toString(),
      max: "50",
      color: "#AF52DE",
      percentage:
        !selectedRegion && !selectedEduAdmin && !selectedSchool
          ? 100
          : Math.min(
              100,
              (safeStatistics.eduAdminsFiltered /
                Math.max(safeStatistics.eduAdminsTotal, 1)) *
                100
            ),
    },
  ];

  // Create education departments data from eduAdmin breakdown
  const educationDepartments = safeEduAdminBreakdown
    .slice(0, 8)
    .map((stat: any, index: number) => {
      // Use multiple metrics to calculate a meaningful value
      const volunteerCount = stat.volunteerCount || 0;
      const schoolCount = stat.schoolCount || 0;
      const trainerCount = stat.trainerCount || 0;
      const reportCount = stat.reportCount || 0;
      
      // Calculate a composite score or use the most relevant metric
      const value = volunteerCount > 0 ? volunteerCount : 
                   schoolCount > 0 ? schoolCount * 10 : // Scale schools for better visualization
                   trainerCount > 0 ? trainerCount * 5 : // Scale trainers
                   reportCount > 0 ? reportCount :
                   Math.round(stat.volunteerHours || 0); // Fallback to volunteer hours
      
      console.log(`Education Department ${stat.name}:`, {
        volunteerCount,
        schoolCount,
        trainerCount,
        reportCount,
        volunteerHours: stat.volunteerHours,
        calculatedValue: value
      });
      
      return {
        name: stat.name,
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
        value: value,
      };
    });

  // Create reports metrics data from filtered statistics
  const reportMetrics = [
    {
      value: safeStatistics.skillsTrainedCountFiltered.toString(),
      unit: "مهارة",
      title: "المهارات المدرب عليها",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.skillsTrainedCountFiltered / 100) * 100
      ),
    },
    {
      value: Math.round(safeStatistics.volunteerHoursFiltered).toString(),
      unit: "ساعة",
      title: "الساعات التطوعية",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.volunteerHoursFiltered / 1000) * 100
      ),
    },
    {
      value: safeStatistics.activitiesCountFiltered.toString(),
      unit: "نشاط",
      title: "الأنشطة المنفذة",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.activitiesCountFiltered / 100) * 100
      ),
    },
    {
      value: Math.round(safeStatistics.skillsEconomicValueFiltered).toString(),
      unit: "مهارة",
      title: "القيمة الاقتصادية للمهارات",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.skillsEconomicValueFiltered / 1000) * 100
      ),
    },
    {
      value: Math.round(safeStatistics.volunteerHoursFiltered).toString(),
      unit: "ساعة تطوعية",
      title: "الساعات التطوعية المحققة",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.volunteerHoursFiltered / 10000) * 100
      ),
    },
    {
      value: Math.round(safeStatistics.economicValueFiltered).toString(),
      unit: "قيمة",
      title: "القيمية الاقتصادية من التطوع",
      color: "#68C35C",
      percentage: Math.min(
        100,
        (safeStatistics.economicValueFiltered / 1000) * 100
      ),
    },
    {
      value: safeStatistics.trainersFiltered.toString(),
      unit: "مدربة نشطة",
      title: "المدربات النشطات",
      color: "#68C35C",
      percentage: Math.min(100, (safeStatistics.trainersFiltered / 100) * 100),
    },
  ];

  // Create regions data from regional breakdown with max values
  const maxVolunteerHours = Math.max(...safeRegionalBreakdown.map((region: any) => region?.volunteerHours || 0), 1);
  const regionsData = safeRegionalBreakdown.map((regionStat: any) => {
    const volunteerHours = Math.round(regionStat?.volunteerHours || 0);
    return {
      name: regionStat?.name || 'منطقة غير محددة',
      value: volunteerHours,
      maxValue: maxVolunteerHours,
    };
  });

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
        circumference: 180,
        rotation: 270,
        borderRadius: [0, 0],
        spacing: 0,
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
    labels: educationDepartments.map((dept: any) => dept.name),
    datasets: [
      {
        data: educationDepartments.map((dept: any) => dept.value),
        backgroundColor: educationDepartments.map((dept: any) => dept.color),
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
    labels: regionsData.map((region: any) => region.name),
    datasets: [
      {
        label: "Green Segment",
        data: regionsData.map((region: any) => region.value),
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
        data: regionsData.map((region: any) => Math.max(0, region.maxValue - region.value)),
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
        max: maxVolunteerHours,
        stacked: true,
        ticks: {
          stepSize: Math.ceil(maxVolunteerHours / 5),
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
              return `${context.parsed.y} ساعة تطوعية`;
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <main className="flex flex-col mx-auto gap-6 sm:gap-9 px-4 sm:px-6 md:px-8 lg:px-[30px]">
      <div className="flex flex-col items-baseline gap-4 sm:gap-6 [direction:rtl] md:flex-row mt-8 sm:mt-12">
        {/* المنطقة (Area) */}
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-2 text-start text-sm text-gray-500">المنطقة</div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              <option value="">الكل</option>
              {safeRegionalBreakdown.map((region: any) => (
                <option key={region?.id || Math.random()} value={region?.id || ''}>
                  {region?.name || 'منطقة غير محددة'}
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
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-2 text-start text-sm text-gray-500">
            إدارة التعليم
          </div>
          <div className="relative">
            <select
              className={`appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10 ${
                !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
              }`}
              value={selectedEduAdmin}
              onChange={(e) => handleEduAdminChange(e.target.value)}
              disabled={!selectedRegion}
            >
              <option value="">الكل</option>
              {filteredEduAdmins.map((eduAdmin) => (
                <option key={eduAdmin?.id || Math.random()} value={eduAdmin?.id || ''}>
                  {eduAdmin?.name || 'إدارة تعليم غير محددة'}
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
        <div className="flex flex-col w-full md:w-1/3">
          <div className="mb-2 text-start text-sm text-gray-500">المدرسة</div>
          <div className="relative">
            <select
              className={`appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10 ${
                !selectedEduAdmin ? "opacity-50 cursor-not-allowed" : ""
              }`}
              value={selectedSchool}
              onChange={(e) => handleSchoolChange(e.target.value)}
              disabled={!selectedEduAdmin}
            >
              <option value="">الكل</option>
              {filteredSchools.map((school) => (
                <option key={school?.id || Math.random()} value={school?.id || ''}>
                  {school?.name || 'مدرسة غير محددة'}
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
      <div className="mt-12 sm:mt-16 ">
        <div className="flex flex-col items-start gap-5 w-full mb-3">
          <div className="flex items-start gap-4 w-full">
            <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
              <h2 className="self-stretch font-bold text-[#181d27] text-base sm:text-lg tracking-[0] leading-6 sm:leading-7 [direction:rtl]">
                الإجمالي
              </h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-[27px] w-full [direction:rtl]">
          {statsData.map((stat) => (
            <div
              key={stat.id}
              className="flex min-h-[100px] sm:h-[142px] w-full items-center justify-center gap-3 sm:gap-6 p-4 sm:p-6 relative bg-white rounded-xl border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs"
            >
              <div className="flex flex-col sm:flex-row lg:flex-row items-center justify-center gap-3 sm:gap-6 p-0 w-full">
                <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[100px] lg:h-[100px]">
                  {chartsLoaded && !isFiltering ? (
                    <>
                      <Doughnut
                        data={getRadialChartDataTotal(
                          stat.percentage,
                          stat.color
                        )}
                        options={radialChartOptions}
                      />
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-[#181d27] text-xs sm:text-sm lg:text-base font-bold">
                          {Math.round(stat.percentage)}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#17b169] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-end md:items-end gap-3 sm:gap-6 relative flex-1 grow">
                  <div className="self-stretch mt-[-1.00px] font-bold text-sm sm:text-base leading-5 sm:leading-6 relative text-[#181d27] tracking-[0] [direction:rtl] text-center sm:text-right">
                    {stat.title}
                  </div>

                  <div className="flex flex-col items-start gap-2 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="flex items-end justify-center sm:justify-center md:justify-end gap-4 relative self-stretch w-full flex-[0_0_auto]">
                      <div className="relative flex-1 mt-[-1.00px] font-bold text-[#181d27] text-2xl sm:text-3xl lg:text-4xl text-center sm:text-center md:text-right tracking-[0] leading-8 sm:leading-9 lg:leading-[38px]">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  className="relative w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] lg:w-[54px] lg:h-[54px]"
                  alt={stat.iconAlt}
                  src={stat.icon}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
        {/* Education Departments Card */}
        <div className="flex flex-col gap-4 sm:gap-6 w-full xl:w-auto xl:min-w-[350px] xl:max-w-[400px]">
          <div className="flex flex-col items-start gap-5 w-full">
            <div className="flex items-start gap-4 w-full">
              <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                <h2 className="self-stretch font-bold text-[#181d27] text-base sm:text-lg tracking-[0] leading-6 sm:leading-7 [direction:rtl]">
                  إدارات التعليم
                </h2>
              </div>
            </div>
          </div>

          <div className="h-[280px] sm:h-[321px] w-full overflow-hidden border-[#e9e9eb] shadow-shadows-shadow-xs bg-white rounded-xl">
            <div className="p-0">
              <div className="flex flex-col items-end gap-4 sm:gap-6 p-4 sm:p-6 w-full">
                <div className="flex flex-col items-start gap-5 w-full">
                  <div className="flex items-start gap-4 w-full">
                    <div className="inline-flex flex-col items-start">
                      <MoreVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                      <div className="self-stretch font-bold text-[#181d27] text-sm sm:text-base leading-5 sm:leading-6 tracking-[0] [direction:rtl]">
                        إدارات التعليم
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-end gap-4 sm:gap-6 w-full">
                  <div className="inline-flex items-start gap-4">
                    <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] lg:w-[180px] lg:h-[180px]">
                      {chartsLoaded ? (
                        <Doughnut
                          data={doughnutData}
                          options={doughnutOptions}
                        />
                      ) : (
                        <div className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] lg:w-[180px] lg:h-[180px] bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-[#17b169] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-1 flex-1 min-w-0">
                    {educationDepartments.map(
                      (department: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start justify-center sm:justify-end gap-2 w-full"
                        >
                          <div className="w-fit mt-[-1.00px] font-normal text-[#535861] text-xs sm:text-sm text-center sm:text-left leading-4 sm:leading-5 whitespace-nowrap tracking-[0] [direction:rtl] truncate">
                            {department.name}
                          </div>
                          <div className="inline-flex items-start gap-2.5 pt-1.5 pb-0 px-0">
                            <div
                              className="relative w-2 h-2 rounded flex-shrink-0"
                              style={{ backgroundColor: department.color }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="flex flex-col w-full items-start gap-4 sm:gap-6">
          {/* Header section */}
          <div className="flex flex-col items-start gap-5 w-full">
            <div className="flex items-start gap-4 w-full">
              <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                <h2 className="self-stretch font-bold text-[#181d27] text-base sm:text-lg tracking-[0] leading-6 sm:leading-7 [direction:rtl]">
                  التقارير
                </h2>
              </div>
            </div>
          </div>

          {/* Metrics section - optimized for all screen sizes */}
          <div className="w-full border-[#e9eaeb] bg-white rounded-xl">
            <div className="p-3 sm:p-4 lg:p-6 flex justify-center lg:justify-end xl:min-h-[320px]">
              <div className="flex flex-wrap justify-center w-full max-w-full gap-y-3 sm:gap-y-4 lg:gap-y-5 gap-x-2 sm:gap-x-3 lg:gap-x-4 xl:gap-x-6">
                {reportMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 w-[calc(50%-4px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-12px)] min-w-[120px] max-w-[160px]"
                  >
                    <div className="relative w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36 min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[110px] xl:min-h-[120px] h-auto flex items-center justify-center">
                      {chartsLoaded ? (
                        <>
                          <div className="w-full h-[50px] sm:h-[60px] md:h-[65px] lg:h-[70px] xl:h-[80px]">
                            <Doughnut
                              data={getRadialChartDataReports(
                                metric.percentage,
                                metric.color
                              )}
                              options={radialChartOptions}
                            />
                          </div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <div className="mt-8 text-[#535861] text-[7px] sm:text-[8px] md:text-xs lg:text-sm font-medium mb-0.5">
                              {metric.unit}
                            </div>
                            <div className="text-[#181d27] text-lg sm:text-xl md:text-xl lg:text-1xl xl:text-xl font-bold leading-tight">
                              {metric.value}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36 h-[50px] sm:h-[60px] md:h-[65px] lg:h-[70px] xl:h-[80px] bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 border-2 border-[#17b169] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="w-full font-medium text-[#181d27] text-[11px] sm:text-xs md:text-sm lg:text-base text-center tracking-[0] leading-[12px] sm:leading-[13px] md:leading-[15px] lg:leading-[16px] [direction:rtl] px-0.5 sm:px-1">
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
      <section className="flex flex-col gap-4 sm:gap-6 w-full">
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-start gap-4 w-full h-full">
            <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
              <h2 className="font-bold text-[#181d27] text-base sm:text-lg leading-6 sm:leading-7 [direction:rtl]">
                المناطق
              </h2>
            </div>
          </div>
        </div>

        <div className="border border-[#e9eaeb] rounded-xl bg-white p-4 sm:p-6">
          <div className="h-[180px] sm:h-[200px] lg:h-[228px]">
            {chartsLoaded ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="h-[180px] sm:h-[200px] lg:h-[228px] bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#17b169] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    جاري تحميل الرسم البياني...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
