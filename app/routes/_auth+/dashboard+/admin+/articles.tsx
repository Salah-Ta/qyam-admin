import {
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { createToastHeaders } from "~/lib/toast.server";
import articleDB from "~/db/articles/articles.server";

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

const validateArticleData = (formData: FormData) => {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title?.trim()) {
    throw new Error("يجب إدخال عنوان المقال");
  }

  if (!content?.trim()) {
    throw new Error("يجب إدخال محتوى المقال");
  }

  return {
    title: title.trim(),
    description: (formData.get("description") as string)?.trim() || "",
    content: content.trim(),
    image: (formData.get("image") as string)?.trim() || "",
  };
};

export async function action({
  request,
  context,
}: ActionFunctionArgs): Promise<Response> {
  console.log("=== ARTICLES ACTION CALLED ===");
  try {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as string;

    // Handle article operations
    switch (actionType) {
      case "deleteArticle": {
        const id = formData.get("id") as string;
        if (!id) {
          return await createErrorResponse("معرف المقال غير صحيح");
        }

        await Promise.race([
          articleDB.deleteArticle(id, context.cloudflare.env.DATABASE_URL),
          createTimeoutPromise(),
        ]);

        return await createSuccessResponse("تم حذف المقال بنجاح");
      }

      case "updateArticle": {
        const id = formData.get("id") as string;
        if (!id) {
          return await createErrorResponse("معرف المقال غير صحيح");
        }

        const articleData = validateArticleData(formData);

        await Promise.race([
          articleDB.updateArticle(
            { id, ...articleData },
            context.cloudflare.env.DATABASE_URL
          ),
          createTimeoutPromise(),
        ]);

        return await createSuccessResponse("تم تحديث المقال بنجاح");
      }

      case "createArticle": {
        const articleData = validateArticleData(formData);

        await Promise.race([
          articleDB.createArticle(
            articleData,
            context.cloudflare.env.DATABASE_URL
          ),
          createTimeoutPromise(),
        ]);

        return await createSuccessResponse("تم إنشاء المقال بنجاح");
      }

      default: {
        return await createErrorResponse("نوع العملية غير صحيح");
      }
    }
  } catch (error) {
    console.error("Articles action error:", error);
    const message =
      error instanceof Error ? error.message : "حدث خطأ غير متوقع";
    return await createErrorResponse(message);
  }
}