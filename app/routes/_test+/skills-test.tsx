import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import skillService from "~/db/skill/skill.server"; // Adjust path if needed
import { getAuthenticated } from "~/lib/get-authenticated.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    try {

        const dbUrl = context?.cloudflare.env.DATABASE_URL;

        if (!dbUrl) {
            return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
        }

        // Get all skills
        const startTime1 = Date.now();
        const allSkills = await skillService.getAllSkills(dbUrl);
        console.log("getAllSkills fetched in", Date.now() - startTime1, "ms");

        // Get skills with usage count
        const startTime2 = Date.now();
        const skillsWithUsage = await skillService.getSkillsWithUsageCount(dbUrl);
        console.log("getSkillsWithUsageCount fetched in", Date.now() - startTime2, "ms");

        return json({
            allSkills: allSkills.data || [],
            skillsWithUsage: skillsWithUsage.data || []
        });

    } catch (error: any) {
        console.error("Loader error:", error);
        return json({
            status: "error",
            message: error.message || "حدث خطأ غير متوقع"
        }, { status: 500 });
    }
}

export default function SkillsTest() {
    const data = useLoaderData<typeof loader>();

    if ('status' in data && data.status === 'error') {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
                <p>{data.message}</p>
            </div>
        );
    }

    const { allSkills, skillsWithUsage } = data;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">اختبار خدمة المهارات</h1>

            {/* All Skills */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">getAllSkills</h2>
                <p className="mb-2">عدد المهارات: {allSkills.length}</p>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-right">الرقم التعريفي</th>
                            <th className="border p-2 text-right">الاسم</th>
                            <th className="border p-2 text-right">الوصف</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allSkills.map((skill) => (
                            <tr key={skill.id}>
                                <td className="border p-2">{skill.id}</td>
                                <td className="border p-2">{skill.name}</td>
                                <td className="border p-2">{skill.description || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Skills with Usage Count */}
            <div>
                <h2 className="text-xl font-bold mb-4">getSkillsWithUsageCount</h2>
                <p className="mb-2">عدد المهارات مع الاستخدام: {skillsWithUsage.length}</p>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-right">الرقم التعريفي</th>
                            <th className="border p-2 text-right">الاسم</th>
                            <th className="border p-2 text-right">الوصف</th>
                            <th className="border p-2 text-right">عدد الاستخدام</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skillsWithUsage.map((skill) => (
                            <tr key={skill.id}>
                                <td className="border p-2">{skill.id}</td>
                                <td className="border p-2">{skill.name}</td>
                                <td className="border p-2">{skill.description || "-"}</td>
                                <td className="border p-2">{skill.usageCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Raw Data for Debug */}
            <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">البيانات الخام (للاختبار)</h3>
                <pre className="text-xs overflow-auto">
                    {JSON.stringify({ allSkills, skillsWithUsage }, null, 2)}
                </pre>
            </div>
        </div>
    );
}