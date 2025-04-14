import { Article } from "~/types/types";

interface ArticleViewProps {
  article: Article;
}

export default function ArticleView({ article }: ArticleViewProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <article className="prose prose-lg">
        {article.image && (
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        {article.description && (
          <p className="text-gray-600 mb-8">{article.description}</p>
        )}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
}