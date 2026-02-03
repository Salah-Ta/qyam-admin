import { useNavigate } from "@remix-run/react";
import { type ClassValue, clsx } from "clsx";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import CertificateRow from "~/components/CertificateRow";

import { CertificateData } from "~/utils/generateCertificate";

// Utils function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button Component
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center h-[48px] justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "default"
          ? "bg-[#1c81ac] text-white hover:bg-[#1c81ac]/90"
          : "",
        variant === "outline" ? "border border-[#d5d6d9] bg-white" : "",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Card Component
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Certificate row interface
interface CertificateRowData {
  id: string;
  data: Partial<CertificateData>;
}

// Main Component
const Certificates = () => {
  const [submitted, setSubmitted] = useState(false);
  const [certificates, setCertificates] = useState<CertificateRowData[]>([
    { id: "1", data: {} }
  ]);
  const navigate = useNavigate();

  const handleAddCertificate = () => {
    const newId = (certificates.length + 1).toString();
    setCertificates([...certificates, { id: newId, data: {} }]);
  };

  const handleDeleteCertificate = (id: string) => {
    if (certificates.length > 1) {
      setCertificates(certificates.filter(cert => cert.id !== id));
    }
  };

  const handleDataChange = (id: string, data: Partial<CertificateData>) => {
    setCertificates(certificates.map(cert =>
      cert.id === id ? { ...cert, data } : cert
    ));
  };

  const handleGenerateCertificates = () => {
    // Check if all certificates have complete data
    const allComplete = certificates.every(cert =>
      cert.data.fullName &&
      cert.data.administration &&
      cert.data.school &&
      cert.data.hours &&
      cert.data.coordinator
    );

    if (allComplete) {
      setSubmitted(true);
    } else {
      alert("يرجى إكمال جميع البيانات قبل تصدير الشهادات");
    }
  };

  const isAllDataComplete = certificates.every(cert =>
    cert.data.fullName &&
    cert.data.administration &&
    cert.data.school &&
    cert.data.hours &&
    cert.data.coordinator
  );

  return submitted ? (
    // Show certificates with PDF generation when submitted is true
    <Card className="flex flex-col w-full items-start gap-[46px] p-[18px] bg-white rounded-xl border border-solid border-[#d5d6d9] [direction:rtl]">
      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#414651]">الشهادات المولدة</h2>
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="text-sm"
          >
            العودة للتحرير
          </Button>
        </div>

        {/* Show Certificate Rows with PDF Generation */}
        {certificates.map((certificate) => (
          <CertificateRow
            key={certificate.id}
            id={certificate.id}
            onDelete={handleDeleteCertificate}
            onDataChange={handleDataChange}
            initialData={certificate.data}
            showPDF={true}
          />
        ))}
      </div>
    </Card>
  ) : (
    <Card className="flex flex-col w-full items-start gap-[46px] p-[18px] bg-white rounded-xl border border-solid border-[#d5d6d9] [direction:rtl]">
      <div className="flex flex-col gap-5 w-full">
        {/* New Certificate Button */}
        <Button
          variant="outline"
          className="flex items-center justify-center gap-1 px-3 py-2 w-[154px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
          onClick={handleAddCertificate}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-bold text-[#414651] text-sm tracking-[0] leading-5 whitespace-nowrap">
            شهادة جديدة
          </span>
        </Button>

        {/* Certificate Rows */}
        {certificates.map((certificate) => (
          <CertificateRow
            key={certificate.id}
            id={certificate.id}
            onDelete={handleDeleteCertificate}
            onDataChange={handleDataChange}
            initialData={certificate.data}
            showPDF={false}
          />
        ))}
      </div>

      {/* Generate Certificates Button */}
      <Button
        className={`w-full rounded-md ${
          isAllDataComplete
            ? "bg-[#006173] text-white hover:bg-[#1c81ac]/90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={handleGenerateCertificates}
        disabled={!isAllDataComplete}
      >
        <span className="flex items-center justify-center gap-2">
          تصدير الشهادات
          <span className="text-lg">📄</span>
        </span>
      </Button>
    </Card>
  );
};

export default Certificates;