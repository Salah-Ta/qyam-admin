import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Article, StatusResponse } from "~/types/types";
import articleDB from "~/db/articles/articles.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { requireSpecialCase } from "~/lib/get-authenticated.server";
import ArticleCard from "~/components/articlesCard";
import ArticleDialog from "~/components/articleDialog";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { createToastHeaders } from "~/lib/toast.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSpecialCase(request, context, (user) => user?.role === "admin");
  return articleDB
    .getAllArticles(context.cloudflare.env.DATABASE_URL)
    .then((res) => {
      return Response.json(res.data);
    });
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const method = request.method;
  
    try {
  //     const file = formData.get("image");
  //     console.log("yahoooooo its file");
  // console.log(formData);
  
    //   if (file && (file instanceof File)) {
            
    //       const buffer = await file.arrayBuffer();
    //       const base64String = Buffer.from(buffer).toString('base64');
    //       const imageUrl = `data:${file.type};base64,${base64String}`;
          
         
        
    //   }
  
      if (method === "DELETE") {
        await articleDB.deleteArticle(
          formData.get("id") as string,
          context.cloudflare.env.DATABASE_URL
        );
  
        return Response.json(
          { success: true },
          {
            headers: await createToastHeaders({
              description: "",
              title: "تم حذف المقال بنجاح",
              type: "success",
            }),
          }
        );
      }
  
      if (method === "POST") {
        const content = (formData.get("content") as string).replace(/\n/g, '\n\n');
        await articleDB.createArticle({
          title: formData.get("title") as string,
          content: content,
          description: formData.get("description") as string,
          image: formData.get("image") as string,
        }, context.cloudflare.env.DATABASE_URL);
      } else if (method === "PUT") {
        const content = (formData.get("content") as string).replace(/\n/g, '\n\n');
        await articleDB.updateArticle({
          id: formData.get("id") as string,
          title: formData.get("title") as string,
          content: content,
          description: formData.get("description") as string,
          image: formData.get("image") as string,
        }, context.cloudflare.env.DATABASE_URL);
      }
  
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: method === "POST" ? "تم إضافة المقال بنجاح" : "تم تحديث المقال بنجاح",
            type: "success",
          }),
        }
      );
    } catch (error) {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: method === "POST" ? "فشل إضافة المقال" : "فشل تحديث المقال",
            type: "error",
          }),
        }
      );
    }
  }

export default function Articles() {
  const fetcher = useFetcher();
  const articles = useLoaderData<Article[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  return (
    <section className="px-12 min-h-screen">
      <div className="flex sm:flex-row flex-col justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">المقالات</h2>
        <Button onClick={() => setIsDialogOpen(true)}>إضافة مقال جديد</Button>
      </div>

      <div className="flex flex-wrap gap-6">
        {articles?.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onEdit={() => setEditingArticle(article)}
            onDelete={() => {
              if (!article.id) return;
              const formData = new FormData();
              formData.append("id", article.id);
              fetcher.submit(formData, { method: "DELETE" });
            }}
          />
        ))}
      </div>

      <ArticleDialog
        open={isDialogOpen || !!editingArticle}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingArticle(null);
        }}
        article={editingArticle}
      />
    </section>
  );
}
