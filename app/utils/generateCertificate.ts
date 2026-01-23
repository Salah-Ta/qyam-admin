import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export interface CertificateData {
  id: string;
  fullName: string;
  administration: string;
  school: string;
  hours: string;
}

// Function to load the PDF template
const loadPDFTemplate = async (): Promise<ArrayBuffer> => {
  const response = await fetch("/assets/certificate-template.pdf");
  if (!response.ok) {
    throw new Error("Failed to load certificate template");
  }
  return await response.arrayBuffer();
};

// Function to load Arabic font
const loadArabicFont = async (): Promise<ArrayBuffer> => {
  const response = await fetch("/assets/fonts/Amiri-Regular.ttf");
  if (!response.ok) {
    throw new Error("Failed to load Arabic font");
  }
  return await response.arrayBuffer();
};

export const generateCertificatePDF = async (data: CertificateData): Promise<string> => {
  // Load the existing PDF template
  const templateBytes = await loadPDFTemplate();
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);

  // Load and embed Arabic font
  const arabicFontBytes = await loadArabicFont();
  const arabicFont = await pdfDoc.embedFont(arabicFontBytes);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Define text color (dark teal/green to match the certificate design)
  const textColor = rgb(0.0, 0.4, 0.4);

  // Add the recipient's name - centered horizontally
  // Position it in the middle section where the name should appear
  const nameText = data.fullName;
  const nameFontSize = 32;
  const nameWidth = arabicFont.widthOfTextAtSize(nameText, nameFontSize);

  // Center the name horizontally and position it vertically (adjust Y based on template)
  // The name appears after "بخالص الشكر والتقدير للطالبة:"
  firstPage.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height * 0.42, // Adjust this value to position the name correctly
    size: nameFontSize,
    font: arabicFont,
    color: textColor,
  });

  // Save the PDF and return as data URI
  const pdfBytes = await pdfDoc.save();
  const base64 = btoa(
    pdfBytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  return `data:application/pdf;base64,${base64}`;
};

export const downloadCertificate = async (data: CertificateData): Promise<void> => {
  // Load the existing PDF template
  const templateBytes = await loadPDFTemplate();
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);

  // Load and embed Arabic font
  const arabicFontBytes = await loadArabicFont();
  const arabicFont = await pdfDoc.embedFont(arabicFontBytes);

  // Get the first page
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Define text color (dark teal/green to match the certificate design)
  const textColor = rgb(0.0, 0.4, 0.4);

  // Add the recipient's name - centered horizontally
  const nameText = data.fullName;
  const nameFontSize = 32;
  const nameWidth = arabicFont.widthOfTextAtSize(nameText, nameFontSize);

  firstPage.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: height * 0.42,
    size: nameFontSize,
    font: arabicFont,
    color: textColor,
  });

  // Save and download the PDF
  const pdfBytes = await pdfDoc.save();

  // Create download link
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `شهادة_${data.fullName.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
