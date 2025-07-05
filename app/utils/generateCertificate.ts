import { jsPDF } from "jspdf";
import { AmiriFontBase64 } from "./amiriFont";

export interface CertificateData {
  id: string;
  fullName: string;
  administration: string;
  school: string;
  hours: string;
}

// Add Arabic font support
const addArabicFontToDoc = (doc: jsPDF) => {
  try {
    // Extract base64 font data (remove the data:font/truetype;base64, prefix)
    const fontData = AmiriFontBase64.split(",")[1];

    // Add the font file to jsPDF's virtual file system
    doc.addFileToVFS("Amiri-Regular.ttf", fontData);

    // Register the font with jsPDF
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

    console.log("Amiri Arabic font loaded successfully");
  } catch (error) {
    console.warn("Failed to load Arabic font:", error);
  }

  return doc;
};

// Function to process Arabic text for better display
const processArabicText = (text: string): string => {
  try {
    // Basic Arabic text processing
    // In a real implementation, you might want to use arabic-reshaper and bidi-js
    // For now, we'll return the text as-is since we're using bilingual approach
    return text;
  } catch (error) {
    console.warn("Arabic text processing failed:", error);
    return text;
  }
};

export const generateCertificatePDF = (data: CertificateData): string => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add Arabic font support
  addArabicFontToDoc(doc);

  // Set up colors - clean blue and yellow scheme like the reference
  const primaryBlue = [41, 128, 185]; // #2980B9 - Blue
  const darkBlue = [21, 67, 96]; // #154360 - Dark blue
  const yellowAccent = [241, 196, 15]; // #F1C40F - Yellow
  const lightGray = [245, 245, 245]; // #F5F5F5 - Light gray
  const textColor = [52, 73, 94]; // #34495E - Dark gray
  const whiteColor = [255, 255, 255]; // White

  // Clean white background
  doc.setFillColor(...whiteColor);
  doc.rect(0, 0, 297, 210, "F");

  // Top blue header section
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 297, 45, "F");

  // Yellow accent stripe
  doc.setFillColor(...yellowAccent);
  doc.rect(0, 45, 297, 8, "F");

  // School name in header
  doc.setTextColor(...whiteColor);
  doc.setFontSize(22);
  doc.setFont("Amiri", "normal");
  doc.text("مدرسة البنات النموذجية", 148.5, 25, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Model Girls School", 148.5, 38, { align: "center" });

  // Main title - Certificate of Achievement
  doc.setFontSize(36);
  doc.setTextColor(...darkBlue);
  doc.setFont("Amiri", "normal");
  doc.text("شهادة تخرج", 148.5, 75, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(...primaryBlue);
  doc.text("شهادة إتمام المرحلة الدراسية", 148.5, 88, { align: "center" });

  // Certification statement
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  doc.text("تشهد إدارة المدرسة بأن الطالبة المتفوقة", 148.5, 105, { align: "center" });

  // Student name with underline
  doc.setFontSize(28);
  doc.setTextColor(...darkBlue);
  doc.setFont("Amiri", "normal");
  doc.text(data.fullName, 148.5, 125, { align: "center" });
  
  // Underline for name
  doc.setLineWidth(1);
  doc.setDrawColor(...yellowAccent);
  doc.line(70, 130, 225, 130);

  // Achievement statement
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  doc.text("قد أنهت بتفوق ونجاح جميع متطلبات المرحلة الدراسية", 148.5, 145, { align: "center" });

  // Details section with clean design
  doc.setFillColor(...lightGray);
  doc.rect(40, 155, 217, 25, "F");
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(1);
  doc.rect(40, 155, 217, 25);

  // Details content - organized layout
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  
  // First row - Administration and School
  doc.text("الإدارة التعليمية:", 250, 165, { align: "right" });
  doc.text(data.administration, 180, 165, { align: "right" });
  
  doc.text("المدرسة:", 130, 165, { align: "right" });
  doc.text(data.school, 80, 165, { align: "right" });
  
  // Second row - Hours and Date
  doc.text("الساعات المعتمدة:", 250, 175, { align: "right" });
  doc.text(`${data.hours} ساعة`, 190, 175, { align: "right" });
  
  // Date with Arabic formatting
  const currentDate = new Date();
  const arabicDate = currentDate.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  doc.text("تاريخ التخرج:", 130, 175, { align: "right" });
  doc.text(arabicDate, 80, 175, { align: "right" });

  // Signature section - clean and minimal
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  
  // Principal signature
  doc.text("مديرة المدرسة", 80, 195, { align: "center" });
  doc.setLineWidth(0.5);
  doc.setDrawColor(...textColor);
  doc.line(45, 198, 115, 198);

  // School seal - simple circle design
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(2);
  doc.circle(200, 195, 10);
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.text("ختم", 200, 192, { align: "center" });
  doc.text("المدرسة", 200, 199, { align: "center" });

  // Certificate number
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text(`رقم الشهادة: ${data.id}`, 270, 205, { align: "right" });

  // Bottom border accent
  doc.setFillColor(...yellowAccent);
  doc.rect(0, 205, 297, 5, "F");

  return doc.output("datauristring");
};

export const downloadCertificate = (data: CertificateData): void => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add Arabic font support
  addArabicFontToDoc(doc);

  // Set up colors - clean blue and yellow scheme like the reference
  const primaryBlue = [41, 128, 185]; // #2980B9 - Blue
  const darkBlue = [21, 67, 96]; // #154360 - Dark blue
  const yellowAccent = [241, 196, 15]; // #F1C40F - Yellow
  const lightGray = [245, 245, 245]; // #F5F5F5 - Light gray
  const textColor = [52, 73, 94]; // #34495E - Dark gray
  const whiteColor = [255, 255, 255]; // White

  // Clean white background
  doc.setFillColor(...whiteColor);
  doc.rect(0, 0, 297, 210, "F");

  // Top blue header section
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, 297, 45, "F");

  // Yellow accent stripe
  doc.setFillColor(...yellowAccent);
  doc.rect(0, 45, 297, 8, "F");

  // School name in header
  doc.setTextColor(...whiteColor);
  doc.setFontSize(22);
  doc.setFont("Amiri", "normal");
  doc.text("مدرسة البنات النموذجية", 148.5, 25, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Model Girls School", 148.5, 38, { align: "center" });

  // Main title - Certificate of Achievement
  doc.setFontSize(36);
  doc.setTextColor(...darkBlue);
  doc.setFont("Amiri", "normal");
  doc.text("شهادة تخرج", 148.5, 75, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(...primaryBlue);
  doc.text("شهادة إتمام المرحلة الدراسية", 148.5, 88, { align: "center" });

  // Certification statement
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  doc.text("تشهد إدارة المدرسة بأن الطالبة المتفوقة", 148.5, 105, { align: "center" });

  // Student name with underline
  doc.setFontSize(28);
  doc.setTextColor(...darkBlue);
  doc.setFont("Amiri", "normal");
  doc.text(data.fullName, 148.5, 125, { align: "center" });
  
  // Underline for name
  doc.setLineWidth(1);
  doc.setDrawColor(...yellowAccent);
  doc.line(70, 130, 225, 130);

  // Achievement statement
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  doc.text("قد أنهت بتفوق ونجاح جميع متطلبات المرحلة الدراسية", 148.5, 145, { align: "center" });

  // Details section with clean design
  doc.setFillColor(...lightGray);
  doc.rect(40, 155, 217, 25, "F");
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(1);
  doc.rect(40, 155, 217, 25);

  // Details content - organized layout
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  
  // First row - Administration and School
  doc.text("الإدارة التعليمية:", 250, 165, { align: "right" });
  doc.text(data.administration, 180, 165, { align: "right" });
  
  doc.text("المدرسة:", 130, 165, { align: "right" });
  doc.text(data.school, 80, 165, { align: "right" });
  
  // Second row - Hours and Date
  doc.text("الساعات المعتمدة:", 250, 175, { align: "right" });
  doc.text(`${data.hours} ساعة`, 190, 175, { align: "right" });
  
  // Date with Arabic formatting
  const currentDate = new Date();
  const arabicDate = currentDate.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  doc.text("تاريخ التخرج:", 130, 175, { align: "right" });
  doc.text(arabicDate, 80, 175, { align: "right" });

  // Signature section - clean and minimal
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont("Amiri", "normal");
  
  // Principal signature
  doc.text("مديرة المدرسة", 80, 195, { align: "center" });
  doc.setLineWidth(0.5);
  doc.setDrawColor(...textColor);
  doc.line(45, 198, 115, 198);

  // School seal - simple circle design
  doc.setDrawColor(...primaryBlue);
  doc.setLineWidth(2);
  doc.circle(200, 195, 10);
  doc.setFontSize(9);
  doc.setTextColor(...primaryBlue);
  doc.text("ختم", 200, 192, { align: "center" });
  doc.text("المدرسة", 200, 199, { align: "center" });

  // Certificate number
  doc.setFontSize(8);
  doc.setTextColor(...primaryBlue);
  doc.text(`رقم الشهادة: ${data.id}`, 270, 205, { align: "right" });

  // Bottom border accent
  doc.setFillColor(...yellowAccent);
  doc.rect(0, 205, 297, 5, "F");

  // Download the PDF
  doc.save(`Certificate_${data.fullName.replace(/\s+/g, "_")}.pdf`);
};
