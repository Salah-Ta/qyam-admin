import React, { useCallback, useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useDropzone } from "react-dropzone";
import { CheckIcon } from "lucide-react";
import { Link } from "@remix-run/react";
import { createId } from "@paralleldrive/cuid2";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import imageDashed from "../../../../assets/images/new-design/image-2.png";
import plusImg from "../../../../assets/images/new-design/plus-sign.svg";
import pdf01 from "../../../../assets/icons/pdf.svg";
import featuredIcon from "../../../../assets/icons/feature-2.svg";
import deleteIcon from "../../../../assets/icons/delete.svg";
import UploadCloudIcon from "../../../../assets/icons/upload-cloud.svg";
import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";
import type { Material } from "~/types/types";
import { createToastHeaders } from "~/lib/toast.server";
import materialDB from "~/db/material/material.server";
import articleDB from "~/db/articles/articles.server";
import type { Article } from "~/types/types";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";

// Utility function for class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Remix Loader & Action ---
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    // Add timeout to prevent worker from hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database operation timeout")), 10000)
    );

    const materialsPromise = materialDB.getAllMaterials(
      context.cloudflare.env.DATABASE_URL
    );

    const articlesPromise = articleDB.getAllArticles(
      context.cloudflare.env.DATABASE_URL
    );

    const [materialsRes, articlesRes] = await Promise.all([
      Promise.race([materialsPromise, timeoutPromise]),
      Promise.race([articlesPromise, timeoutPromise]),
    ]);

    return Response.json({
      materials: (materialsRes as any).data || [],
      articles: (articlesRes as any).data || [],
    });
  } catch (error) {
    console.error("Loader error:", error);
    return Response.json({
      materials: [],
      articles: [],
    });
  }
}

// export async function action({ request, context }: ActionFunctionArgs) {
//   const contentType = request.headers.get("Content-Type") || "";
//   const formData = await request.formData();
//   const actionType = formData.get("actionType") as string;

//   // Handle article operations
//   if (actionType === "deleteArticle") {
//     try {
//       await articleDB.deleteArticle(
//         formData.get("id") as string,
//         context.cloudflare.env.DATABASE_URL
//       );
//       return Response.json(
//         { success: true },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `تم حذف المقال بنجاح`,
//             type: "success",
//           }),
//         }
//       );
//     } catch {
//       return Response.json(
//         { success: false },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `فشلت عملية حذف المقال`,
//             type: "error",
//           }),
//         }
//       );
//     }
//   }

//   if (actionType === "updateArticle") {
//     try {
//       await articleDB.updateArticle(
//         {
//           id: formData.get("id") as string,
//           title: formData.get("title") as string,
//           description: formData.get("description") as string,
//           content: formData.get("content") as string,
//           image: formData.get("image") as string,
//         },
//         context.cloudflare.env.DATABASE_URL
//       );
//       return Response.json(
//         { success: true },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `تم تحديث المقال بنجاح`,
//             type: "success",
//           }),
//         }
//       );
//     } catch {
//       return Response.json(
//         { success: false },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `فشلت عملية تحديث المقال`,
//             type: "error",
//           }),
//         }
//       );
//     }
//   }

//   if (actionType === "createArticle") {
//     try {
//       await articleDB.createArticle(
//         {
//           title: formData.get("title") as string,
//           description: formData.get("description") as string,
//           content: formData.get("content") as string,
//           image: formData.get("image") as string,
//         },
//         context.cloudflare.env.DATABASE_URL
//       );
//       return Response.json(
//         { success: true },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `تم إنشاء المقال بنجاح`,
//             type: "success",
//           }),
//         }
//       );
//     } catch {
//       return Response.json(
//         { success: false },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `فشلت عملية إنشاء المقال`,
//             type: "error",
//           }),
//         }
//       );
//     }
//   }

//   // Handle file uploads
//   if (contentType.includes("multipart/form-data")) {
//     try {
//       const formData = await request.clone().formData();
//       const categoryId = formData.get("categoryId");
//       const uploadHandler = async ({ data, filename, contentType }: any) => {
//         const key = `${Date.now()}-${createId()}.${filename?.split(".")[1]}`;
//         const dataArray: any[] = [];
//         for await (const x of data) dataArray.push(x);
//         const file = new File(dataArray, filename, { type: contentType });
//         const buffer = await file.arrayBuffer();
//         await context.cloudflare.env.QYAM_BUCKET.put(key, buffer, {
//           httpMetadata: { contentType },
//         });
//         await materialDB.createMaterial(
//           {
//             title: filename,
//             storageKey: key,
//             categoryId: categoryId as string,
//             published: true,
//           },
//           context.cloudflare.env.DATABASE_URL
//         );
//         return true;
//       };
//       await unstable_parseMultipartFormData(request, uploadHandler as any);
//       return Response.json(
//         { success: true },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `تم رفع الملفات  بنجاح`,
//             type: "success",
//           }),
//         }
//       );
//     } catch (error) {
//       console.error("Upload error:", error);
//       return Response.json(
//         { success: false },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `فشل رفع الملفات`,
//             type: "error",
//           }),
//         }
//       );
//     }
//   } else {
//     // Handle material delete
//     try {
//       const formData = await request.formData();
//       await materialDB.deleteMaterial(
//         formData.get("id") as string,
//         context.cloudflare.env.DATABASE_URL
//       );
//       return Response.json(
//         { success: true },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `تم حذف الملف  بنجاح`,
//             type: "success",
//           }),
//         }
//       );
//     } catch {
//       return Response.json(
//         { success: false },
//         {
//           headers: await createToastHeaders({
//             description: "",
//             title: `فشلت عملية حذف  الملفات`,
//             type: "error",
//           }),
//         }
//       );
//     }
//   }
// }

export async function action({ request, context }: ActionFunctionArgs) {

  const uploadHandler = async ({ data, filename, contentType }: any) => {
        const key = `${Date.now()}-${createId()}.${filename?.split(".")[1]}`;
        const dataArray: any[] = [];
        for await (const x of data) dataArray.push(x);
        const file = new File(dataArray, filename, { type: contentType });
        const buffer = await file.arrayBuffer();
        await context.cloudflare.env.QYAM_BUCKET.put(key, buffer, {
          httpMetadata: { contentType },
        });
        await materialDB.createMaterial(
          {
            title: filename,
            storageKey: key,
            categoryId: "1",
            published: true,
          },
          context.cloudflare.env.DATABASE_URL
        );
        return true;
      };
      
  const contentType = request.headers.get("Content-Type") || "";
  // Handle file uploads
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.clone().formData();
      const categoryId = formData.get("categoryId");
      
      await unstable_parseMultipartFormData(request, uploadHandler as any);
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'تم رفع الملفات  بنجاح',
            type: "success",
          }),
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'فشل رفع الملفات',
            type: "error",
          }),
        }
      );
    }
  } else {
      const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  // Handle article operations
  if (actionType === "deleteArticle") {
    try {
      await articleDB.deleteArticle(
        formData.get("id") as string,
        context.cloudflare.env.DATABASE_URL
      );
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'تم حذف المقال بنجاح',
            type: "success",
          }),
        }
      );
    } catch {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'فشلت عملية حذف المقال',
            type: "error",
          }),
        }
      );
    }
  }

  if (actionType === "updateArticle") {
    try {
      await articleDB.updateArticle(
        {
          id: formData.get("id") as string,
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          content: formData.get("content") as string,
          image: formData.get("image") as string,
        },
        context.cloudflare.env.DATABASE_URL
      );
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'تم تحديث المقال بنجاح',
            type: "success",
          }),
        }
      );
    } catch {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'فشلت عملية تحديث المقال',
            type: "error",
          }),
        }
      );
    }
  }

  if (actionType === "createArticle") {
    try {
      await articleDB.createArticle(
        {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          content: formData.get("content") as string,
          image: formData.get("image") as string,
        },
        context.cloudflare.env.DATABASE_URL
      );
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'تم إنشاء المقال بنجاح',
            type: "success",
          }),
        }
      );
    } catch {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'فشلت عملية إنشاء المقال',
            type: "error",
          }),
        }
      );
    }
  }

  // Handle material delete
  try {
    const formData = await request.formData();
    await materialDB.deleteMaterial(
      formData.get("id") as string,
        context.cloudflare.env.DATABASE_URL
      );
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'تم حذف الملف بنجاح',
            type: "success",
          }),
        }
      );
    } catch {
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: 'فشلت عملية حذف الملفات',
            type: "error",
          }),
        }
      );
    }
  }
}

// --- Main Component ---
export const ControlPanel = (): JSX.Element => {
  const categories = [
    { name: "مركز المعرفة", id: "1" },
    { name: "أدلة البرنامج", id: "2" },
    { name: "أنشطة البرنامج", id: "3" },
    { name: "بنك الفرص التطوعية", id: "4" },
    { name: "أدوات التحفيز", id: "5" },
  ];
  // Use fetcher for revalidation after delete
  const dataFetcher = useFetcher<{ materials: Material[]; articles: Article[] } | null>({ key: "materials-articles" });
  const data = dataFetcher.data || useLoaderData<{ materials: Material[]; articles: Article[] } | null>();
  const materials = Array.isArray(data?.materials) ? data.materials : [];
  const articles = Array.isArray(data?.articles) ? data.articles : [];
  console.log("Materials loaded:", materials);
  console.log("Articles loaded:", articles);

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedButton, setSelectedButton] = useState<string>("1");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: "material" | "article";
    itemTitle: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: "material",
    itemTitle: "",
  });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    article: Article | null;
  }>({
    isOpen: false,
    article: null,
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
  });
  const [newArticleForm, setNewArticleForm] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
  });
  const [newArticleImageFile, setNewArticleImageFile] = useState<File | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const fetcher = useFetcher<{ success: boolean }>();

  // Reset new article form when successfully created
  useEffect(() => {
    if (fetcher.data?.success === true && fetcher.state === "idle") {
      resetNewArticleForm();
    }
  }, [fetcher.data?.success, fetcher.state]);

  // Dropzone logic
  const onDrop = useCallback((acceptedFiles: any[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  // Handlers
  const removeFileFromSelection = (file: any) => {
    setSelectedFiles(selectedFiles.filter((f) => file.path !== f.path));
  };

  const deleteMaterial = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    fetcher.submit(formData, { method: "POST" });
    setDeleteConfirmation({
      isOpen: false,
      itemId: "",
      itemType: "material",
      itemTitle: "",
    });
  };

  // Revalidate materials/articles after successful delete
  useEffect(() => {
    if (fetcher.data?.success === true && fetcher.state === "idle") {
      dataFetcher.load(window.location.pathname);
    }
  }, [fetcher.data?.success, fetcher.state]);

  const deleteArticle = (id: string) => {
    const formData = new FormData();
    formData.set("actionType", "deleteArticle");
    formData.set("id", id);
    fetcher.submit(formData, { method: "POST" });
    setDeleteConfirmation({
      isOpen: false,
      itemId: "",
      itemType: "article",
      itemTitle: "",
    });
  };

  const confirmDelete = (
    id: string,
    type: "material" | "article",
    title: string
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemTitle: title,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.itemType === "material") {
      deleteMaterial(deleteConfirmation.itemId);
    } else {
      deleteArticle(deleteConfirmation.itemId);
    }
  };

  const updateArticle = (id: string) => {
    if (!id || !Array.isArray(articles)) return;
    const article = articles.find((a) => a?.id === id);
    if (article) {
      setEditForm({
        title: article.title || "",
        description: article.description || "",
        content: article.content || "",
        image: article.image || "",
      });
      setEditDialog({
        isOpen: true,
        article: article as Article,
      });
    }
  };

  const handleEditSubmit = () => {
    if (!editDialog?.article?.id) return;

    const formData = new FormData();
    formData.set("actionType", "updateArticle");
    formData.set("id", editDialog.article.id);
    formData.set("title", editForm.title);
    formData.set("description", editForm.description);
    formData.set("content", editForm.content);
    formData.set("image", editForm.image);

    fetcher.submit(formData, { method: "POST" });
    setEditDialog({ isOpen: false, article: null });
  };

  const closeEditDialog = () => {
    setEditDialog({ isOpen: false, article: null });
    setEditForm({ title: "", description: "", content: "", image: "" });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewArticleImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setNewArticleForm({ ...newArticleForm, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewArticleSubmit = () => {
    if (!newArticleForm.title.trim() || !newArticleForm.content.trim()) {
      return;
    }

    const formData = new FormData();
    formData.set("actionType", "createArticle");
    formData.set("title", newArticleForm.title);
    formData.set("description", newArticleForm.description);
    formData.set("content", newArticleForm.content);
    formData.set("image", newArticleForm.image);

    fetcher.submit(formData, { method: "POST" });
  };

  const resetNewArticleForm = () => {
    setNewArticleForm({ title: "", description: "", content: "", image: "" });
    setNewArticleImageFile(null);
    setImagePreview("");
  };

  const uploadMaterial = () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    formData.set("categoryId", selectedButton);
    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
    setSelectedFiles([]);
  };

  const handleButtonClick = (buttonId: string) => {
    setSelectedButton(buttonId);
  };

  const filteredFiles = Array.isArray(materials) 
    ? materials.filter((file) => file?.categoryId === selectedButton)
    : [];

  return (
    <div>
      <div className="lg:flex items-start relative w-full h-full pt-6">
        <div className="flex flex-col gap-4 w-full">
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
                        key={i}
                        className="flex p-2 w-full my-2 items-center justify-between rounded-lg border border-gray-100 bg-gray-50"
                      >
                        <span className="w-1/2">
                          {file.relativePath?.split("/")[1] || file.name}
                        </span>
                        <span className="w-1/3">{file.size} بايت</span>
                        <Button
                          onClick={() => removeFileFromSelection(file)}
                          className="p-1 bg-transparent hover:bg-gray-100 ml-2 px-2"
                        >
                          <Icon name="remove" size="md" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={uploadMaterial} className="mt-4">
                    رفع الملفات
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
                {Array.isArray(filteredFiles) && filteredFiles.length > 0 ? (
                  filteredFiles.map((m: any, i: number) => (
                    <Card
                      key={m.id || i}
                      className="w-full md:flex-1 flex items-center justify-center gap-[13.75px] px-[13.75px] py-[11px] bg-white rounded-[11px] border-[2.38px] border-dashed border-[#cfd4dc] shadow-[0px_1.38px_2.75px_#1018280d]"
                    >
                      <button
                        onClick={() =>
                          confirmDelete(m?.id || '', "material", m?.title || '')
                        }
                        className="w-[16.5px] h-[16.5px]"
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                      <div className="font-normal text-black text-[13.8px] leading-[27.5px] whitespace-nowrap tracking-[0] [direction:rtl]">
                        {m?.title || 'ملف غير محدد'}
                      </div>
                      <a
                        className="w-[33px] h-[33px] flex items-center"
                        href={`/download/${m?.storageKey || ''}`}
                        download={sanitizeArabicFilenames(m?.title || '')}
                      >
                        <img
                          className="w-[33px] h-[33px]"
                          alt="PDF"
                          src={pdf01}
                        />
                      </a>
                    </Card>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-400 py-8">
                    لا توجد ملفات مرفوعة
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {fetcher.data?.success === false && (
                <StatusBadge
                  text="تأكد من حجم أو نوع الملف"
                  status="خطأ"
                  color="error"
                />
              )}
              {fetcher.data?.success === true && (
                <StatusBadge
                  text="تم رفع الملفات بنجاح"
                  status="نجاح"
                  color="success"
                />
              )}
            </CardContent>
          </Card>
          <Card className="w-full h-full rounded-2xl border border-[#d0d5dd]">
            <CardContent className="p-8 flex flex-col gap-4">
              {/* Articles Section */}
              <div className="flex items-center gap-[5px] self-end">
                <div className="w-[18px] h-[18px] bg-blue-100 rounded-[9px] flex items-center justify-center">
                  <CheckIcon className="w-[9px] h-[9px] text-blue-600" />
                </div>
                <div className="font-bold text-center align-middle tracking-[0] leading-none text-4xl [font-weight:700]">
                 أدوات التحفيز
                </div>
              </div>

              {/* Articles Grid */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full mt-2"
                dir="rtl"
              >
                {/* Add New Article Card - Always First */}
                <Card className="w-full rounded-[11.78px] shadow-lg bg-white overflow-hidden order-1">
                  <div className="p-4 space-y-4">
                    {/* Article Title Input */}
                    <div>
                      <Input
                        value={newArticleForm.title}
                        onChange={(e) =>
                          setNewArticleForm({
                            ...newArticleForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="عنوان المقال الجديد"
                        className="w-full text-right font-bold text-[#1F2A37] border-none bg-transparent text-lg p-0"
                        dir="rtl"
                      />
                    </div>

                    {/* Article Description Input */}
                    <div>
                      <Input
                        value={newArticleForm.description}
                        onChange={(e) =>
                          setNewArticleForm({
                            ...newArticleForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="وصف قصير للمقال"
                        className="w-full text-right text-[#6B7280] border-none bg-transparent p-0"
                        dir="rtl"
                      />
                    </div>

                    {/* Image Upload Section */}
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
                        className="block w-full h-[120px] rounded-[5.89px] cursor-pointer relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-[#006173] transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Article preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              backgroundImage: `url(${imageDashed})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          >
                            <div className="bg-white bg-opacity-80 rounded-lg p-2 text-center">
                              <img
                                src={plusImg}
                                alt="Upload"
                                className="w-6 h-6 mx-auto mb-1"
                              />
                              <span className="text-[#006173] font-medium text-sm">
                                اضغط لرفع صورة
                              </span>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Article Content Textarea */}
                    <div>
                      <Textarea
                        value={newArticleForm.content}
                        onChange={(e) =>
                          setNewArticleForm({
                            ...newArticleForm,
                            content: e.target.value,
                          })
                        }
                        placeholder="اكتب محتوى المقال هنا..."
                        className="w-full h-20 text-right border-none bg-gray-50 resize-none text-sm"
                        dir="rtl"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                      <Button
                        onClick={resetNewArticleForm}
                        variant="outline"
                        size="sm"
                        className="text-gray-600 text-xs px-3 py-1"
                      >
                        إعادة تعيين
                      </Button>
                      <Button
                        onClick={handleNewArticleSubmit}
                        size="sm"
                        className="bg-[#006173] text-white hover:bg-teal-800 transition text-xs px-3 py-1 flex items-center gap-1"
                        disabled={
                          !newArticleForm.title.trim() ||
                          !newArticleForm.content.trim() ||
                          fetcher.state === "submitting"
                        }
                      >
                        {fetcher.state === "submitting"
                          ? "جاري النشر..."
                          : "نشر المقال"}
                        <img src={plusImg} alt="" className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Existing Articles - Newest first (to the left of add card) */}
                {Array.isArray(articles) &&
                  articles.length > 0 &&
                  articles
                    .filter(article => article && article.id)
                    .sort(
                      (a, b) =>
                        new Date(b?.createdAt || 0).getTime() -
                        new Date(a?.createdAt || 0).getTime()
                    )
                    .map((article: any, i: number) => (
                      <Card
                        key={article.id || i}
                        className={`w-full rounded-[11.78px] shadow-lg bg-white overflow-hidden order-${
                          i + 2
                        }`}
                      >
                        <div className="p-4 space-y-4">
                          {/* Article Title */}
                          <div>
                            <div className="w-full text-right font-bold text-[#1F2A37] border-none bg-transparent text-lg p-0">
                              {article?.title || 'مقال بدون عنوان'}
                            </div>
                          </div>

                          {/* Article Description */}
                          <div>
                            <div className="w-full text-right text-[#6B7280] border-none bg-transparent p-0">
                              {article?.description || 'لا يوجد وصف'}
                            </div>
                          </div>

                          {/* Article Image */}
                          <div className="relative">
                            {article?.image ? (
                              <img
                                src={article.image}
                                alt={article?.title || 'صورة المقال'}
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
                              {article?.content || "لا يوجد محتوى"}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 text-xs px-3 py-1"
                              onClick={() =>
                                confirmDelete(
                                  article?.id || '',
                                  "article",
                                  article?.title || ''
                                )
                              }
                            >
                              حذف
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#006173] text-white hover:bg-teal-800 transition text-xs px-3 py-1 flex items-center gap-1"
                              onClick={() => updateArticle(article?.id || '')}
                            >
                              تعديل
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                {/* Empty State - Only show if no articles and it's not the add card */}
                {(!articles || articles.length === 0) && (
                  <div className="col-span-full flex items-center justify-center py-12 text-gray-400">
                    <div className="text-center">
                      <div className="text-lg mb-2">لا توجد مقالات منشورة</div>
                      <div className="text-sm">
                        ابدأ بإضافة مقال جديد من البطاقة أعلاه
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Confirmation Dialog */}
              {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold text-right mb-4">
                      تأكيد الحذف
                    </h3>
                    <p className="text-gray-600 text-right mb-6">
                      هل أنت متأكد من حذف "{deleteConfirmation?.itemTitle || 'العنصر'}"؟ لا
                      يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <Button
                        onClick={() =>
                          setDeleteConfirmation({
                            isOpen: false,
                            itemId: "",
                            itemType: "material",
                            itemTitle: "",
                          })
                        }
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
        </div>

        {/* Categories Sidebar */}
        <section className="flex flex-col items-center bg-gray-100 ml-6 max-lg:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleButtonClick(category.id)}
              className={`font-bold py-4 px-3 rounded-xl shadow-sm w-64 mb-6 ${
                selectedButton === category.id
                  ? "bg-[#006173] text-white"
                  : "bg-white text-[#344054]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};

// --- UI Subcomponents ---
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

export default ControlPanel;
