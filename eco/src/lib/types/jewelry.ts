// Core interfaces for the Custom Jewelry Designer system

export type JewelryCategory = 'necklace' | 'earrings' | 'bracelet' | 'ring';
export type ComponentType = 'bead' | 'charm' | 'pendant' | 'chain';
export type SizeCategory = 'small' | 'medium' | 'large';
export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'completed';

export interface TemplatePosition {
  id: string;
  x: number;
  y: number;
  type: ComponentType;
  size: SizeCategory;
  required: boolean;
}

export interface JewelryTemplate {
  id: string;
  name: string;
  category: JewelryCategory;
  description?: string;
  previewImage: string;
  svgTemplate: string;
  positions: TemplatePosition[];
  basePrice: number;
  isActive: boolean;
  isBracelet: boolean; // NEW: enables bracelet-specific functionality
}

export interface JewelryComponent {
  id: string;
  name: string;
  type: ComponentType;
  color: string;
  material: string;
  description?: string;
  image: string;
  svgElement: string;
  price: number;
  compatibleSizes: SizeCategory[];
  isActive: boolean;
  diameter?: number; // NEW: diameter in cm for bracelet calculations
  isLetterBead?: boolean; // NEW: identifies letter beads
  letterValue?: string; // NEW: the letter this bead represents
}

export interface ComponentPlacement {
  positionId: string;
  componentId: string;
  customizations?: Record<string, any>;
  isLetterBead?: boolean; // NEW: identifies letter bead placements
  letterValue?: string; // NEW: letter value for letter beads
}

export interface DesignConfiguration {
  templateId: string;
  components: ComponentPlacement[];
  timestamp: Date;
  braceletData?: BraceletConfiguration; // NEW: bracelet configuration
}

// NEW: Bracelet-specific interfaces
export interface BraceletConfiguration {
  wristCircumference: number; // in centimeters
  customText?: string; // user-entered text for letter beads
  calculatedBeadCount: number; // total beads that fit
  letterBeadPositions: LetterBeadPosition[]; // positions of letter beads
}

export interface LetterBeadPosition {
  letter: string;
  componentId: string;
  positionIndex: number; // position in the bracelet sequence
}

export interface BraceletCalculationResult {
  totalCircumference: number; // wrist + clasp space
  availableBeadSpace: number; // space available for beads
  maxBeadCount: number; // maximum beads that can fit
  recommendedBeadCount: number; // recommended for comfortable fit
  textFitsInSpace: boolean; // whether entered text fits
}

export interface BraceletValidationRules {
  minWristSize: number; // cm
  maxWristSize: number; // cm
  minBeadDiameter: number; // cm
  maxBeadDiameter: number; // cm
  maxTextLength: number; // characters
  supportedLanguages: string[]; // supported language codes
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DesignState {
  templateId: string;
  selectedComponents: Map<string, JewelryComponent>;
  totalPrice: number;
  previewImage?: string;
  designData: DesignConfiguration;
  braceletConfig?: BraceletConfiguration; // NEW: bracelet-specific data
}

export interface CustomJewelryOrder {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerMessage?: string;
  designPreview?: string;
  designConfiguration: DesignConfiguration;
  totalPrice: number;
  orderStatus: OrderStatus;
  orderDate: Date;
  wristCircumference?: number; // NEW: for bracelet orders
  customText?: string; // NEW: custom text for letter bead bracelets
}

// API Response interfaces for Strapi integration
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiTemplate {
  id: number;
  attributes: {
    name: string;
    category: JewelryCategory;
    description?: string;
    preview_image: {
      data: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    svg_template: string;
    base_price: number;
    positions: Array<{
      position_id: string;
      x_coordinate: number;
      y_coordinate: number;
      position_type: ComponentType;
      size_category: SizeCategory;
      is_required: boolean;
    }>;
    is_active: boolean;
    is_bracelet: boolean; // NEW: enables bracelet-specific features
    createdAt: string;
    updatedAt: string;
  };
}

export interface StrapiComponent {
  id: number;
  attributes: {
    name: string;
    component_type: ComponentType;
    color: string;
    material: string;
    description?: string;
    image: {
      data: {
        attributes: {
          url: string;
          alternativeText?: string;
        };
      };
    };
    svg_element: string;
    price: number;
    compatible_sizes: SizeCategory[];
    is_active: boolean;
    diameter?: number; // NEW: diameter in cm for bracelet calculations
    is_letter_bead?: boolean; // NEW: identifies letter beads
    letter_value?: string; // NEW: the letter this bead represents
    createdAt: string;
    updatedAt: string;
  };
}

// Design step enumeration for navigation
export enum DesignStep {
  WELCOME = 'welcome',
  TEMPLATE_SELECTION = 'template-selection',
  CUSTOMIZATION = 'customization',
  PREVIEW = 'preview',
  ORDER = 'order',
  SUCCESS = 'success'
}

// Error types for better error handling
export interface JewelryDesignerError {
  type: 'network' | 'validation' | 'state' | 'asset' | 'unknown';
  message: string;
  details?: any;
}