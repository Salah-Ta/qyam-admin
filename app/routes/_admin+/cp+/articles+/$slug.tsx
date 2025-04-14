import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import articleDB from "~/db/articles/articles.server";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  try {
    const response = await articleDB.getArticleBySlug(
      slug as string, 
      context.cloudflare.env.DATABASE_URL
    );
    
    if (!response?.data) {
      throw new Response("Article not found", { status: 404 });
    }
    
    return Response.json(response.data);
  } catch (error) {
    console.error("Article fetch error:", error);
    throw new Response("Article not found", { status: 404 });
  }
}

export default function Article() {
  const article = useLoaderData<Article>();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <article className="prose prose-lg flex flex-col gap-16">
        {article.image && (
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}
        <h1 className="text-3xl font-bold  mb-4">{article.title}</h1>
        
        <div
          dangerouslySetInnerHTML={{
            __html: article.content
          }}
          className="q1-editor"
        />
      </article>
    </div>
  );
}