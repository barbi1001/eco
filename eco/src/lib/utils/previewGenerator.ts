/**
 * Preview Image Generator
 * Converts SVG designs to PNG/JPEG for order submission
 */

import type { JewelryTemplate, DesignState } from '$lib/types/jewelry';
import { prepareSvgForRendering } from './svgSanitizer';

export interface PreviewGenerationOptions {
  format?: 'png' | 'jpeg';
  quality?: number; // 0-1 for JPEG quality
  scale?: number; // Scale factor for higher resolution
  backgroundColor?: string;
}

export interface PreviewGenerationResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Generate a preview image from the current design
 */
export async function generatePreviewImage(
  svgElement: SVGSVGElement,
  options: PreviewGenerationOptions = {}
): Promise<PreviewGenerationResult> {
  const {
    format = 'png',
    quality = 0.95,
    scale = 2, // 2x for high quality
    backgroundColor = '#ffffff'
  } = options;

  // Get SVG dimensions
  const bbox = svgElement.getBBox();
  const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 800, 600];
  const width = viewBox[2];
  const height = viewBox[3];

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Scale context for higher resolution
  ctx.scale(scale, scale);

  // Serialize SVG to string
  const svgString = new XMLSerializer().serializeToString(svgElement);
  
  // Create a blob from SVG string
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Load SVG as image
  const img = new Image();
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to desired format
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }
            
            resolve({
              dataUrl,
              blob,
              width: canvas.width,
              height: canvas.height
            });
          },
          mimeType,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };
    
    img.src = url;
  });
}

/**
 * Generate preview image from template and design state
 * This creates an SVG element programmatically and generates the image
 */
export async function generatePreviewFromDesign(
  template: JewelryTemplate,
  designState: DesignState,
  options: PreviewGenerationOptions = {}
): Promise<PreviewGenerationResult> {
  // Create a temporary SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');

  // Add background
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', options.backgroundColor || '#ffffff');
  svg.appendChild(background);

  // Add template layer
  const templateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  templateGroup.setAttribute('class', 'template-layer');
  templateGroup.innerHTML = prepareSvgForRendering(template.svgTemplate);
  svg.appendChild(templateGroup);

  // Add components layer
  const componentsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  componentsGroup.setAttribute('class', 'components-layer');

  template.positions.forEach((position) => {
    const component = designState.selectedComponents.get(position.id);
    if (component && component.svgElement) {
      const componentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      componentGroup.setAttribute('transform', `translate(${position.x}, ${position.y})`);
      componentGroup.innerHTML = prepareSvgForRendering(component.svgElement);
      componentsGroup.appendChild(componentGroup);
    }
  });

  svg.appendChild(componentsGroup);

  // Append to document temporarily (required for some browsers)
  svg.style.position = 'absolute';
  svg.style.left = '-9999px';
  document.body.appendChild(svg);

  try {
    const result = await generatePreviewImage(svg, options);
    document.body.removeChild(svg);
    return result;
  } catch (error) {
    document.body.removeChild(svg);
    throw error;
  }
}

/**
 * Download preview image as a file
 */
export function downloadPreviewImage(
  dataUrl: string,
  filename: string = 'jewelry-design.png'
): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data URL to File object for upload
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Validate generated preview image
 */
export function validatePreviewImage(result: PreviewGenerationResult): boolean {
  // Check if data URL is valid
  if (!result.dataUrl || !result.dataUrl.startsWith('data:image/')) {
    return false;
  }
  
  // Check if blob exists and has size
  if (!result.blob || result.blob.size === 0) {
    return false;
  }
  
  // Check dimensions
  if (result.width <= 0 || result.height <= 0) {
    return false;
  }
  
  return true;
}

/**
 * Get preview image dimensions for different use cases
 */
export function getPreviewDimensions(useCase: 'thumbnail' | 'preview' | 'print'): { width: number; height: number; scale: number } {
  switch (useCase) {
    case 'thumbnail':
      return { width: 200, height: 150, scale: 0.5 };
    case 'preview':
      return { width: 800, height: 600, scale: 1 };
    case 'print':
      return { width: 1600, height: 1200, scale: 2 };
    default:
      return { width: 800, height: 600, scale: 1 };
  }
}
