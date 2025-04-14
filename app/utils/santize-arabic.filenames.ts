export const sanitizeArabicFilenames = (name:string)=>{
  return name
    // Remove invalid characters
    .replace(/[/\\?%*:|"<>]/g, '')
    // Normalize Unicode (important for Arabic)
    .normalize('NFC')
    // Replace Arabic punctuation with equivalents
    .replace(/[،؛؟]/g, '_')
    // Trim whitespace
    .trim()
    // Limit length
    .substring(0, 100);
}