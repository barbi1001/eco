# SVG Rendering Fix

## Problems Addressed

### 1. Self-Closing Tags
SVG elements with self-closing tags (e.g., `<defs/>`, `<linearGradient/>`, `<stop/>`) were not rendering properly in the jewelry designer. This is because HTML parsers don't handle self-closing tags the same way XML parsers do.

### 2. HTML Entity Encoding
SVG content was being double or triple HTML-encoded, resulting in attributes like `width="\&quot;400\&quot;"` instead of `width="400"`. This prevented the SVG from rendering correctly.

## Example of the Issues
```xml
<!-- Issue 1: Self-closing tags don't render properly in HTML -->
<path d="M0,-4 L1.2,-1.2" fill="url(#silverGradient)"/>
<defs/>
<linearGradient id="silverGradient"/>

<!-- Issue 2: Double-encoded HTML entities -->
<svg width="\&quot;400\&quot;" height="\&quot;300\&quot;">
```

## Solution
Created `svgSanitizer.ts` utility that:
1. Decodes HTML entities (handles multiple levels of encoding)
2. Converts self-closing SVG tags to proper open/close tag pairs

```xml
<!-- After sanitization, this renders correctly -->
<path d="M0,-4 L1.2,-1.2" fill="url(#silverGradient)"></path>
<defs></defs>
<linearGradient id="silverGradient"></linearGradient>

<!-- HTML entities are properly decoded -->
<svg width="400" height="300">
```

## Implementation
The `prepareSvgForRendering()` function is now used in:
- `DesignCanvas.svelte` - for rendering templates and components on the canvas
- `DesignPreview.svelte` - for rendering the final preview
- `previewGenerator.ts` - for generating preview images

## Usage
```typescript
import { prepareSvgForRendering } from '$lib/utils/svgSanitizer';

// Before rendering SVG content with {@html}
{@html prepareSvgForRendering(component.svgElement)}
```

## Files Modified
- ✅ `eco/src/lib/utils/svgSanitizer.ts` (new)
- ✅ `eco/src/lib/components/jewelry/DesignCanvas.svelte`
- ✅ `eco/src/lib/components/jewelry/DesignPreview.svelte`
- ✅ `eco/src/lib/utils/previewGenerator.ts`

## Testing
To verify the fix works:
1. Load the jewelry designer
2. Select a template
3. Add components with SVG elements containing gradients or other complex SVG features
4. Verify that all SVG elements render correctly in:
   - The design canvas
   - The preview screen
   - Downloaded preview images
