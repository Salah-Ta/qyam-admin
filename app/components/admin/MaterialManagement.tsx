import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import { useDropzone } from "react-dropzone";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import pdf01 from "../../assets/icons/pdf.svg";
import featuredIcon from "../../assets/icons/feature-2.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import UploadCloudIcon from "../../assets/icons/upload-cloud.svg";
import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";
import type { Material } from "~/types/types";

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
  const successHandledRef = useRef<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    }, []),
    accept: { "application/pdf": [".pdf"] },
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

  // Reset files after successful upload (only once per submission)
  useEffect(() => {
    const submissionKey = fetcher.key;
    if (
      fetcher.data?.success && 
      fetcher.state === "idle" && 
      submissionKey !== successHandledRef.current
    ) {
      setSelectedFiles([]);
      onSuccess();
      successHandledRef.current = submissionKey;
    }
  }, [fetcher.data?.success, fetcher.state, fetcher.key, onSuccess]);

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

interface MaterialCardProps {
  material: Material;
  onDelete: (id: string, title: string) => void;
}

const MaterialCard = React.memo(({ material, onDelete }: MaterialCardProps) => (
  <Card className="w-full md:flex-1 flex items-center justify-center gap-[13.75px] px-[13.75px] py-[11px] bg-white rounded-[11px] border-[2.38px] border-dashed border-[#cfd4dc] shadow-[0px_1.38px_2.75px_#1018280d]">
    <button
      onClick={() => onDelete(material.id, material.title)}
      className="w-[16.5px] h-[16.5px] hover:opacity-70 transition-opacity"
      aria-label={`حذف ${material.title}`}
    >
      <img src={deleteIcon} alt="Delete" />
    </button>
    <div className="font-normal text-black text-[13.8px] leading-[27.5px] whitespace-nowrap tracking-[0] [direction:rtl]">
      {material.title || "ملف غير محدد"}
    </div>
    <a
      className="w-[33px] h-[33px] flex items-center hover:opacity-70 transition-opacity"
      href={`/download/${material.storageKey}`}
      download={sanitizeArabicFilenames(material.title)}
      aria-label={`تحميل ${material.title}`}
    >
      <img className="w-[33px] h-[33px]" alt="PDF" src={pdf01} />
    </a>
  </Card>
));
MaterialCard.displayName = "MaterialCard";

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

  const filteredMaterials = useMemo(
    () =>
      materials.filter((material) => material?.categoryId === selectedCategory),
    [materials, selectedCategory]
  );

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
              PDF فقط (max.4.00 MB)
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

        {/* Uploaded Items Label */}
        <div className="flex items-center gap-[5px] self-end mt-16">
          <div className="w-[18px] h-[18px] bg-success-100 rounded-[9px] flex items-center justify-center">
            <img src={featuredIcon} alt="" className="w-[9px] h-[9px]" />
          </div>
          <div className="font-medium text-[#039754] text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap [direction:rtl]">
            الملفات المرفوعة
          </div>
        </div>

        {/* Uploaded Files List */}
        <div className="flex flex-col md:flex-row gap-6 w-full mt-2 flex-wrap">
          {isLoading ? (
            <div className="w-full text-center text-gray-400 py-8">
              جاري التحميل...
            </div>
          ) : filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onDelete={confirmDelete}
              />
            ))
          ) : (
            <div className="w-full text-center text-gray-400 py-8">
              لا توجد ملفات مرفوعة
            </div>
          )}
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