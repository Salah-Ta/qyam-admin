import React, { useState } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TrashIcon, DownloadIcon } from "lucide-react";
import { generateCertificatePDF, downloadCertificate, CertificateData } from "~/utils/generateCertificate";

// Utils function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default" | "destructive";
    size?: "sm" | "default";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default" ? "bg-[#1c81ac] text-white hover:bg-[#1c81ac]/90" : "",
        variant === "outline" ? "border border-[#d5d6d9] bg-white hover:bg-gray-50" : "",
        variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" : "",
        size === "default" ? "h-[48px] px-4 py-2" : "",
        size === "sm" ? "h-8 px-3 py-1" : "",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Input Component
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

// Label Component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

interface CertificateRowProps {
  id: string;
  onDelete: (id: string) => void;
  onDataChange: (id: string, data: Partial<CertificateData>) => void;
  initialData?: Partial<CertificateData>;
  showPDF?: boolean;
}

export const CertificateRow: React.FC<CertificateRowProps> = ({
  id,
  onDelete,
  onDataChange,
  initialData = {},
  showPDF = false,
}) => {
  const [formData, setFormData] = useState<Partial<CertificateData>>({
    fullName: initialData.fullName || "",
    administration: initialData.administration || "",
    school: initialData.school || "",
    hours: initialData.hours || "",
  });

  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const formFields = [
    {
      id: "fullName",
      label: "الاسم الرباعي",
      required: true,
    },
    {
      id: "administration",
      label: "الإدارة",
      required: true,
    },
    {
      id: "school",
      label: "المدرسة",
      required: true,
    },
    {
      id: "hours",
      label: "الساعات",
      required: true,
      width: "w-[106px]",
    },
  ];

  const handleInputChange = (fieldId: string, value: string) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);
    onDataChange(id, newData);
  };

  const isFormValid = () => {
    return formData.fullName && 
           formData.administration && 
           formData.school && 
           formData.hours;
  };

  const handleGeneratePDF = () => {
    if (!isFormValid()) return;
    
    const certificateData: CertificateData = {
      id,
      fullName: formData.fullName!,
      administration: formData.administration!,
      school: formData.school!,
      hours: formData.hours!,
    };
    
    const pdfDataUri = generateCertificatePDF(certificateData);
    setPdfPreview(pdfDataUri);
  };

  const handleDownload = () => {
    if (!isFormValid()) return;
    
    const certificateData: CertificateData = {
      id,
      fullName: formData.fullName!,
      administration: formData.administration!,
      school: formData.school!,
      hours: formData.hours!,
    };
    
    downloadCertificate(certificateData);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-[#d5d6d9] rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#414651]">شهادة #{id}</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(id)}
          className="h-8 w-8 p-0"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-start justify-start gap-[18px] w-full flex-col md:flex-row">
        {formFields.map((field) => (
          <div
            key={field.id}
            className={`flex flex-col items-right gap-1.5 self-stretch ${
              field.width || "flex-1"
            }`}
          >
            <div className="flex flex-col gap-1.5 self-stretch w-full">
              <div className="inline-flex items-start gap-0.5">
                {field.required && (
                  <span className="text-[#1C81AC]">*</span>
                )}
                <Label
                  htmlFor={`${field.id}-${id}`}
                  className="font-medium text-[#414651] text-sm"
                >
                  {field.label}
                </Label>
              </div>
              <div className="flex items-center justify-end gap-2 px-3.5 py-2.5 w-full bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                <div className="flex items-center justify-end gap-2 flex-1">
                  <Input
                    id={`${field.id}-${id}`}
                    value={formData[field.id as keyof CertificateData] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="border-none shadow-none p-0 font-normal text-[#717680] text-base text-right"
                    placeholder={field.label}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showPDF && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePDF}
              disabled={!isFormValid()}
              className="flex items-center gap-2"
            >
              توليد الشهادة
            </Button>
            {pdfPreview && (
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" />
                تحميل الشهادة
              </Button>
            )}
          </div>
          
          {pdfPreview && (
            <div className="border border-[#d5d6d9] rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">معاينة الشهادة:</h4>
              <iframe
                src={pdfPreview}
                width="100%"
                height="400px"
                className="border rounded"
                title={`Certificate preview for ${formData.fullName}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateRow;
