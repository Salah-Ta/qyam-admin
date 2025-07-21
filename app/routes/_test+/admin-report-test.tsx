import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { n } from "node_modules/better-auth/dist/index-Dcbbo2jq";
import statisticsService from "~/db/statistics/statistics.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    try {
        const user = await getAuthenticated({ request, context });

        if (!user) {
            return json({ status: "error", message: "Authentication required" }, { status: 401 });
        }

        if ((user as any).role !==  "admin") {
            return json({ status: "error", message: "Admin access required" }, { status: 403 });
        }

        const dbUrl = context?.cloudflare.env.DATABASE_URL;

        if (!dbUrl) {
            return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
        }

        // Get URL parameters for filters
        const url = new URL(request.url);
        const regionId = url.searchParams.get("regionId");
        const eduAdminId = url.searchParams.get("eduAdminId");
        const schoolId = url.searchParams.get("schoolId");
        
        
        // Get statistics using the new service
        var startTime = Date.now();
        const statistics = await statisticsService.getAdminDashboardDataStatistics(dbUrl, {
            regionId: regionId || undefined,
            eduAdminId: eduAdminId || undefined,
            schoolId: schoolId || undefined
        });
        console.log("Admin Dashboard Data Statistics fetched in", Date.now() - startTime, "ms");
        
        // Get regional breakdown
        startTime = Date.now();
        const regionalBreakdown = await statisticsService.getRegionalBreakdown(dbUrl);
        console.log("Regional Breakdown fetched in", Date.now() - startTime, "ms");
        
        // Get eduAdmin breakdown
        startTime = Date.now();
        const eduAdminBreakdown = await statisticsService.getEduAdminBreakdown(dbUrl);
        console.log("EduAdmin Breakdown fetched in", Date.now() - startTime, "ms");

        return json({
            user,
            statistics,
            regionalBreakdown,
            eduAdminBreakdown,
            filters: {
                regionId,
                eduAdminId,
                schoolId
            }
        });

    } catch (error: any) {
        console.error("Loader error:", error);
        return json({
            status: "error",
            message: error.message || "حدث خطأ غير متوقع"
        }, { status: 500 });
    }
}

export default function AdminReportTest() {
    const data = useLoaderData<typeof loader>();

    if ('status' in data && data.status === 'error') {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
                <p>{data.message}</p>
            </div>
        );
    }

    const { statistics, regionalBreakdown, eduAdminBreakdown } = data;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">لوحة الإحصائيات - اختبار</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Regions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">المناطق</h3>
                    <p className="text-2xl font-bold text-blue-600">{statistics.regionsFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.regionsTotal}</p>
                </div>

                {/* EduAdmins */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">إدارات التعليم</h3>
                    <p className="text-2xl font-bold text-green-600">{statistics.eduAdminsFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.eduAdminsTotal}</p>
                </div>

                {/* Schools */}
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800">المدارس</h3>
                    <p className="text-2xl font-bold text-purple-600">{statistics.schoolsFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.schoolsTotal}</p>
                </div>

                {/* Reports */}
                <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-800">التقارير</h3>
                    <p className="text-2xl font-bold text-orange-600">{statistics.reportsFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.reportsTotal}</p>
                </div>

                {/* Trainers */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-indigo-800">المعلمات</h3>
                    <p className="text-2xl font-bold text-indigo-600">{statistics.trainersFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.trainersTotal}</p>
                </div>

                {/* Volunteers */}
                <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-pink-800">الطالبات</h3>
                    <p className="text-2xl font-bold text-pink-600">{statistics.volunteerCountFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.volunteerCountTotal}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                {/* Economic Value */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800">القيمة الاقتصادية</h3>
                    <p className="text-2xl font-bold text-yellow-600">{statistics.economicValueFiltered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.economicValueTotal.toLocaleString()}</p>
                </div>
                {/* Activities */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">الانشطة</h3>
                    <p className="text-2xl font-bold text-green-600">{statistics.activitiesCountFiltered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.activitiesCountTotal.toLocaleString()}</p>
                </div>
                {/* Volunteer Hours */}
                <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-800">ساعات التطوع</h3>
                    <p className="text-2xl font-bold text-teal-600">{statistics.volunteerHoursFiltered}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.volunteerHoursTotal}</p>
                </div>
                {/* Skills */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">المهارات</h3>
                    <p className="text-2xl font-bold text-blue-600">{statistics.skillsTrainedCountFiltered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.skillsTrainedCountTotal.toLocaleString()}</p>
                </div>
                {/* Skills Economic Value */}
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800">القيمة الاقتصادية للمهارات</h3>
                    <p className="text-2xl font-bold text-purple-600">{statistics.skillsEconomicValueFiltered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.skillsEconomicValueTotal.toLocaleString()}</p>
                </div>
                {/* Opportunities */}
                <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-800">الفرص</h3>
                    <p className="text-2xl font-bold text-orange-600">{statistics.volunteerOpportunitiesFiltered.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">من أصل {statistics.volunteerOpportunitiesTotal.toLocaleString()}</p>
                </div>
            </div>

            {/* Regional Breakdown */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">الإحصائيات حسب المناطق</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regionalBreakdown?.map((region) => (
                        <div key={region.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{region.name}</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المجموع:</span>
                                    <span className="font-semibold">
                                        {
                                        region.schoolsCount + 
                                        region.trainersCount + 
                                        region.volunteerCount + 
                                        region.reportsCount + 
                                        region.volunteerHours +
                                        region.activitiesCount+
                                        region.economicValue +
                                        region.skillsTrainedCount +
                                        region.skillsEconomicValue 
                                        }</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المدارس:</span>
                                    <span className="font-semibold">{region.schoolsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المعلمات:</span>
                                    <span className="font-semibold">{region.trainersCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الطالبات:</span>
                                    <span className="font-semibold">{region.volunteerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">التقارير:</span>
                                    <span className="font-semibold">{region.reportsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ساعات التطوع:</span>
                                    <span className="font-semibold">{region.volunteerHours}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الأنشطة:</span>
                                    <span className="font-semibold">{region.activitiesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">القيمة الاقتصادية:</span>
                                    <span className="font-semibold">{region.economicValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المهارات:</span>
                                    <span className="font-semibold">{region.skillsTrainedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">قيمة المهارات:</span>
                                    <span className="font-semibold">{region.skillsEconomicValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الفرص:</span>
                                    <span className="font-semibold">{region.volunteerOpportunities}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* EduAdmin Breakdown */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">الإحصائيات حسب إدارات التعليم</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eduAdminBreakdown?.map((eduAdmin) => (
                        <div key={eduAdmin.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{eduAdmin.name}</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المجموع:</span>
                                    <span className="font-semibold">
                                        {
                                        eduAdmin.schoolsCount + 
                                        eduAdmin.trainersCount + 
                                        eduAdmin.volunteerCount + 
                                        eduAdmin.reportsCount + 
                                        eduAdmin.volunteerHours +
                                        eduAdmin.activitiesCount+
                                        eduAdmin.economicValue +
                                        eduAdmin.skillsTrainedCount +
                                        eduAdmin.skillsEconomicValue 
                                        }</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المدارس:</span>
                                    <span className="font-semibold">{eduAdmin.schoolsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المعلمات:</span>
                                    <span className="font-semibold">{eduAdmin.trainersCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الطالبات:</span>
                                    <span className="font-semibold">{eduAdmin.volunteerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">التقارير:</span>
                                    <span className="font-semibold">{eduAdmin.reportsCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ساعات التطوع:</span>
                                    <span className="font-semibold">{eduAdmin.volunteerHours}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الأنشطة:</span>
                                    <span className="font-semibold">{eduAdmin.activitiesCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">القيمة الاقتصادية:</span>
                                    <span className="font-semibold">{eduAdmin.economicValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">المهارات:</span>
                                    <span className="font-semibold">{eduAdmin.skillsTrainedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">قيمة المهارات:</span>
                                    <span className="font-semibold">{eduAdmin.skillsEconomicValue.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">الفرص:</span>
                                    <span className="font-semibold">{eduAdmin.volunteerOpportunities}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Raw Data for Debug */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">البيانات الخام (للاختبار)</h3>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify(statistics, null, 2)}
                </pre>
            </div>
        </div>
    );
}

