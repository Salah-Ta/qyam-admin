import { PDFDocument, rgb, PageSizes, PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export interface CertificateData {
  fullName: string;
  administration: string;
  school: string;
  hours: string;
  programTrainer: string;
}

async function loadCertificateTemplate(): Promise<Uint8Array> {
  try {
    const templatePath = "/templates/second_certif.pdf";
    console.log(`Loading template from: ${templatePath}`);

    const response = await fetch(templatePath);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    if (
      bytes.length < 4 ||
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== "%PDF"
    ) {
      throw new Error("File is not a valid PDF");
    }

    console.log("Template loaded successfully, size:", bytes.length);
    return bytes;
  } catch (error) {
    console.error("Error loading template:", error);
    return await createFallbackTemplate();
  }
}

async function createFallbackTemplate(): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
    });

    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.2, 0.4, 0.6),
      borderWidth: 3,
    });

    page.drawRectangle({
      x: 20,
      y: height - 120,
      width: width - 40,
      height: 100,
      color: rgb(0.2, 0.4, 0.6),
    });

    page.drawText("شهادة تخرج", {
      x: width / 2 - 50,
      y: height - 60,
      size: 28,
      color: rgb(1, 1, 1),
      font: await pdfDoc.embedFont("Helvetica-Bold"),
    });

    page.drawText("Certificate of Graduation", {
      x: width / 2 - 70,
      y: height - 90,
      size: 16,
      color: rgb(0.9, 0.9, 0.9),
      font: await pdfDoc.embedFont("Helvetica"),
    });

    page.drawText("اسم الطالب", {
      x: width / 2 - 40,
      y: height / 2 + 40,
      size: 18,
      color: rgb(0.7, 0.7, 0.7),
      font: await pdfDoc.embedFont("Helvetica"),
    });

    page.drawText("اسم المدرسة", {
      x: width / 2 - 40,
      y: height / 2 - 30,
      size: 14,
      color: rgb(0.7, 0.7, 0.7),
      font: await pdfDoc.embedFont("Helvetica"),
    });
    page.drawText("مدربة البرنامج  ", {
      x: width / 2 - 40,
      y: height / 2 - 30,
      size: 14,
      color: rgb(0.7, 0.7, 0.7),
      font: await pdfDoc.embedFont("Helvetica"),
    });
    const pdfBytes = await pdfDoc.save();
    return new Uint8Array(pdfBytes);
  } catch (error) {
    console.error("Error creating fallback template:", error);
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage(PageSizes.A4);
    const pdfBytes = await pdfDoc.save();
    return new Uint8Array(pdfBytes);
  }
}

async function loadArabicFont(
  pdfDoc: PDFDocument
): Promise<{ regular: any; bold: any }> {
  const fontPaths = {
    regular: [
      "/fonts/Lateef-Regular.ttf",
      "/fonts/Almarai-Regular.ttf",
      "/fonts/Amiri-Regular.ttf",
      "/fonts/NotoNaskhArabic-Regular.ttf",
    ],
    bold: [
      // "/fonts/Lateef-Regular.ttf",
      // "/fonts/Mothanna.ttf",
      "/fonts/Tajawal-Regular.ttf",
      "/fonts/Almarai-Regular.ttf",
    ],
  };

  async function loadFont(paths: string[]) {
    for (const path of paths) {
      try {
        console.log(`Trying to load font from: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Successfully loaded font from: ${path}`);
          return await pdfDoc.embedFont(new Uint8Array(arrayBuffer));
        } else {
          console.warn(
            `Failed to load font from ${path} - status ${response.status}`
          );
        }
      } catch (error) {
        console.warn(`Error loading font from ${path}:`, error);
        continue;
      }
    }
    return null;
  }

  const regularFont = await loadFont(fontPaths.regular);
  const boldFont = await loadFont(fontPaths.bold);

  if (!regularFont || !boldFont) {
    console.warn(
      "Could not load one or both Arabic fonts, falling back to Helvetica/Helvetica-Bold"
    );
    return {
      regular: await pdfDoc.embedFont("Helvetica"),
      bold: await pdfDoc.embedFont("Helvetica-Bold"),
    };
  }

  return { regular: regularFont, bold: boldFont };
}

function drawArabicText(
  page: PDFPage,
  font: any,
  text: string,
  x: number,
  y: number,
  size: number = 12,
  color: [number, number, number] = [0, 0, 0],
  align: "right" | "center" | "left" = "right"
) {
  let drawX = x;
  if (align === "center") {
    drawX = x - font.widthOfTextAtSize(text, size) / 2;
  } else if (align === "right") {
    drawX = x - font.widthOfTextAtSize(text, size);
  }
  page.drawText(text, {
    x: drawX,
    y,
    size,
    font,
    color: rgb(color[0], color[1], color[2]),
  });
}

export async function generateCertificatePDF(
  certificateData: CertificateData
): Promise<Blob> {
  try {
    console.log("Starting certificate generation with data:", certificateData);

    const templateBytes = await loadCertificateTemplate();

    const pdfDoc = await PDFDocument.load(templateBytes);

    pdfDoc.registerFontkit(fontkit);

    const { regular: arabicFontRegular, bold: arabicFontBold } =
      await loadArabicFont(pdfDoc);

    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    const fullNameX = 390;
    const administrationX = 420;

    const administrationY = height / 2 + 8;
    const fullNameY = height / 2 - 27;

    // Draw fullName with conditional alignment
    if (certificateData.fullName) {
      const fullNameAlign =
        certificateData.fullName.length < 15 ? "center" : "right";
      drawArabicText(
        page,
        arabicFontBold,
        certificateData.fullName,
        fullNameAlign === "center" ? width / 2 : fullNameX,
        fullNameY,
        16,
        [0.3, 0.3, 0.3],
        fullNameAlign
      );
    }

    // Draw administration with conditional alignment
    if (certificateData.administration) {
      const administrationAlign =
        certificateData.administration.length < 15 ? "center" : "right";
      drawArabicText(
        page,
        arabicFontBold,
        certificateData.administration,
        administrationAlign === "center" ? width / 2 : administrationX,
        administrationY,
        16,
        [0.3, 0.3, 0.3],
        administrationAlign
      );
    }

    // Draw programTrainer (المدربة) - positioned at bottom right

    if (certificateData.programTrainer) {
      // Dynamic margin based on character count
      const marginRight =
        certificateData.programTrainer.length <= 15 ? 100 : 50;
      const bottomMargin = 81;

      // Calculate the width of the text to right-align from the right margin
      const textWidth = arabicFontBold.widthOfTextAtSize(
        certificateData.programTrainer,
        14
      );
      const drawX = width - marginRight; // Start near right edge

      const drawY = bottomMargin; // Near bottom, adjust visually as needed

      console.log(
        "Drawing programTrainer at x=",
        drawX,
        "y=",
        drawY,
        "text:",
        certificateData.programTrainer
      );

      drawArabicText(
        page,
        arabicFontBold,
        certificateData.programTrainer,
        drawX,
        drawY,
        14,
        [0.3, 0.3, 0.3],
        "right" // Right aligned for Arabic text
      );
    }

    const pdfBytes = await pdfDoc.save();

    return new Blob([pdfBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);

    page.drawText("خطأ في توليد الشهادة", {
      x: 300,
      y: 400,
      size: 18,
      color: rgb(1, 0, 0),
    });

    page.drawText("Error generating certificate", {
      x: 300,
      y: 370,
      size: 12,
      color: rgb(0.5, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
