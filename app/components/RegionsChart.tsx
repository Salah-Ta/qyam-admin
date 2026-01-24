import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components on client side only
if (typeof window !== "undefined") {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
}

// Client-only wrapper to prevent hydration issues
const ClientOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback as React.ReactElement;
  }

  return children as React.ReactElement;
};

interface RegionData {
  id?: string;
  name: string;
  studentsCount?: number;
  volunteerOpportunities?: number;
  volunteerCount?: number;
  trainersCount?: number;
  volunteerHours?: number;
}

interface RegionsChartProps {
  regionalStats: RegionData[];
  height?: string;
}

// Calculate region score: عدد المتطوعين + عدد الفرص التطوعية المنفذة
const calculateRegionScore = (region: RegionData): number => {
  return (region.volunteerCount || 0) + (region.volunteerOpportunities || 0);
};

export const RegionsChart: React.FC<RegionsChartProps> = ({
  regionalStats = [],
  height = "228px",
}) => {
  // Calculate grand total for percentage calculation
  const grandTotal = regionalStats.reduce(
    (sum, r) => sum + calculateRegionScore(r),
    0
  );

  // Build regions array with calculated scores
  const regions = regionalStats
    .map((region) => {
      const totalScore = calculateRegionScore(region);
      return {
        name: region.name || "غير محدد",
        value: grandTotal > 0 ? Math.round((totalScore / grandTotal) * 100) : 0,
        totalScore,
        volunteerCount: region.volunteerCount || 0,
        volunteerOpportunities: region.volunteerOpportunities || 0,
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by value descending

  // If no data, show placeholder
  if (regions.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">لا توجد بيانات للمناطق</p>
      </div>
    );
  }

  const barChartData = {
    labels: regions.map((region) => region.name),
    datasets: [
      {
        label: "النسبة",
        data: regions.map((region) => region.value),
        backgroundColor: "#17b169",
        borderRadius: 16,
        borderSkipped: false,
        barThickness:
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42,
        barPercentage: 0.9,
        categoryPercentage: 0.8,
      },
      {
        label: "الخلفية",
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
          typeof window !== "undefined" && window.innerWidth < 768 ? 24 : 42,
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
              const region = regions[context.dataIndex];
              return [
                `النسبة: ${context.parsed.y}%`,
                `المتطوعين: ${region.volunteerCount}`,
                `الفرص التطوعية: ${region.volunteerOpportunities}`,
              ];
            }
            return "";
          },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <ClientOnly
        fallback={
          <div
            className="bg-gray-100 rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">جاري تحميل الرسم البياني...</p>
            </div>
          </div>
        }
      >
        <Bar data={barChartData} options={barChartOptions} />
      </ClientOnly>
    </div>
  );
};

export default RegionsChart;
