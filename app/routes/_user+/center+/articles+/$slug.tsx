import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import articleDB from "~/db/articles/articles.server";
import UserArticleView from "~/components/userArticleView";

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
  return <UserArticleView article={article} />;
}