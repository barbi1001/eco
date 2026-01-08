/**
 * Decodes HTML entities in a string (multiple passes to handle double-encoding)
 */
function decodeHtmlEntities(text: string): string {
  let decoded = text;
  let previousDecoded = '';
  
  // Keep decoding until no more changes occur (handles multiple levels of encoding)
  while (decoded !== previousDecoded) {
    previousDecoded = decoded;
    
    if (typeof document === 'undefined') {
      // Server-side: use basic replacements
      decoded = decoded
        .replace(/&quot;/g, '"')
        .replace(/&#34;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\\&quot;/g, '"')  // Handle escaped HTML entities
        .replace(/\\\"/g, '"');      // Handle escaped quotes
    } else {
      // Client-side: use DOM parser for accurate decoding
      const textarea = document.createElement('textarea');
      textarea.innerHTML = decoded;
      decoded = textarea.value;
    }
  }
  
  return decoded;
}

/**
 * Sanitizes SVG content for proper HTML rendering
 * Fixes self-closing tags, HTML entities, and ensures proper formatting
 */
export function sanitizeSvgContent(svgContent: string): string {
  if (!svgContent) return '';
  
  // Handle JSON-stringified content (if accidentally double-stringified)
  let sanitized = svgContent;
  
  // Check if the content looks like it's been JSON.stringify'd
  if (sanitized.includes('\\"') || sanitized.includes('\\&quot;')) {
    try {
      // Try to parse it as JSON to un-escape it
      sanitized = JSON.parse(`"${sanitized}"`);
    } catch (e) {
      // If parsing fails, manually replace escaped quotes
      sanitized = sanitized
        .replace(/\\"/g, '"')
        .replace(/\\&quot;/g, '"')
        .replace(/\\\\/g, '\\');
    }
  }
  
  // Decode any HTML entities (like &quot; to ")
  sanitized = decodeHtmlEntities(sanitized);
  
  // Remove self-closing slashes from SVG elements
  // This fixes issues where <defs/>, <linearGradient/>, etc. don't render properly
  sanitized = sanitized.replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');
  
  // Ensure proper closing tags for common SVG elements that might be self-closed
  const elementsToFix = ['defs', 'linearGradient', 'radialGradient', 'stop', 'g', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon'];
  
  elementsToFix.forEach(element => {
    // Match self-closing tags and convert them to proper open/close pairs
    const selfClosingRegex = new RegExp(`<${element}([^>]*?)\\s*/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, `<${element}$1></${element}>`);
  });
  
  return sanitized;
}

/**
 * Sanitizes SVG content from a component or template
 * Use this before rendering SVG with {@html}
 */
export function prepareSvgForRendering(svgElement: string | undefined): string {
  if (!svgElement) return '';
  return sanitizeSvgContent(svgElement);
}
