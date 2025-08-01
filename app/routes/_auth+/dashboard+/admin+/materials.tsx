import {
  ActionFunctionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { createId } from "@paralleldrive/cuid2";
import { createToastHeaders } from "~/lib/toast.server";
import materialDB from "~/db/material/material.server";

// Constants
const CATEGORIES = [
  { name: "مركز المعرفة", id: "1" },
  { name: "أدلة البرنامج", id: "2" },
  { name: "أنشطة البرنامج", id: "3" },
  { name: "بنك الفرص التطوعية", id: "4" },
  { name: "أدوات التحفيز", id: "5" },
];

// Helper functions for server actions
const createTimeoutPromise = (ms: number = 10000) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database operation timeout")), ms)
  );

const createSuccessResponse = async (title: string): Promise<Response> =>
  Response.json(
    { success: true },
    {
      headers: await createToastHeaders({
        description: "",
        title,
        type: "success",
      }),
    }
  );

const createErrorResponse = async (title: string): Promise<Response> =>
  Response.json(
    { success: false },
    {
      headers: await createToastHeaders({
        description: "",
        title,
        type: "error",
      }),
    }
  );

export async function action({
  request,
  context,
}: ActionFunctionArgs): Promise<Response> {
  console.log("=== MATERIALS ACTION CALLED ===");
  try {
    const contentType = request.headers.get("Content-Type") || "";
    console.log("Content-Type:", contentType);

    // Handle file uploads first (before consuming the request)
    if (contentType.includes("multipart/form-data")) {
      console.log("Processing multipart form data...");
      try {
        // Parse form data normally first to get categoryId
        const clonedRequest = request.clone();
        const formData = await clonedRequest.formData();
        const categoryId = formData.get("categoryId") as string;
        console.log("CategoryId from form:", categoryId);

        if (!categoryId || !CATEGORIES.find((c) => c.id === categoryId)) {
          console.log("Invalid category:", categoryId);
          return await createErrorResponse("فئة غير صحيحة");
        }

        const uploadHandler = async ({
          name,
          data,
          filename,
          contentType: fileType,
        }: any) => {
          // Skip non-file fields
          if (name !== "files" || !filename || !fileType) {
            return undefined;
          }

          if (!fileType.includes("pdf")) {
            throw new Error("نوع الملف غير مدعوم");
          }

          const extension = filename.split(".").pop();
          const key = `${Date.now()}-${createId()}.${extension}`;
          const dataArray: Uint8Array[] = [];

          for await (const chunk of data) {
            dataArray.push(chunk);
          }

          // Combine chunks into a single buffer
          const totalLength = dataArray.reduce(
            (acc, chunk) => acc + chunk.length,
            0
          );
          const buffer = new Uint8Array(totalLength);
          let offset = 0;

          for (const chunk of dataArray) {
            buffer.set(chunk, offset);
            offset += chunk.length;
          }

          // Check file size (4MB limit)
          if (buffer.length > 4 * 1024 * 1024) {
            throw new Error("حجم الملف يتجاوز الحد المسموح");
          }

          await Promise.race([
            context.cloudflare.env.QYAM_BUCKET.put(key, buffer, {
              httpMetadata: { contentType: fileType },
            }),
            createTimeoutPromise(),
          ]);

          await Promise.race([
            materialDB.createMaterial(
              {
                title: filename,
                storageKey: key,
                categoryId,
                published: true,
              },
              context.cloudflare.env.DATABASE_URL
            ),
            createTimeoutPromise(),
          ]);

          return key;
        };

        await unstable_parseMultipartFormData(request, uploadHandler);
        return await createSuccessResponse("تم رفع الملفات بنجاح");
      } catch (error) {
        console.error("Upload error:", error);
        const message =
          error instanceof Error ? error.message : "فشل في رفع الملفات";
        return await createErrorResponse(message);
      }
    }

    // Handle material delete (non-multipart)
    const formData = await request.formData();
    const id = formData.get("id") as string;
    if (!id) {
      return await createErrorResponse("معرف الملف غير صحيح");
    }

    await Promise.race([
      materialDB.deleteMaterial(id, context.cloudflare.env.DATABASE_URL),
      createTimeoutPromise(),
    ]);

    return await createSuccessResponse("تم حذف الملف بنجاح");
  } catch (error) {
    console.error("Materials action error:", error);
    const message =
      error instanceof Error ? error.message : "حدث خطأ غير متوقع";
    return await createErrorResponse(message);
  }
}
