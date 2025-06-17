// import { Article } from "~/types/types";
// import { Link } from "@remix-run/react";

// interface ArticleCardProps {
//   article: Article;
// }

// export default function UserArticleCard({ article }: ArticleCardProps) {
//   return (
//     <Link to={`${article.id}`} className="block">
//       <div className="w-[300px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//         {article.image && (
//           <img
//             src={article.image}
//             alt={article.title}
//             className="w-full h-40 object-cover"
//           />
//         )}
//         <div className="p-4">
//           <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
//           {article.description && (
//             <p className="text-gray-600 text-sm line-clamp-3">
//               {article.description}
//             </p>
//           )}
//         </div>
//       </div>
//     </Link>
//   );
// }