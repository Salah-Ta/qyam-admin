import { Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { Article } from "~/types/types";
import noImage from "~/assets/images/noImage.png"
import edit from "~/assets/icons/edit.svg"

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete:(article:Article) => void;
}

export default function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
     
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {article.image ?
       (
        <img 
          src={article.image} 
          alt={article.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ):(
        <img 
        src={noImage}
         alt="" 
         className="w-full h-48 object-cover rounded-t-lg"
         />
      )}
      <div className="p-4">
      <Link 
            to={`/cp/articles/${article.id}`}
            className="text-primary hover:underline"
          >
        <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
        <p className="text-gray-600 line-clamp-2 text-sm my-2">{article.description}</p>
        </Link>
        <div className="mt-4 flex justify-between items-center">
          {/* <Link 
            to={`/articles/${article.id}`}
            className="text-primary hover:underline"
          >
            اقرأ المزيد
          </Link> */}
          
          <div className="flex gap-2 ">
            <Button
              variant="outline"
              className="bg-primary text-white"
              size="sm"
              onClick={() => onEdit(article)}
            >
              تعديل المقال
              <img src={edit} alt="" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-primary"
              onClick={() => onDelete(article)}
            >
              حذف المقال 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
    <path d="M2.5 5.5H4.16667M4.16667 5.5H17.5M4.16667 5.5V17.1667C4.16667 17.6087 4.34226 18.0326 4.65482 18.3452C4.96738 18.6577 5.39131 18.8333 5.83333 18.8333H14.1667C14.6087 18.8333 15.0326 18.6577 15.3452 18.3452C15.6577 18.0326 15.8333 17.6087 15.8333 17.1667V5.5H4.16667ZM6.66667 5.5V3.83333C6.66667 3.3913 6.84226 2.96738 7.15482 2.65482C7.46738 2.34226 7.89131 2.16666 8.33333 2.16666H11.6667C12.1087 2.16666 12.5326 2.34226 12.8452 2.65482C13.1577 2.96738 13.3333 3.3913 13.3333 3.83333V5.5M8.33333 9.66666V14.6667M11.6667 9.66666V14.6667" stroke="#0D3151" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}