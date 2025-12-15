# Font Loading Solutions for Production

## 🎯 Current Solution (Applied)
Move fonts to `public/fonts/` directory so they're accessible at `/fonts/` in both dev and production.

## 🔧 Alternative Solutions

### 1. Import Fonts as Modules (Vite/Remix way)
```typescript
// In generateCertificate.ts
import amiriRegularUrl from "~/assets/fonts/Amiri-Regular.ttf";
import pingMediumUrl from "~/assets/fonts/PingARLT-Medium.ttf";

const fontPaths = {
  regular: [amiriRegularUrl, "/fonts/arabic-font.ttf"],
  bold: [pingMediumUrl],
};
```

### 2. Base64 Embedded Fonts
```typescript
// Create a fonts utility file
export const embeddedFonts = {
  amiriRegular: "data:font/truetype;base64,YOUR_BASE64_STRING_HERE",
  pingMedium: "data:font/truetype;base64,YOUR_BASE64_STRING_HERE"
};

// Use in generateCertificate.ts
const amiriBuffer = Uint8Array.from(atob(embeddedFonts.amiriRegular), c => c.charCodeAt(0));
const font = await pdfDoc.embedFont(amiriBuffer);
```

### 3. Dynamic Font Loading with Error Handling
```typescript
async function loadFontWithFallbacks(pdfDoc: PDFDocument, fontPaths: string[]) {
  for (const path of fontPaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        return await pdfDoc.embedFont(new Uint8Array(buffer));
      }
    } catch (error) {
      console.warn(`Failed to load font: ${path}`, error);
    }
  }
  
  // Ultimate fallback
  return await pdfDoc.embedFont("Helvetica");
}
```

### 4. Vite Asset Bundling Configuration
```typescript
// In vite.config.ts
export default defineConfig({
  // ... other config
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2'],
  build: {
    assetsInlineLimit: 0, // Don't inline fonts
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.ttf')) {
            return 'fonts/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
});
```

## 📋 Recommended Development Workflow

1. **For new fonts**: Always add them to `public/fonts/` first
2. **Test locally**: Use `npm run preview` to test production build
3. **Verify deployment**: Check font loading in browser dev tools after deployment
4. **Fallback handling**: Always implement fallback fonts for better UX

## 🐛 Debugging Font Issues

### Check if fonts are accessible:
```bash
# In browser dev tools or curl
curl -I https://yourdomain.com/fonts/Amiri-Regular.ttf
```

### Console logging for font loading:
```typescript
console.log('Attempting to load font:', path);
const response = await fetch(path);
console.log('Font response:', response.status, response.headers.get('content-type'));
```

### Browser DevTools Network Tab:
- Check if font requests return 200 status
- Verify MIME type is `font/ttf` or `application/font-sfnt`
- Check for CORS issues if loading from different domain
