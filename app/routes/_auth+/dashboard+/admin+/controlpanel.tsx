import React, { useCallback, useState } from "react";
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
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";
import type { Material } from "~/types/types";
import { createToastHeaders } from "~/lib/toast.server";
import materialDB from "~/db/material/material.server";
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
    const res = await materialDB.getAllMaterials(
      context.cloudflare.env.DATABASE_URL
    );
    return Response.json(res.data);
  } catch {
    return null;
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const contentType = request.headers.get("Content-Type") || "";

  // Handle file uploads
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.clone().formData();
      const categoryId = formData.get("categoryId");
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
            categoryId: categoryId as string,
            published: true,
          },
          context.cloudflare.env.DATABASE_URL
        );
        return true;
      };
      await unstable_parseMultipartFormData(request, uploadHandler as any);
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: `تم رفع الملفات  بنجاح`,
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
            title: `فشلت عملية رفع  الملفات`,
            type: "error",
          }),
        }
      );
    }
  } else {
    // Handle delete
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
            title: `تم حذف الملف  بنجاح`,
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
            title: `فشلت عملية حذف  الملفات`,
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
  const materials = useLoaderData<any[]>() || [];
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedButton, setSelectedButton] = useState<string>("1");
  const fetcher = useFetcher();

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

  const filteredFiles = materials.filter(
    (file) => file.categoryId === selectedButton
  );

  return (
    <div>
      <div className="lg:flex items-start relative w-full h-full pt-6">
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
                <CheckIcon className="w-[9px] h-[9px]" />
                <img src={featuredIcon} alt="" />
              </div>
              <div className="font-medium text-[#039754] text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap [direction:rtl]">
                الملفات المرفوعة
              </div>
            </div>

            {/* Uploaded Files List */}
            <div className="flex flex-col md:flex-row gap-6 w-full mt-2 flex-wrap">
              {filteredFiles && filteredFiles.length > 0 ? (
                filteredFiles.map((m: Material, i: number) => (
                  <Card
                    key={m.id || i}
                    className="w-full md:flex-1 flex items-center justify-center gap-[13.75px] px-[13.75px] py-[11px] bg-white rounded-[11px] border-[2.38px] border-dashed border-[#cfd4dc] shadow-[0px_1.38px_2.75px_#1018280d]"
                  >
                    <button
                      onClick={() => deleteMaterial(m.id!)}
                      className="w-[16.5px] h-[16.5px]"
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                    <div className="font-normal text-black text-[13.8px] leading-[27.5px] whitespace-nowrap tracking-[0] [direction:rtl]">
                      {m.title}
                    </div>
                    <a
                      className="w-[33px] h-[33px] flex items-center"
                      href={`/download/${m.storageKey}`}
                      download={sanitizeArabicFilenames(m.title)}
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
            {fetcher.data && fetcher.data.success === false && (
              <StatusBadge
                text="تأكد من حجم أو نوع الملف"
                status="خطأ"
                color="error"
              />
            )}
            {fetcher.data && fetcher.data.success === true && (
              <StatusBadge
                text="تم رفع الملفات بنجاح"
                status="نجاح"
                color="success"
              />
            )}

            {/* Example Content */}
            <div className="w-full mx-auto rounded-[11.78px] shadow-lg bg-white overflow-hidden p-2">
              <div
                className="w-full h-[184px] rounded-[5.89px]"
                style={{
                  backgroundImage: `url(${imageDashed})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              <div className="flex flex-col items-end p-4">
                <div className="text-right w-full">
                  <div className="font-bold text-[#1F2A37] mb-1"> نص جديد </div>
                  <div className="font-normal text-[#1F2A37] text-[17.67px]">
                    هنا نص بداية المقال وهو نص حسب المحتوى{" "}
                  </div>
                </div>
                <button className="flex items-center justify-center mt-4 px-6 py-1 bg-[#006173] text-white rounded-[5.89px] shadow hover:bg-teal-800 transition">
                  <img src={plusImg} alt="" />
                  <span className="ml-2">جديد</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
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
