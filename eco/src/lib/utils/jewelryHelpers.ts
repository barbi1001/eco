import type {
  JewelryTemplate,
  JewelryComponent,
  StrapiTemplate,
  StrapiComponent,
  ComponentType,
  SizeCategory,
  TemplatePosition
} from '$lib/types/jewelry';

/**
 * Transform Strapi template data to internal template format
 */
export function transformStrapiTemplate(strapiTemplate: StrapiTemplate): JewelryTemplate {
  const { attributes } = strapiTemplate;
  
  return {
    id: strapiTemplate.id.toString(),
    name: attributes.name,
    category: attributes.category,
    description: attributes.description,
    previewImage: attributes.preview_image?.data?.attributes?.url || '',
    svgTemplate: attributes.svg_template,
    basePrice: attributes.base_price,
    isActive: attributes.is_active,
    isBracelet: attributes.is_bracelet || false, // NEW: bracelet-specific functionality
    positions: attributes.positions?.map(pos => ({
      id: pos.position_id,
      x: pos.x_coordinate,
      y: pos.y_coordinate,
      type: pos.position_type,
      size: pos.size_category,
      required: pos.is_required
    })) || []
  };
}

/**
 * Transform Strapi component data to internal component format
 */
export function transformStrapiComponent(strapiComponent: StrapiComponent): JewelryComponent {
  const { attributes } = strapiComponent;
  
  // Detect letter beads by name pattern (e.g., "a-letter", "א-letter")
  const isLetterBead = attributes.name?.endsWith('-letter') || attributes.name?.includes('-letter') || false;
  let letterValue: string | undefined;
  
  if (isLetterBead && attributes.name) {
    // Extract letter from name (e.g., "a-letter" -> "a", "א-letter" -> "א")
    const match = attributes.name.match(/^(.+?)-letter$/i);
    if (match && match[1]) {
      // For English letters, use lowercase. For Hebrew, keep original
      const extracted = match[1];
      letterValue = /[\u0590-\u05FF]/.test(extracted) ? extracted : extracted.toLowerCase();
    }
  }
  
  return {
    id: strapiComponent.id.toString(),
    name: attributes.name,
    type: attributes.component_type,
    color: attributes.color,
    material: attributes.material,
    description: attributes.description,
    image: attributes.image?.data?.attributes?.url || '',
    svgElement: attributes.svg_element,
    price: attributes.price,
    compatibleSizes: attributes.compatible_sizes || [],
    isActive: attributes.is_active,
    diameter: attributes.diameter, // NEW: diameter for bracelet calculations
    isLetterBead: attributes.is_letter_bead || isLetterBead, // Check both explicit flag and name pattern
    letterValue: attributes.letter_value || letterValue // NEW: the letter this bead represents
  };
}

/**
 * Filter components by type and size compatibility
 */
export function filterCompatibleComponents(
  components: JewelryComponent[],
  positionType: ComponentType,
  positionSize: SizeCategory
): JewelryComponent[] {
  return components.filter(component => 
    component.type === positionType && 
    component.compatibleSizes.includes(positionSize) &&
    component.isActive
  );
}

/**
 * Calculate total price for a design
 */
export function calculateTotalPrice(
  template: JewelryTemplate,
  selectedComponents: Map<string, JewelryComponent>
): number {
  let total = template.basePrice;
  
  selectedComponents.forEach(component => {
    total += component.price;
  });
  
  return total;
}

/**
 * Validate if all required positions are filled
 */
export function validateDesignComplete(
  template: JewelryTemplate,
  selectedComponents: Map<string, JewelryComponent>
): boolean {
  const requiredPositions = template.positions.filter(pos => pos.required);
  
  return requiredPositions.every(position => 
    selectedComponents.has(position.id)
  );
}

/**
 * Generate SVG preview of the design
 */
export function generateDesignPreview(
  template: JewelryTemplate,
  selectedComponents: Map<string, JewelryComponent>
): string {
  // Start with the base template SVG
  let svgContent = template.svgTemplate;
  
  // Replace position placeholders with selected components
  template.positions.forEach(position => {
    const component = selectedComponents.get(position.id);
    if (component) {
      // Create a positioned component element
      const componentElement = `
        <g transform="translate(${position.x}, ${position.y})">
          ${component.svgElement}
        </g>
      `;
      
      // Replace placeholder or append to SVG
      const placeholder = `<!--POSITION_${position.id}-->`;
      if (svgContent.includes(placeholder)) {
        svgContent = svgContent.replace(placeholder, componentElement);
      } else {
        // If no placeholder, insert before closing svg tag
        svgContent = svgContent.replace('</svg>', `${componentElement}</svg>`);
      }
    }
  });
  
  return svgContent;
}

/**
 * Convert SVG to data URL for preview images
 */
export function svgToDataUrl(svgString: string): string {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Generate a canvas element from SVG for image export
 */
export async function svgToCanvas(svgString: string, width: number = 400, height: number = 400): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = svgToDataUrl(svgString);
  });
}

/**
 * Convert canvas to blob for file upload
 */
export async function canvasToBlob(canvas: HTMLCanvasElement, type: string = 'image/png', quality: number = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, type, quality);
  });
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '₪'): string {
  return `${price.toFixed(2)} ${currency}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate unique ID for components
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Israeli format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^0[2-9]\d{7,8}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Parse Strapi rich text format to plain text
 * Handles the structured format: [{"type": "paragraph", "children": [{"type": "text", "text": "..."}]}]
 */
export function parseRichText(richText: any): string {
  if (!richText) return '';
  
  // If it's already a string, return it
  if (typeof richText === 'string') return richText;
  
  // If it's an array of rich text blocks
  if (Array.isArray(richText)) {
    return richText
      .map(block => {
        if (block.children && Array.isArray(block.children)) {
          return block.children
            .map((child: any) => child.text || '')
            .join('');
        }
        return '';
      })
      .join(' ');
  }
  
  return '';
}

/**
 * Create error object with consistent format
 */
export function createError(
  type: 'network' | 'validation' | 'state' | 'asset' | 'unknown',
  message: string,
  details?: any
) {
  return {
    type,
    message,
    details,
    timestamp: new Date()
  };
}