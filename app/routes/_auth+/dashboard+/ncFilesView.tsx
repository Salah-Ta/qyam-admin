import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import articleDB from "~/db/articles/articles.server";
import { Article } from "~/types/types";
import cardImg from "~/assets/images/new-design/image-1.png";

// Loader function to fetch article data
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const articleId = url.searchParams.get('articleId');
  
  if (!articleId) {
    throw new Response("Article ID is required", { status: 400 });
  }

  try {
    const response = await articleDB.getArticleBySlug(
      articleId,
      context.cloudflare.env.DATABASE_URL
    ) as { status: string; data?: Article };
    
    if (response.status !== 'success' || !response.data) {
      throw new Response("Article not found", { status: 404 });
    }
    
    return Response.json(response.data);
  } catch (error) {
    console.error("Article fetch error:", error);
    throw new Response("Failed to load article", { status: 500 });
  }
}

// Type for serialized article data
type SerializedArticle = Omit<Article, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export const Section2 = (): JSX.Element => {
  const article = useLoaderData<SerializedArticle>();
  const navigate = useNavigate();
  
  // Parse the content into paragraphs - assuming content is stored as a single string
  // that can be split into paragraphs or is already formatted as HTML/markdown
  const parseContent = (content: string): string[] => {
    if (!content || content.trim().length === 0) {
      return [];
    }
    
    // If content contains newlines, split by them
    if (content.includes('\n\n')) {
      return content.split('\n\n').filter(paragraph => paragraph.trim().length > 0);
    } else if (content.includes('\n')) {
      return content.split('\n').filter(paragraph => paragraph.trim().length > 0);
    }
    
    // If content contains HTML paragraphs, extract them
    if (content.includes('<p>')) {
      const matches = content.match(/<p[^>]*>(.*?)<\/p>/gi);
      if (matches) {
        return matches.map(match => match.replace(/<\/?p[^>]*>/gi, '').trim()).filter(p => p.length > 0);
      }
    }
    
    // If content is very long, try to split by periods followed by spaces
    if (content.length > 500) {
      const sentences = content.split(/\.\s+/).filter(sentence => sentence.trim().length > 0);
      if (sentences.length > 3) {
        return sentences.map(sentence => sentence.endsWith('.') ? sentence : sentence + '.');
      }
    }
    
    // Otherwise, treat it as a single paragraph
    return [content];
  };

  const paragraphs = parseContent(article.content || '');
  
  // If no content paragraphs, use description as fallback
  const displayParagraphs = paragraphs.length > 0 ? paragraphs : [article.description || 'محتوى المقال غير متوفر حالياً.'];

  return (
    <div className="flex flex-col w-full gap-4 md:mt-[165.5px]">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/infoCenter')}
        className="flex items-center gap-2 px-4 py-2 text-[#006173] hover:bg-[#006173] hover:text-white transition-colors rounded-md border border-[#006173] self-start mb-4"
        dir="rtl"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        <span className="font-medium text-sm">العودة إلى مركز المعلومات</span>
      </button>

      <Card className="flex flex-col w-full items-end gap-[42px] p-4 rounded-3xl shadow-shadows-shadow-md mb-[505.5px]">
        <img 
          className="w-full h-auto object-cover rounded-2xl" 
          alt="Article image" 
          src={article.image || cardImg} 
        />

        <CardContent className="flex flex-col items-end justify-center gap-6 w-full p-0">
          <h1 className="font-bold text-[32px] leading-7 [direction:rtl] w-full text-[#1f2a37] tracking-[0]">
            {article.title}
          </h1>

          <div className="flex flex-col items-start gap-4 w-full">
            {displayParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-right font-normal text-2xl leading-[33.6px] w-full text-[#1f2a37] tracking-[0] [direction:rtl]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Section2;
