import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "@remix-run/react";
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
import { Bar } from "react-chartjs-2";
import arrowDown from "../../assets/icons/arrow-down-gray.svg";
import { InfoTooltip } from "~/components/ui/info-tooltip";

// Register Chart.js components on client side only
if (typeof window !== "undefined") {
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

interface LeaderboardContentProps {
  teachers: any[];
  schools: any[];
  regionRankings: any[];
  allRegions: any[];
  filters: {
    regionId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function LeaderboardContent({
  teachers,
  schools,
  regionRankings,
  allRegions,
  filters,
}: LeaderboardContentProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [activeTab, setActiveTab] = useState<"teachers" | "schools">("teachers");
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => setChartsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    setSearchParams(params);
  };

  const handleApplyDateFilter = () => {
    updateFilters({ startDate, endDate });
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = filters.startDate || filters.endDate || filters.regionId;

  // Summary stats
  const totalTeachers = teachers.length;
  const totalPoints = teachers.reduce((s: number, t: any) => s + (t.points || 0), 0);
  const avgPoints = totalTeachers > 0 ? Math.round(totalPoints / totalTeachers) : 0;
  const totalSchools = schools.length;

  const summaryStats = [
    { title: "عدد المعلمات", value: totalTeachers, unit: "معلمة", color: "#17b169" },
    { title: "إجمالي النقاط", value: totalPoints, unit: "نقطة", color: "#006173" },
    { title: "متوسط النقاط", value: avgPoints, unit: "نقطة/معلمة", color: "#199491" },
    { title: "عدد المدارس", value: totalSchools, unit: "مدرسة", color: "#539C4A" },
  ];

  // Medal colors for top 3
  const medalColors = [
    { bg: "from-[#FFF9E6] to-white", border: "border-[#F5D442]", text: "text-[#7A5C00]", badge: "bg-[#F5D442]" },
    { bg: "from-[#F3F4F6] to-white", border: "border-[#9CA3AF]", text: "text-[#4B5563]", badge: "bg-[#E5E7EB]" },
    { bg: "from-[#FFF1E6] to-white", border: "border-[#D97706]", text: "text-[#92400E]", badge: "bg-[#FDE8CD]" },
  ];

  const avatarColors = ["#17b169", "#006173", "#199491", "#539C4A", "#D97706", "#7C3AED", "#DC2626"];

  // Bar chart for top 10 teachers
  const top10Teachers = teachers.slice(0, 10);
  const teacherBarData = {
    labels: top10Teachers.map((t: any) => t.name),
    datasets: [
      {
        label: "الطالبات (×4)",
        data: top10Teachers.map((t: any) => t.volunteerCount * 4),
        backgroundColor: "#17b169",
        borderRadius: 4,
      },
      {
        label: "الفرص (×2)",
        data: top10Teachers.map((t: any) => t.volunteerOpportunities * 2),
        backgroundColor: "#006173",
        borderRadius: 4,
      },
      {
        label: "الساعات (×1)",
        data: top10Teachers.map((t: any) => t.volunteerHours * 1),
        backgroundColor: "#199491",
        borderRadius: 4,
      },
    ],
  };

  const teacherBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11 }, autoSkip: false },
      },
    },
    plugins: {
      legend: { display: true, position: "top" as const, rtl: true, labels: { font: { size: 11 }, usePointStyle: true, padding: 15 } },
      tooltip: {
        rtl: true,
        textDirection: "rtl",
        callbacks: {
          afterBody: function (context: any) {
            const idx = context[0]?.dataIndex;
            if (idx !== undefined && top10Teachers[idx]) {
              const t = top10Teachers[idx];
              return [
                `الإجمالي: ${t.points} نقطة`,
                `الطالبات: ${t.volunteerCount}`,
                `الفرص: ${t.volunteerOpportunities}`,
                `الساعات: ${t.volunteerHours}`,
              ];
            }
            return [];
          },
        },
      },
    },
  };

  // Bar chart for top 10 schools
  const top10Schools = schools.slice(0, 10);
  const schoolBarData = {
    labels: top10Schools.map((s: any) => s.name),
    datasets: [
      {
        label: "إجمالي النقاط",
        data: top10Schools.map((s: any) => s.totalPoints),
        backgroundColor: "#17b169",
        borderRadius: 4,
      },
    ],
  };

  const schoolBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 }, autoSkip: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        textDirection: "rtl",
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            if (idx !== undefined && top10Schools[idx]) {
              const s = top10Schools[idx];
              return `${s.totalPoints.toLocaleString("ar-SA")} نقطة (${s.teacherCount} معلمة)`;
            }
            return "";
          },
        },
      },
    },
  };

  // Bar chart for regions
  const top10Regions = regionRankings.slice(0, 10);
  const regionBarData = {
    labels: top10Regions.map((r: any) => r.name),
    datasets: [
      {
        label: "إجمالي النقاط",
        data: top10Regions.map((r: any) => r.totalPoints),
        backgroundColor: "#006173",
        borderRadius: 4,
      },
    ],
  };

  const regionBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 }, autoSkip: false } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        textDirection: "rtl",
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            if (idx !== undefined && top10Regions[idx]) {
              const r = top10Regions[idx];
              return `${r.totalPoints.toLocaleString("ar-SA")} نقطة (${r.schoolCount} مدرسة، ${r.teacherCount} معلمة)`;
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <div className="bg-[#f9f9f9]">
      {/* Page Header */}
      <div className="py-6 [direction:rtl] max-lg:px-[10px] lg:mr-[50px]">
        <div className="w-full py-6 rounded-xl">
          <div className="flex flex-col items-start mb-2 max-lg:items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              لوحة المتصدرين
              <InfoTooltip text="معادلة النقاط: (4 × عدد الطالبات) + (2 × عدد الفرص التطوعية) + (1 × عدد الساعات التطوعية). يتم ترتيب المعلمات والمدارس والمناطق حسب إجمالي النقاط." />
            </h1>
            <p className="text-lg font-normal text-[#535862] mb-3">ترتيب المعلمات والمدارس والمناطق حسب نظام النقاط</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-[#535862]">
              <span className="font-medium text-[#717680]">معادلة النقاط:</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#17b169] inline-block" />طالبة = <b className="text-[#181d27]">4</b></span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#006173] inline-block" />فرصة = <b className="text-[#181d27]">2</b></span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#199491] inline-block" />ساعة = <b className="text-[#181d27]">1</b></span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex flex-col mx-auto gap-6 sm:gap-9 px-4 sm:px-6 md:px-8 lg:px-[30px] pb-12">

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-baseline gap-4 sm:gap-6 [direction:rtl]">
          <div className="flex flex-col w-full md:w-1/4">
            <div className="mb-2 text-start text-sm text-gray-500">من تاريخ</div>
            <div
              className="relative cursor-pointer"
              onClick={() => startDateRef.current?.showPicker?.()}
            >
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              />
              <div className="flex items-center justify-between bg-white border border-gray-200 text-sm rounded-md w-full p-2.5 hover:border-[#006173] transition-colors">
                <svg className="w-4 h-4 text-[#717680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={startDate ? "text-[#181d27]" : "text-[#9CA3AF]"}>
                  {startDate || "اختر تاريخ"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <div className="mb-2 text-start text-sm text-gray-500">إلى تاريخ</div>
            <div
              className="relative cursor-pointer"
              onClick={() => endDateRef.current?.showPicker?.()}
            >
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              />
              <div className="flex items-center justify-between bg-white border border-gray-200 text-sm rounded-md w-full p-2.5 hover:border-[#006173] transition-colors">
                <svg className="w-4 h-4 text-[#717680]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={endDate ? "text-[#181d27]" : "text-[#9CA3AF]"}>
                  {endDate || "اختر تاريخ"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <div className="mb-2 text-start text-sm text-gray-500">المنطقة</div>
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 text-[#717680] text-sm rounded-md focus:ring-[#006173] focus:border-[#006173] block w-full p-2.5 pl-10"
                value={filters.regionId || ""}
                onChange={(e) => updateFilters({ regionId: e.target.value })}
              >
                <option value="">جميع المناطق</option>
                {allRegions.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <img src={arrowDown} alt="" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto md:self-end">
            <button
              onClick={handleApplyDateFilter}
              className="bg-[#006173] text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-[#004e5c] transition-colors shadow-sm"
            >
              تطبيق
            </button>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="border border-gray-200 bg-white text-[#414651] px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 [direction:rtl]">
          <button
            onClick={() => setActiveTab("teachers")}
            className={`min-h-10 px-5 py-2 border border-[#D5D7DA] transition-colors rounded-r-md ${
              activeTab === "teachers"
                ? "bg-white shadow-sm z-10 border-b-white"
                : "bg-[#F8F9FA] hover:bg-white z-[1]"
            }`}
          >
            <div className="flex items-center gap-2 flex-row-reverse">
              {activeTab === "teachers" && <div className="w-2 h-2 bg-[#17b169] rounded" />}
              <span className={`font-bold text-sm whitespace-nowrap ${
                activeTab === "teachers" ? "text-[#17b169]" : "text-[#414651]"
              }`}>أفضل معلمة</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("schools")}
            className={`min-h-10 px-5 py-2 border border-[#D5D7DA] transition-colors rounded-l-md ${
              activeTab === "schools"
                ? "bg-white shadow-sm z-10 border-b-white"
                : "bg-[#F8F9FA] hover:bg-white z-[1]"
            }`}
          >
            <div className="flex items-center gap-2 flex-row-reverse">
              {activeTab === "schools" && <div className="w-2 h-2 bg-[#17b169] rounded" />}
              <span className={`font-bold text-sm whitespace-nowrap ${
                activeTab === "schools" ? "text-[#17b169]" : "text-[#414651]"
              }`}>أفضل مدرسة ومنطقة</span>
            </div>
          </button>
        </div>

        {/* TEACHERS TAB */}
        {activeTab === "teachers" && (
          <div className="flex flex-col gap-6 sm:gap-9 [direction:rtl]">
            <h2 className="font-bold text-[#181d27] text-base sm:text-lg leading-6 sm:leading-7 flex items-center gap-1">
              ترتيب المعلمات
              <InfoTooltip text="إجمالي النقاط = (4 × عدد الطالبات) + (2 × عدد الفرص) + (1 × عدد الساعات). المعلمة التي تحصل على أعلى مجموع نقاط تتصدر الترتيب." />
            </h2>

            {teachers.length > 0 ? (
              <>
                {/* Top 3 Leaderboard */}
                <div className="flex flex-col gap-2">
                  {teachers.slice(0, 3).map((teacher: any, i: number) => {
                    const styles = [
                      { bg: "bg-gradient-to-l from-[#FFF9E6] via-[#FFFDF5] to-white", border: "border-[#F5D442]", rank: "bg-[#F5D442] text-[#7A5C00]", icon: "\uD83E\uDD47", glow: "shadow-[0_0_12px_rgba(245,212,66,0.3)]" },
                      { bg: "bg-gradient-to-l from-[#F3F4F6] via-[#FAFAFA] to-white", border: "border-[#C0C5CE]", rank: "bg-[#E5E7EB] text-[#4B5563]", icon: "\uD83E\uDD48", glow: "shadow-sm" },
                      { bg: "bg-gradient-to-l from-[#FFF1E6] via-[#FFFAF5] to-white", border: "border-[#D97706]", rank: "bg-[#FDE8CD] text-[#92400E]", icon: "\uD83E\uDD49", glow: "shadow-sm" },
                    ][i];
                    return (
                      <div key={teacher.id} className={`flex items-center gap-3 sm:gap-4 ${styles.bg} rounded-xl border ${styles.border} px-4 py-3 ${styles.glow} transition-all hover:scale-[1.01]`}>
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${styles.rank} flex items-center justify-center text-base sm:text-lg font-extrabold shrink-0`}>
                          {styles.icon}
                        </div>
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shrink-0 shadow" style={{ backgroundColor: avatarColors[i % avatarColors.length] }}>
                          {teacher.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-sm sm:text-base text-[#181d27] truncate">{teacher.name}</span>
                          <span className="text-xs text-[#717680] truncate">{teacher.schoolName}</span>
                        </div>
                        <div className="flex flex-col items-center shrink-0 mr-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#006173]">{teacher.points.toLocaleString("ar-SA")}</span>
                          <span className="text-[10px] text-[#9CA3AF]">نقطة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bar Chart */}
                <section className="flex flex-col gap-4 sm:gap-6 w-full">
                  <div className="border border-[#e9eaeb] rounded-xl bg-white p-4 sm:p-6">
                    <div className="flex items-start gap-4 w-full mb-4">
                      <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                        <div className="self-stretch font-bold text-[#181d27] text-sm sm:text-base leading-5 sm:leading-6 tracking-[0] [direction:rtl] flex items-center gap-1">
                          أفضل ١٠ معلمات - توزيع النقاط
                          <InfoTooltip text="يعرض توزيع النقاط لأفضل ١٠ معلمات. الأخضر = نقاط الطالبات (×4)، الأزرق الداكن = نقاط الفرص (×2)، الأزرق الفاتح = نقاط الساعات (×1)" />
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] sm:h-[350px]">
                      {chartsLoaded ? (
                        <Bar data={teacherBarData} options={teacherBarOptions} />
                      ) : (
                        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#17b169] border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-600 text-xs sm:text-sm">جاري تحميل الرسم البياني...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Teachers Table */}
                <div className="bg-white rounded-xl border border-[#e9eaeb] shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-[#e9eaeb]">
                    <h3 className="text-sm sm:text-base font-bold text-[#181d27] [direction:rtl]">جميع المعلمات ({teachers.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F9FA]">
                        <tr className="text-[#535862]">
                          <th className="py-3 px-4 text-right font-medium">#</th>
                          <th className="py-3 px-4 text-right font-medium">الاسم</th>
                          <th className="py-3 px-4 text-right font-medium">المدرسة</th>
                          <th className="py-3 px-4 text-right font-medium">المنطقة</th>
                          <th className="py-3 px-4 text-right font-medium">الطالبات</th>
                          <th className="py-3 px-4 text-right font-medium">الفرص</th>
                          <th className="py-3 px-4 text-right font-medium">الساعات</th>
                          <th className="py-3 px-4 text-right font-medium">النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teachers.map((teacher: any) => (
                          <tr key={teacher.id} className="border-t border-[#e9eaeb] hover:bg-[#f8f9fa]">
                            <td className="py-3 px-4 text-[#535862] font-bold">{teacher.rank}</td>
                            <td className="py-3 px-4 text-[#181d27] font-medium">{teacher.name}</td>
                            <td className="py-3 px-4 text-[#414651]">{teacher.schoolName}</td>
                            <td className="py-3 px-4 text-[#414651]">{teacher.regionName}</td>
                            <td className="py-3 px-4 text-[#414651]">{teacher.volunteerCount.toLocaleString("ar-SA")}</td>
                            <td className="py-3 px-4 text-[#414651]">{teacher.volunteerOpportunities.toLocaleString("ar-SA")}</td>
                            <td className="py-3 px-4 text-[#414651]">{teacher.volunteerHours.toLocaleString("ar-SA")}</td>
                            <td className="py-3 px-4 text-[#006173] font-bold">{teacher.points.toLocaleString("ar-SA")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-[#e9eaeb] p-12 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-[#535862] text-sm">لا توجد بيانات للعرض</p>
              </div>
            )}
          </div>
        )}

        {/* SCHOOLS & REGIONS TAB */}
        {activeTab === "schools" && (
          <div className="flex flex-col gap-6 sm:gap-9 [direction:rtl]">

            {/* School Rankings */}
            <h2 className="font-bold text-[#181d27] text-base sm:text-lg leading-6 sm:leading-7 flex items-center gap-1">
              ترتيب المدارس
              <InfoTooltip text="نقاط المدرسة = مجموع نقاط جميع معلماتها. المدرسة التي يحقق طاقمها أعلى مجموع نقاط تتصدر الترتيب." />
            </h2>

            {schools.length > 0 ? (
              <>
                {/* Top 3 Schools */}
                <div className="flex flex-col gap-2">
                  {schools.slice(0, 3).map((school: any, i: number) => {
                    const styles = [
                      { bg: "bg-gradient-to-l from-[#FFF9E6] via-[#FFFDF5] to-white", border: "border-[#F5D442]", icon: "\uD83E\uDD47", glow: "shadow-[0_0_12px_rgba(245,212,66,0.3)]" },
                      { bg: "bg-gradient-to-l from-[#F3F4F6] via-[#FAFAFA] to-white", border: "border-[#C0C5CE]", icon: "\uD83E\uDD48", glow: "shadow-sm" },
                      { bg: "bg-gradient-to-l from-[#FFF1E6] via-[#FFFAF5] to-white", border: "border-[#D97706]", icon: "\uD83E\uDD49", glow: "shadow-sm" },
                    ][i];
                    return (
                      <div key={school.id} className={`flex items-center gap-3 sm:gap-4 ${styles.bg} rounded-xl border ${styles.border} px-4 py-3 ${styles.glow} transition-all hover:scale-[1.01]`}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-base sm:text-lg font-extrabold shrink-0">
                          {styles.icon}
                        </div>
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shrink-0 shadow" style={{ backgroundColor: avatarColors[(i + 3) % avatarColors.length] }}>
                          {school.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-sm sm:text-base text-[#181d27] truncate">{school.name}</span>
                          <span className="text-xs text-[#717680] truncate">{school.regionName} · {school.teacherCount} معلمة</span>
                        </div>
                        <div className="flex flex-col items-center shrink-0 mr-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#006173]">{school.totalPoints.toLocaleString("ar-SA")}</span>
                          <span className="text-[10px] text-[#9CA3AF]">نقطة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Schools Bar Chart */}
                <section className="flex flex-col gap-4 sm:gap-6 w-full">
                  <div className="border border-[#e9eaeb] rounded-xl bg-white p-4 sm:p-6">
                    <div className="flex items-start gap-4 w-full mb-4">
                      <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                        <div className="self-stretch font-bold text-[#181d27] text-sm sm:text-base leading-5 sm:leading-6 tracking-[0] [direction:rtl] flex items-center gap-1">
                          أفضل ١٠ مدارس
                          <InfoTooltip text="يعرض أفضل ١٠ مدارس حسب إجمالي نقاط معلماتها" />
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] sm:h-[350px]">
                      {chartsLoaded ? (
                        <Bar data={schoolBarData} options={schoolBarOptions} />
                      ) : (
                        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#17b169] border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-600 text-xs sm:text-sm">جاري تحميل الرسم البياني...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Schools Table */}
                <div className="bg-white rounded-xl border border-[#e9eaeb] shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-[#e9eaeb]">
                    <h3 className="text-sm sm:text-base font-bold text-[#181d27] [direction:rtl]">جميع المدارس ({schools.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F9FA]">
                        <tr className="text-[#535862]">
                          <th className="py-3 px-4 text-right font-medium">#</th>
                          <th className="py-3 px-4 text-right font-medium">المدرسة</th>
                          <th className="py-3 px-4 text-right font-medium">إدارة التعليم</th>
                          <th className="py-3 px-4 text-right font-medium">المنطقة</th>
                          <th className="py-3 px-4 text-right font-medium">عدد المعلمات</th>
                          <th className="py-3 px-4 text-right font-medium">إجمالي النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schools.map((school: any) => (
                          <tr key={school.id} className="border-t border-[#e9eaeb] hover:bg-[#f8f9fa]">
                            <td className="py-3 px-4 text-[#535862] font-bold">{school.rank}</td>
                            <td className="py-3 px-4 text-[#181d27] font-medium">{school.name}</td>
                            <td className="py-3 px-4 text-[#414651]">{school.eduAdminName}</td>
                            <td className="py-3 px-4 text-[#414651]">{school.regionName}</td>
                            <td className="py-3 px-4 text-[#414651]">{school.teacherCount}</td>
                            <td className="py-3 px-4 text-[#006173] font-bold">{school.totalPoints.toLocaleString("ar-SA")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-[#e9eaeb] p-12 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-[#535862] text-sm">لا توجد بيانات للعرض</p>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-[#e9eaeb] my-2" />

            {/* Region Rankings */}
            <h2 className="font-bold text-[#181d27] text-base sm:text-lg leading-6 sm:leading-7 flex items-center gap-1">
              ترتيب المناطق
              <InfoTooltip text="نقاط المنطقة = مجموع نقاط جميع معلماتها في جميع المدارس. المنطقة التي يحقق معلماتها أعلى مجموع نقاط تتصدر الترتيب." />
            </h2>

            {regionRankings.length > 0 ? (
              <>
                {/* Top 3 Regions */}
                <div className="flex flex-col gap-2">
                  {regionRankings.slice(0, 3).map((region: any, i: number) => {
                    const styles = [
                      { bg: "bg-gradient-to-l from-[#FFF9E6] via-[#FFFDF5] to-white", border: "border-[#F5D442]", icon: "\uD83E\uDD47", glow: "shadow-[0_0_12px_rgba(245,212,66,0.3)]" },
                      { bg: "bg-gradient-to-l from-[#F3F4F6] via-[#FAFAFA] to-white", border: "border-[#C0C5CE]", icon: "\uD83E\uDD48", glow: "shadow-sm" },
                      { bg: "bg-gradient-to-l from-[#FFF1E6] via-[#FFFAF5] to-white", border: "border-[#D97706]", icon: "\uD83E\uDD49", glow: "shadow-sm" },
                    ][i];
                    return (
                      <div key={region.id} className={`flex items-center gap-3 sm:gap-4 ${styles.bg} rounded-xl border ${styles.border} px-4 py-3 ${styles.glow} transition-all hover:scale-[1.01]`}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-base sm:text-lg font-extrabold shrink-0">
                          {styles.icon}
                        </div>
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shrink-0 shadow" style={{ backgroundColor: avatarColors[(i + 5) % avatarColors.length] }}>
                          {region.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-bold text-sm sm:text-base text-[#181d27] truncate">{region.name}</span>
                          <span className="text-xs text-[#717680] truncate">{region.schoolCount} مدرسة · {region.teacherCount} معلمة</span>
                        </div>
                        <div className="flex flex-col items-center shrink-0 mr-1">
                          <span className="text-lg sm:text-xl font-extrabold text-[#006173]">{region.totalPoints.toLocaleString("ar-SA")}</span>
                          <span className="text-[10px] text-[#9CA3AF]">نقطة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Regions Bar Chart */}
                <section className="flex flex-col gap-4 sm:gap-6 w-full">
                  <div className="border border-[#e9eaeb] rounded-xl bg-white p-4 sm:p-6">
                    <div className="flex items-start gap-4 w-full mb-4">
                      <div className="flex flex-col items-end justify-center gap-0.5 flex-1">
                        <div className="self-stretch font-bold text-[#181d27] text-sm sm:text-base leading-5 sm:leading-6 tracking-[0] [direction:rtl] flex items-center gap-1">
                          أفضل ١٠ مناطق
                          <InfoTooltip text="يعرض أفضل ١٠ مناطق حسب إجمالي نقاط معلماتها" />
                        </div>
                      </div>
                    </div>
                    <div className="h-[280px] sm:h-[350px]">
                      {chartsLoaded ? (
                        <Bar data={regionBarData} options={regionBarOptions} />
                      ) : (
                        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#17b169] border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-600 text-xs sm:text-sm">جاري تحميل الرسم البياني...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Regions Table */}
                <div className="bg-white rounded-xl border border-[#e9eaeb] shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-[#e9eaeb]">
                    <h3 className="text-sm sm:text-base font-bold text-[#181d27] [direction:rtl]">جميع المناطق ({regionRankings.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F8F9FA]">
                        <tr className="text-[#535862]">
                          <th className="py-3 px-4 text-right font-medium">#</th>
                          <th className="py-3 px-4 text-right font-medium">المنطقة</th>
                          <th className="py-3 px-4 text-right font-medium">عدد المدارس</th>
                          <th className="py-3 px-4 text-right font-medium">عدد المعلمات</th>
                          <th className="py-3 px-4 text-right font-medium">إجمالي النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regionRankings.map((region: any) => (
                          <tr key={region.id} className="border-t border-[#e9eaeb] hover:bg-[#f8f9fa]">
                            <td className="py-3 px-4 text-[#535862] font-bold">{region.rank}</td>
                            <td className="py-3 px-4 text-[#181d27] font-medium">{region.name}</td>
                            <td className="py-3 px-4 text-[#414651]">{region.schoolCount}</td>
                            <td className="py-3 px-4 text-[#414651]">{region.teacherCount}</td>
                            <td className="py-3 px-4 text-[#006173] font-bold">{region.totalPoints.toLocaleString("ar-SA")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl border border-[#e9eaeb] p-12 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#f0f2f5] flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#535862] text-sm">لا توجد بيانات للعرض</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
