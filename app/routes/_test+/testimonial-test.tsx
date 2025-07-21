import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import testimonialService from "~/db/testimonial/testimonial.server";
import { getAuthenticated } from "~/lib/get-authenticated.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    try {
        // Get user for authentication
        const user = await getAuthenticated({ request, context });

        // Get database URL
        const dbUrl = context?.cloudflare.env.DATABASE_URL;
        if (!dbUrl) {
            return json({ status: "error", message: "Database URL is not configured" }, { status: 500 });
        }

        // Get testimonials with timing
        const startTime = Date.now();
        const testimonialResponse = await testimonialService.getAllTestimonials(dbUrl);
        console.log("getAllTestimonials fetched in", Date.now() - startTime, "ms");

        return json({
            testimonialResponse
        });

    } catch (error: any) {
        console.error("Loader error:", error);
        return json({
            status: "error",
            message: error.message || "حدث خطأ غير متوقع"
        }, { status: 500 });
    }
}

export default function TestimonialTest() {
    const data = useLoaderData<typeof loader>();

    // Handle error state
    if ('status' in data && data.status === 'error') {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ</h1>
                <p>{data.message}</p>
            </div>
        );
    }

    // Extract testimonials, handling the wrapped format
    const response = data.testimonialResponse;
    const testimonials = response.success ? response.data : [];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">اختبار خدمة الشهادات</h1>
            
            {/* Status */}
            <div className="mb-4">
                <p>
                    <span className="font-bold">حالة:</span> {response.success ? 'نجاح' : 'فشل'}
                </p>
                {response.error && (
                    <p className="text-red-600">
                        <span className="font-bold">خطأ:</span> {response.error}
                    </p>
                )}
            </div>
            
            {/* Testimonials */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">getAllTestimonials</h2>
                <p className="mb-2">عدد الشهادات: {testimonials.length}</p>
                
                {testimonials.length > 0 ? (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-right">الاسم</th>
                                <th className="border p-2 text-right">التعليق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map((testimonial) => (
                                <tr key={testimonial.id}>
                                    <td className="border p-2">{testimonial.name}</td>
                                    <td className="border p-2">{testimonial.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>لا توجد شهادات</p>
                )}
            </div>

            {/* Performance */}
            <div className="mt-4 text-sm text-gray-600">
                <p>يمكنك التحقق من وقت استجابة API في وحدة التحكم بالمتصفح.</p>
            </div>
        </div>
    );
}