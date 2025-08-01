import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import { CheckIcon, PlusIcon } from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import imageDashed from "../../assets/images/new-design/image-2.png";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { Article } from "~/types/types";

// Utility function for class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface DeleteConfirmation {
  isOpen: boolean;
  itemId: string;
  itemType: "material" | "article";
  itemTitle: string;
}

interface EditDialog {
  isOpen: boolean;
  article: Article | null;
}

interface ArticleForm {
  title: string;
  description: string;
  content: string;
  image: string;
}

interface ActionData {
  success: boolean;
}

const INITIAL_ARTICLE_FORM: ArticleForm = {
  title: "",
  description: "",
  content: "",
  image: "",
};

const INITIAL_DELETE_CONFIRMATION: DeleteConfirmation = {
  isOpen: false,
  itemId: "",
  itemType: "article",
  itemTitle: "",
};

const INITIAL_EDIT_DIALOG: EditDialog = {
  isOpen: false,
  article: null,
};

// Custom Hooks
const useDeleteArticle = () => {
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>(INITIAL_DELETE_CONFIRMATION);
  const fetcher = useFetcher<ActionData>();

  const confirmDelete = useCallback(
    (id: string, title: string) => {
      setDeleteConfirmation({
        isOpen: true,
        itemId: id,
        itemType: "article",
        itemTitle: title,
      });
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    const { itemId } = deleteConfirmation;
    const formData = new FormData();
    formData.set("actionType", "deleteArticle");
    formData.set("id", itemId);

    fetcher.submit(formData, { method: "POST", action: "/dashboard/admin/articles" });
    setDeleteConfirmation(INITIAL_DELETE_CONFIRMATION);
  }, [deleteConfirmation, fetcher]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmation(INITIAL_DELETE_CONFIRMATION);
  }, []);

  return {
    deleteConfirmation,
    confirmDelete,
    handleConfirmDelete,
    cancelDelete,
    isDeleting: fetcher.state === "submitting",
    deleteResult: fetcher.data,
  };
};

const useArticleManagement = (onSuccess: () => void) => {
  const [editDialog, setEditDialog] = useState<EditDialog>(INITIAL_EDIT_DIALOG);
  const [editForm, setEditForm] = useState<ArticleForm>(INITIAL_ARTICLE_FORM);
  const [newArticleForm, setNewArticleForm] =
    useState<ArticleForm>(INITIAL_ARTICLE_FORM);
  const [newArticleImageFile, setNewArticleImageFile] = useState<File | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const fetcher = useFetcher<ActionData>();
  const successHandledRef = useRef<string | null>(null);

  const resetNewArticleForm = useCallback(() => {
    setNewArticleForm(INITIAL_ARTICLE_FORM);
    setNewArticleImageFile(null);
    setImagePreview("");
  }, []);

  const openEditDialog = useCallback((article: Article) => {
    setEditForm({
      title: article.title || "",
      description: article.description || "",
      content: article.content || "",
      image: article.image || "",
    });
    setEditDialog({ isOpen: true, article });
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialog(INITIAL_EDIT_DIALOG);
    setEditForm(INITIAL_ARTICLE_FORM);
  }, []);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setNewArticleImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImagePreview(result);
          setNewArticleForm((prev) => ({ ...prev, image: result }));
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleNewArticleSubmit = useCallback(() => {
    if (!newArticleForm.title.trim() || !newArticleForm.content.trim()) return;

    const formData = new FormData();
    formData.set("actionType", "createArticle");
    Object.entries(newArticleForm).forEach(([key, value]) => {
      formData.set(key, value);
    });

    // Reset success tracking when starting new submission
    successHandledRef.current = null;

    fetcher.submit(formData, { method: "POST", action: "/dashboard/admin/articles" });
  }, [newArticleForm, fetcher]);

  const handleEditSubmit = useCallback(() => {
    if (
      !editDialog.article?.id ||
      !editForm.title.trim() ||
      !editForm.content.trim()
    )
      return;

    const formData = new FormData();
    formData.set("actionType", "updateArticle");
    formData.set("id", editDialog.article.id);
    Object.entries(editForm).forEach(([key, value]) => {
      formData.set(key, value);
    });

    fetcher.submit(formData, { method: "POST", action: "/dashboard/admin/articles" });
    closeEditDialog();
  }, [editDialog, editForm, fetcher, closeEditDialog]);

  // Reset form after successful creation (only once per submission)
  useEffect(() => {
    const submissionKey = fetcher.key;
    if (
      fetcher.data?.success && 
      fetcher.state === "idle" && 
      submissionKey !== successHandledRef.current
    ) {
      resetNewArticleForm();
      onSuccess();
      successHandledRef.current = submissionKey;
    }
  }, [fetcher.data?.success, fetcher.state, fetcher.key, resetNewArticleForm, onSuccess]);

  return {
    editDialog,
    editForm,
    setEditForm,
    newArticleForm,
    setNewArticleForm,
    imagePreview,
    openEditDialog,
    closeEditDialog,
    handleImageUpload,
    handleNewArticleSubmit,
    handleEditSubmit,
    resetNewArticleForm,
    isSubmitting: fetcher.state === "submitting",
    submitResult: fetcher.data,
  };
};

// UI Components
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (id: string, title: string) => void;
}

const ArticleCard = React.memo(
  ({ article, onEdit, onDelete }: ArticleCardProps) => (
    <Card className="w-full rounded-[11.78px] shadow-lg bg-white overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Article Title */}
        <div>
          <div className="w-full text-right font-bold text-[#1F2A37] border-none bg-transparent text-lg p-0">
            {article.title || "مقال بدون عنوان"}
          </div>
        </div>

        {/* Article Description */}
        <div>
          <div className="w-full text-right text-[#6B7280] border-none bg-transparent p-0">
            {article.description || "لا يوجد وصف"}
          </div>
        </div>

        {/* Article Image */}
        <div className="relative">
          {article.image ? (
            <img
              src={article.image}
              alt={article.title || "صورة المقال"}
              className="w-full h-[120px] object-cover rounded-[5.89px]"
            />
          ) : (
            <div
              className="w-full h-[120px] rounded-[5.89px] border-2 border-dashed border-gray-300 flex items-center justify-center"
              style={{
                backgroundImage: `url(${imageDashed})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="bg-white bg-opacity-80 rounded-lg p-2 text-center">
                <span className="text-gray-400 font-medium text-sm">
                  لا توجد صورة
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Article Content Preview */}
        <div>
          <div className="w-full h-20 text-right border-none bg-gray-50 resize-none text-sm p-2 rounded overflow-hidden">
            {article.content || "لا يوجد محتوى"}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 text-xs px-3 py-1"
            onClick={() => onDelete(article.id, article.title)}
          >
            حذف
          </Button>
          <Button
            size="sm"
            className="bg-[#006173] text-white hover:bg-teal-800 transition text-xs px-3 py-1 flex items-center gap-1"
            onClick={() => onEdit(article)}
          >
            تعديل
          </Button>
        </div>
      </div>
    </Card>
  )
);
ArticleCard.displayName = "ArticleCard";

interface ArticleManagementProps {
  articles: Article[];
  onSuccess: () => void;
}

export const ArticleManagement: React.FC<ArticleManagementProps> = ({
  articles,
  onSuccess,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    deleteConfirmation,
    confirmDelete,
    handleConfirmDelete,
    cancelDelete,
  } = useDeleteArticle();

  const {
    editDialog,
    editForm,
    setEditForm,
    newArticleForm,
    setNewArticleForm,
    imagePreview,
    openEditDialog,
    closeEditDialog,
    handleImageUpload,
    handleNewArticleSubmit,
    handleEditSubmit,
    resetNewArticleForm,
    isSubmitting,
  } = useArticleManagement(onSuccess);

  const sortedArticles = useMemo(
    () =>
      articles
        .filter((article) => article && article.id)
        .sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime()
        ),
    [articles]
  );

  return (
    <Card className="w-full h-full rounded-2xl border border-[#d0d5dd]">
      <CardContent className="p-8 flex flex-col gap-4">
        {/* Articles Section Header */}
        <div className="flex items-center gap-[5px] self-end">
          <div className="w-[18px] h-[18px] bg-blue-100 rounded-[9px] flex items-center justify-center">
            <CheckIcon className="w-[9px] h-[9px] text-blue-600" />
          </div>
          <div className="font-bold text-center align-middle tracking-[0] leading-none text-4xl">
            أدوات التحفيز
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full mt-2"
          dir="rtl"
        >
          {/* Add New Article Button */}
          <div className="w-full">
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-[#d0d5dd] rounded-2xl hover:border-[#006173] transition-colors"
            >
              <div className="bg-[#f0f9ff] rounded-full p-3">
                <PlusIcon className="w-6 h-6 text-[#006173]" />
              </div>
              <span className="font-bold text-lg text-[#006173]">
                إضافة مقال جديد
              </span>
            </button>
          </div>

          {/* Existing Articles */}
          {sortedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={openEditDialog}
              onDelete={confirmDelete}
            />
          ))}

          {/* Empty State */}
          {sortedArticles.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-12 text-gray-400">
              <div className="text-center">
                <div className="text-lg mb-2">لا توجد مقالات منشورة</div>
                <div className="text-sm">
                  ابدأ بإضافة مقال جديد من الزر أعلاه
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Article Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
            <DialogHeader className="items-end">
              <DialogTitle className="text-right mt-2">
                إضافة مقال جديد
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Article Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  عنوان المقال
                </label>
                <Input
                  value={newArticleForm.title}
                  onChange={(e) =>
                    setNewArticleForm({
                      ...newArticleForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="أدخل عنوان المقال"
                  className="w-full text-right"
                  dir="rtl"
                />
              </div>
              {/* Article Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  وصف المقال
                </label>
                <Input
                  value={newArticleForm.description}
                  onChange={(e) =>
                    setNewArticleForm({
                      ...newArticleForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="أدخل وصف المقال"
                  className="w-full text-right"
                  dir="rtl"
                />
              </div>
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  صورة المقال
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="article-image-upload"
                  />
                  <label
                    htmlFor="article-image-upload"
                    className="block w-full h-[120px] rounded-md cursor-pointer relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#006173] transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Article preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <PlusIcon className="w-8 h-8 text-[#006173] mb-2" />
                        <span className="text-[#006173] font-medium">
                          اضغط لرفع صورة
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          يفضل صورة بحجم 1200x630 بكسل
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              {/* Article Content Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  محتوى المقال
                </label>
                <Textarea
                  value={newArticleForm.content}
                  onChange={(e) =>
                    setNewArticleForm({
                      ...newArticleForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="أدخل محتوى المقال..."
                  className="w-full h-30 text-right"
                  dir="rtl"
                />
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 pb-2">
                <Button
                  onClick={() => {
                    resetNewArticleForm();
                    setIsAddDialogOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => {
                    handleNewArticleSubmit();
                    setIsAddDialogOpen(false);
                  }}
                  size="sm"
                  className="bg-[#006173] text-white hover:bg-[#004d5c]"
                  disabled={
                    !newArticleForm.title.trim() ||
                    !newArticleForm.content.trim() ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? "جاري النشر..." : "نشر المقال"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-right mb-4">
                تأكيد الحذف
              </h3>
              <p className="text-gray-600 text-right mb-6">
                هل أنت متأكد من حذف "
                {deleteConfirmation?.itemTitle || "العنصر"}"؟ لا يمكن
                التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={cancelDelete}
                  variant="outline"
                  size="sm"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  size="sm"
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Article Dialog */}
        <Dialog
          open={editDialog.isOpen}
          onOpenChange={(open) => !open && closeEditDialog()}
        >
          <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-right">
                تعديل المقال
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  عنوان المقال
                </label>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="أدخل عنوان المقال"
                  className="w-full text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  وصف المقال
                </label>
                <Input
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="أدخل وصف المقال"
                  className="w-full text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  رابط الصورة
                </label>
                <Input
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  placeholder="أدخل رابط الصورة"
                  className="w-full text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  محتوى المقال
                </label>
                <Textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  placeholder="أدخل محتوى المقال"
                  className="w-full h-40 text-right"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  onClick={closeEditDialog}
                  variant="outline"
                  size="sm"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  size="sm"
                  className="bg-[#006173] text-white hover:bg-[#004d5c]"
                  disabled={
                    !editForm.title.trim() || !editForm.content.trim()
                  }
                >
                  حفظ التعديلات
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};