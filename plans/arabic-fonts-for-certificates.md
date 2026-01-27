# Plan: Add 3 Alternative Arabic Fonts for Certificates

## Overview
Add 3 new Arabic fonts to the certificate generation system to give users more font choices.

## Current Setup
- Certificate generation: `app/utils/generateCertificate.ts`
- Fonts directory: `public/fonts/`
- UI selector: `app/components/CertificateRow.tsx`
- Current fonts: PingARLT (Regular/Bold), Amiri, Tajawal, Lateef, Almarai

## Recommended Fonts

### 1. Cairo
- **Style**: Modern geometric Arabic
- **Best for**: Headers, titles, institution names
- **Download**: https://fonts.google.com/specimen/Cairo
- **Files needed**: Cairo-Regular.ttf, Cairo-Bold.ttf

### 2. Noto Naskh Arabic
- **Style**: Traditional Naskh calligraphy
- **Best for**: Formal certificate text, names
- **Download**: https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic
- **Files needed**: NotoNaskhArabic-Regular.ttf, NotoNaskhArabic-Bold.ttf

### 3. Scheherazade New
- **Style**: Elegant display font
- **Best for**: Premium certificates, award text
- **Download**: https://fonts.google.com/specimen/Scheherazade+New
- **Files needed**: ScheherazadeNew-Regular.ttf, ScheherazadeNew-Bold.ttf

## Implementation Steps

### Step 1: Download Fonts
1. Go to each Google Fonts link
2. Download TTF files (Regular and Bold weights)
3. Place in `public/fonts/` directory

### Step 2: Update generateCertificate.ts
Add new fonts to the fontPaths arrays (around line 127-139):
```typescript
const fontPaths = {
  regular: [
    "/fonts/PingARLT-Regular.ttf",
    "/fonts/Cairo-Regular.ttf",
    "/fonts/NotoNaskhArabic-Regular.ttf",
    "/fonts/ScheherazadeNew-Regular.ttf",
    // ... existing fonts
  ],
  bold: [
    "/fonts/PingARLT-Bold.ttf",
    "/fonts/Cairo-Bold.ttf",
    "/fonts/NotoNaskhArabic-Bold.ttf",
    "/fonts/ScheherazadeNew-Bold.ttf",
    // ... existing fonts
  ]
};
```

### Step 3: Update CertificateRow.tsx
Add font options to the UI selector for users to choose between fonts.

## Files to Modify
- `public/fonts/` - Add 6 new font files
- `app/utils/generateCertificate.ts` - Add font paths
- `app/components/CertificateRow.tsx` - Add font selector options

## Verification
1. Generate a certificate with each new font
2. Verify Arabic text renders correctly
3. Test bold/regular toggle with each font
