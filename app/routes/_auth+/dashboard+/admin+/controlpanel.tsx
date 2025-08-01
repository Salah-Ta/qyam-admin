import React, { useCallback, useMemo, useState } from "react";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Material } from "~/types/types";
import materialDB from "~/db/material/material.server";
import articleDB from "~/db/articles/articles.server";
import type { Article } from "~/types/types";
import {
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { MaterialManagement } from "~/components/admin/MaterialManagement";
import { ArticleManagement } from "~/components/admin/ArticleManagement";

// Utility function for class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Category {
  name: string;
  id: string;
}

interface LoaderData {
  materials: Material[];
  articles: Article[];
}

interface ActionData {
  success: boolean;
}

// Constants
const CATEGORIES: Category[] = [
  { name: "مركز المعرفة", id: "1" },
  { name: "أدلة البرنامج", id: "2" },
  { name: "أنشطة البرنامج", id: "3" },
  { name: "بنك الفرص التطوعية", id: "4" },
  { name: "أدوات التحفيز", id: "5" },
];

// Helper functions for loader
const createTimeoutPromise = (ms: number = 10000) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database operation timeout")), ms)
  );

// --- Remix Loader & Action ---
export async function loader({
  context,
}: LoaderFunctionArgs): Promise<Response> {
  try {
    const timeoutPromise = createTimeoutPromise();

    const [materialsRes, articlesRes] = await Promise.all([
      Promise.race([
        materialDB.getAllMaterials(context.cloudflare.env.DATABASE_URL),
        timeoutPromise,
      ]),
      Promise.race([
        articleDB.getAllArticles(context.cloudflare.env.DATABASE_URL),
        timeoutPromise,
      ]),
    ]);

    return Response.json({
      materials: Array.isArray((materialsRes as any)?.data)
        ? (materialsRes as any).data
        : [],
      articles: Array.isArray((articlesRes as any)?.data)
        ? (articlesRes as any).data
        : [],
    });
  } catch (error) {
    console.error("Loader error:", error);
    return Response.json({
      materials: [],
      articles: [],
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


// Custom Hooks
const useControlPanelData = () => {
  const loaderData = useLoaderData<LoaderData | null>();
  const revalidator = useRevalidator();

  const materials = useMemo(
    () => (Array.isArray(loaderData?.materials) ? loaderData.materials : []),
    [loaderData?.materials]
  );

  const articles = useMemo(
    () => (Array.isArray(loaderData?.articles) ? loaderData.articles : []),
    [loaderData?.articles]
  );

  const revalidate = useCallback(() => {
    revalidator.revalidate();
  }, [revalidator]);

  return {
    materials,
    articles,
    revalidate,
    isLoading: revalidator.state === "loading",
  };
};

// --- Main Component ---
export const ControlPanel = (): JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState<string>("1");

  const { materials, articles, revalidate, isLoading } = useControlPanelData();

  return (
    <div>
      <div className="lg:flex items-start relative w-full h-full pt-6">
        <div className="flex flex-col gap-4 w-full">
          <MaterialManagement
            materials={materials}
            selectedCategory={selectedCategory}
            isLoading={isLoading}
            onSuccess={revalidate}
          />
          <ArticleManagement
            articles={articles}
            onSuccess={revalidate}
          />
        </div>

        {/* Categories Sidebar */}
        <CategoriesSidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
    </div>
  );
};


interface CategoriesSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategoriesSidebar = React.memo(
  ({
    categories,
    selectedCategory,
    onCategorySelect,
  }: CategoriesSidebarProps) => (
    <section className="flex flex-col items-center bg-gray-100 ml-6 max-lg:hidden">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.id)}
          className={`font-bold py-4 px-3 rounded-xl shadow-sm w-64 mb-6 transition-colors ${
            selectedCategory === category.id
              ? "bg-[#006173] text-white"
              : "bg-white text-[#344054] hover:bg-gray-50"
          }`}
          aria-pressed={selectedCategory === category.id}
        >
          {category.name}
        </button>
      ))}
    </section>
  )
);
CategoriesSidebar.displayName = "CategoriesSidebar";

export default ControlPanel;
