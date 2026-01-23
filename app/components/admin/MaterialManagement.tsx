import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import { useDropzone } from "react-dropzone";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import pdf01 from "../../assets/icons/pdf.svg";
import wordIcon from "../../assets/icons/file-type-blue.svg";
import featuredIcon from "../../assets/icons/feature-2.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import UploadCloudIcon from "../../assets/icons/upload-cloud.svg";
import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";
import type { Material } from "~/types/types";

// Sort options
type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "الاسم (أ-ي)" },
  { value: "name-desc", label: "الاسم (ي-أ)" },
  { value: "date-desc", label: "الأحدث أولاً" },
  { value: "date-asc", label: "الأقدم أولاً" },
];

// Helper to determine file type from filename
const getFileType = (filename: string): "pdf" | "word" => {
  const extension = filename?.toLowerCase().split(".").pop();
  if (extension === "doc" || extension === "docx") {
    return "word";
  }
  return "pdf";
};

// Utility function for class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Category {
  name: string;
  id: string;
}

interface ActionData {
  success: boolean;
}

interface DeleteConfirmation {
  isOpen: boolean;
  itemId: string;
  itemType: "material" | "article";
  itemTitle: string;
}

// Allowed file types per category
// Category 4 (بنك الفرص التطوعية) allows Word files for editing
const getAcceptedFileTypes = (categoryId: string): Record<string, string[]> => {
  if (categoryId === "4") {
    return {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    };
  }
  return { "application/pdf": [".pdf"] };
};

const INITIAL_DELETE_CONFIRMATION: DeleteConfirmation = {
  isOpen: false,
  itemId: "",
  itemType: "material",
  itemTitle: "",
};

// Custom Hooks
const useFileUpload = (selectedCategory: string, onSuccess: () => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fetcher = useFetcher<ActionData>();
  const successHandledRef = useRef<number | null>(null);

  const acceptedTypes = useMemo(() => getAcceptedFileTypes(selectedCategory), [selectedCategory]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    }, []),
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 4 * 1024 * 1024, // 4MB
  });

  const removeFileFromSelection = useCallback((fileToRemove: File) => {
    setSelectedFiles((files) => files.filter((file) => file !== fileToRemove));
  }, []);

  const uploadFiles = useCallback(() => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.set("categoryId", selectedCategory);

    // Reset success tracking when starting new upload
    successHandledRef.current = null;

    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
      action: "/dashboard/admin/materials",
    });
  }, [selectedFiles, selectedCategory, fetcher]);

  // Track submission count for deduplication
  const submissionCountRef = useRef(0);

  // Reset files after successful upload (only once per submission)
  useEffect(() => {
    if (fetcher.state === "submitting") {
      submissionCountRef.current += 1;
    }
  }, [fetcher.state]);

  useEffect(() => {
    const currentCount = submissionCountRef.current;
    if (
      fetcher.data?.success &&
      fetcher.state === "idle" &&
      currentCount !== successHandledRef.current
    ) {
      setSelectedFiles([]);
      onSuccess();
      successHandledRef.current = currentCount;
    }
  }, [fetcher.data?.success, fetcher.state, onSuccess]);

  return {
    selectedFiles,
    uploadFiles,
    removeFileFromSelection,
    getRootProps,
    getInputProps,
    isUploading: fetcher.state === "submitting",
    uploadResult: fetcher.data,
  };
};

const useDeleteMaterial = () => {
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>(INITIAL_DELETE_CONFIRMATION);
  const fetcher = useFetcher<ActionData>();

  const confirmDelete = useCallback(
    (id: string, title: string) => {
      setDeleteConfirmation({
        isOpen: true,
        itemId: id,
        itemType: "material",
        itemTitle: title,
      });
    },
    []
  );

  const handleConfirmDelete = useCallback(() => {
    const { itemId } = deleteConfirmation;
    const formData = new FormData();
    formData.set("id", itemId);

    fetcher.submit(formData, { method: "POST", action: "/dashboard/admin/materials" });
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

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

// Status badge for upload/delete feedback
function StatusBadge({
  text,
  status,
  color,
}: {
  text: string;
  status: string;
  color: "success" | "error";
}) {
  const bg = color === "success" ? "bg-[#ECFDF3]" : "bg-[#fef3f2]";
  const border =
    color === "success" ? "border-[#0dbd7563]" : "border-[#fecdc9]";
  const textColor = color === "success" ? "text-[#027A48]" : "text-[#b32318]";
  return (
    <div className="flex flex-col md:flex-row gap-4 self-end mt-[29px]">
      <Badge
        className={`flex items-center justify-between md:justify-start w-full md:w-auto gap-3 pl-2 pr-2 py-1 ${bg} rounded-2xl`}
      >
        <div
          className={`${textColor} font-medium text-sm tracking-[0] leading-5 whitespace-nowrap`}
        >
          {text}
        </div>
        <div className={`px-2.5 py-0.5 bg-white rounded-2xl border ${border}`}>
          <span
            className={`font-medium ${textColor} text-sm text-center leading-5 whitespace-nowrap tracking-[0]`}
          >
            {status}
          </span>
        </div>
      </Badge>
    </div>
  );
}

interface MaterialListItemProps {
  material: Material;
  onDelete: (id: string, title: string) => void;
  index: number;
}

const MaterialListItem = React.memo(({ material, onDelete, index }: MaterialListItemProps) => {
  const fileType = getFileType(material.title);
  const isPdf = fileType === "pdf";

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e4e7ec] shadow-sm hover:shadow-md transition-shadow [direction:rtl]">
      {/* Row Number */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium text-gray-600">
        {index + 1}
      </div>

      {/* File Icon - PDF (red) or Word (blue) */}
      <a
        className={cn(
          "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
          isPdf ? "bg-red-50 hover:bg-red-100" : "bg-blue-50 hover:bg-blue-100"
        )}
        href={`/download/${material.storageKey}`}
        download={sanitizeArabicFilenames(material.title)}
        aria-label={`تحميل ${material.title}`}
      >
        <img className="w-6 h-6" alt={isPdf ? "PDF" : "Word"} src={isPdf ? pdf01 : wordIcon} />
      </a>

    {/* File Name */}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm truncate">
        {material.title || "ملف غير محدد"}
      </p>
      {material.createdAt && (
        <p className="text-xs text-gray-500 mt-1">
          {new Date(material.createdAt).toLocaleDateString("ar-SA")}
        </p>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <a
        className="p-2 text-[#8bc53f] hover:bg-green-50 rounded-lg transition-colors"
        href={`/download/${material.storageKey}`}
        download={sanitizeArabicFilenames(material.title)}
        aria-label={`تحميل ${material.title}`}
      >
        <Icon name="download" size="sm" />
      </a>
      <button
        onClick={() => material.id && onDelete(material.id, material.title)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        aria-label={`حذف ${material.title}`}
      >
        <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
      </button>
    </div>
  </div>
  );
});
MaterialListItem.displayName = "MaterialListItem";

interface MaterialManagementProps {
  materials: Material[];
  selectedCategory: string;
  isLoading: boolean;
  onSuccess: () => void;
}

export const MaterialManagement: React.FC<MaterialManagementProps> = ({
  materials,
  selectedCategory,
  isLoading,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-asc");

  const {
    selectedFiles,
    uploadFiles,
    removeFileFromSelection,
    getRootProps,
    getInputProps,
    isUploading,
    uploadResult,
  } = useFileUpload(selectedCategory, onSuccess);

  const {
    deleteConfirmation,
    confirmDelete,
    handleConfirmDelete,
    cancelDelete,
  } = useDeleteMaterial();

  // Filter by category, then by search query, then sort
  const filteredAndSortedMaterials = useMemo(() => {
    let result = materials.filter(
      (material) => material?.categoryId === selectedCategory
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((material) =>
        material.title?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return (a.title || "").localeCompare(b.title || "", "ar");
        case "name-desc":
          return (b.title || "").localeCompare(a.title || "", "ar");
        case "date-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "date-desc":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [materials, selectedCategory, searchQuery, sortOption]);

  return (
    <Card className="w-full h-full rounded-2xl border border-[#d0d5dd]">
      <CardContent className="p-8 flex flex-col gap-4">
        {/* Upload Area */}
        <div
          className="flex flex-col items-center gap-3 p-4 bg-[#fdfdfd] rounded-[8px] border border-[#e4e7ec] [direction:rtl] cursor-pointer"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div className="relative w-[46px] h-[46px] bg-gray-100 rounded-[28px] border-[6px] border-[#f8f9fb] flex items-center justify-center">
            <img src={UploadCloudIcon} alt="" />
          </div>
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="flex items-center justify-center gap-1 w-full">
              <div className="font-normal text-gray-600 text-sm leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
                أو بالسحب والإفلات
              </div>
              <div className="inline-flex items-center justify-center gap-2">
                <div className="font-bold text-[#8bc53f] text-sm leading-5 whitespace-nowrap tracking-[0] [direction:rtl]">
                  قم بالضغط للتحميل
                </div>
              </div>
            </div>
            <div className="text-gray-600 text-xs text-center leading-[18px] font-normal tracking-[0]">
              PDF و Word فقط (max.4.00 MB)
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="border border-[#E4E7EC] mt-6 rounded-lg p-4">
            <p className="mb-2">
              الملفات المختارة ({selectedFiles.length})
            </p>
            <ul>
              {selectedFiles.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex p-2 w-full my-2 items-center justify-between rounded-lg border border-gray-100 bg-gray-50"
                >
                  <span className="w-1/2">{file.name}</span>
                  <span className="w-1/3">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <Button
                    onClick={() => removeFileFromSelection(file)}
                    className="p-1 bg-transparent hover:bg-gray-100 ml-2 px-2"
                    disabled={isUploading}
                  >
                    <Icon name="remove" size="md" />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              onClick={uploadFiles}
              className="mt-4"
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? "جاري الرفع..." : "رفع الملفات"}
            </Button>
          </div>
        )}

        {/* Uploaded Items Section */}
        <div className="mt-8 [direction:rtl]">
          {/* Header with Label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center">
                <img src={featuredIcon} alt="" className="w-3 h-3" />
              </div>
              <span className="font-medium text-[#039754] text-base">
                الملفات المرفوعة
              </span>
              <span className="text-gray-400 text-sm">
                ({filteredAndSortedMaterials.length})
              </span>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ابحث عن ملف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8bc53f] focus:border-transparent"
              />
              <Icon
                name="search"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8bc53f] focus:border-transparent cursor-pointer min-w-[150px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Files List */}
          <div className="flex flex-col gap-3 w-full">
            {isLoading ? (
              <div className="w-full text-center text-gray-400 py-8">
                جاري التحميل...
              </div>
            ) : filteredAndSortedMaterials.length > 0 ? (
              filteredAndSortedMaterials.map((material, index) => (
                <MaterialListItem
                  key={material.id}
                  material={material}
                  onDelete={confirmDelete}
                  index={index}
                />
              ))
            ) : searchQuery ? (
              <div className="w-full text-center text-gray-400 py-8 bg-gray-50 rounded-lg">
                لا توجد نتائج للبحث "{searchQuery}"
              </div>
            ) : (
              <div className="w-full text-center text-gray-400 py-8 bg-gray-50 rounded-lg">
                لا توجد ملفات مرفوعة
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {uploadResult?.success === false && (
          <StatusBadge
            text="تأكد من حجم أو نوع الملف"
            status="خطأ"
            color="error"
          />
        )}
        {uploadResult?.success === true && (
          <StatusBadge
            text="تم رفع الملفات بنجاح"
            status="نجاح"
            color="success"
          />
        )}

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
      </CardContent>
    </Card>
  );
};