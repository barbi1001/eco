# Custom Jewelry Designer - Design Document

## Overview

The Custom Jewelry Designer is a multi-step interactive web application built with SvelteKit that enables users to create personalized jewelry designs. The system follows a progressive disclosure pattern: Welcome → Template Selection → Customization → Preview → Order. The design emphasizes visual appeal, intuitive interaction, and seamless integration with existing brand aesthetics.

## Architecture

### Frontend Architecture
- **SvelteKit Application**: Main framework providing SSR and client-side interactivity
- **Component-Based Design**: Modular Svelte components for reusability and maintainability
- **State Management**: Svelte stores for managing design state across components
- **SVG-Based Rendering**: Scalable vector graphics for jewelry templates and components
- **Responsive Design**: Mobile-first approach with desktop enhancements

### Backend Integration
- **Strapi CMS**: Headless CMS for content management
- **REST API**: Communication between frontend and Strapi
- **File Storage**: Image assets stored in Strapi media library
- **Telegram Integration**: Order notifications via existing Telegram bot

### Data Flow
```
User Interaction → Svelte Store → Component Update → SVG Rendering → Preview Generation → Order Submission → Strapi Storage
```

## Components and Interfaces

### Core Components

#### 1. JewelryDesignerPage
- **Purpose**: Main page component orchestrating the entire design flow
- **State Management**: Controls current step, selected template, and design data
- **Routing**: Manages navigation between design steps
- **Props**: None (root component)
- **Exports**: Design state for order processing

#### 2. WelcomeScreen
- **Purpose**: Initial landing screen with call-to-action
- **Features**: Animated background, centered messaging, prominent CTA button
- **Styling**: Inherits sparkle effects and color scheme from sadnaot page
- **Interactions**: Single "התחילי עכשיו" button to proceed

#### 3. TemplateGallery
- **Purpose**: Display and selection of jewelry templates
- **Data Source**: Strapi CMS via API calls
- **Layout**: Grid layout with template previews
- **Interactions**: Click to select template, hover effects for engagement
- **Loading States**: Skeleton loaders while fetching templates

#### 4. DesignCanvas
- **Purpose**: Interactive design workspace
- **Core Technology**: SVG manipulation and rendering
- **Features**: 
  - Clickable position markers on templates
  - Real-time component placement
  - Zoom and pan capabilities for detailed work
  - Undo/redo functionality
- **State**: Maintains current design configuration

#### 5. ComponentSelector
- **Purpose**: Modal/drawer for selecting beads, charms, and pendants
- **Data Filtering**: Shows relevant components based on selected position type
- **Layout**: Grid with search and category filtering
- **Preview**: Hover effects showing component placement
- **Accessibility**: Keyboard navigation and screen reader support

#### 6. DesignPreview
- **Purpose**: Final preview generation and display
- **Rendering**: High-quality SVG composition
- **Export**: Generates PNG/JPEG for order submission
- **Features**: Multiple view angles, zoom functionality
- **Sharing**: Social media sharing capabilities

#### 7. OrderForm
- **Purpose**: Customer information collection and order submission
- **Fields**: Name, phone, optional message (matching sadnaot page)
- **Validation**: Client-side validation with error messaging
- **Integration**: Telegram notification system
- **Success States**: Confirmation messaging and navigation options

### Bracelet-Specific Components

#### 8. WristSizeSelector
- **Purpose**: Bracelet wrist circumference input interface
- **Features**: 
  - Popular size buttons (16cm, 17cm, 18cm, 19cm, 20cm)
  - Custom size input with validation (12-25cm range)
  - Visual size guide with measurement tips
- **Integration**: Updates bracelet calculation engine
- **Validation**: Real-time validation with error messaging

#### 9. BraceletCalculator
- **Purpose**: Core calculation engine for bracelet bead fitting
- **Algorithms**:
  - Circumference calculation: `wristSize + 1.5cm (clasp space)`
  - Bead count: `Math.floor(totalCircumference / beadDiameter)`
  - Space validation: Ensures selected beads fit within available space
- **Features**: Real-time recalculation on bead selection changes
- **Error Handling**: Prevents over-selection with clear user feedback

#### 10. TextInputInterface
- **Purpose**: Custom text input for letter bead arrangement
- **Features**:
  - Multi-language support (Hebrew and English)
  - Character validation and filtering
  - Real-time preview of letter bead arrangement
  - Center positioning algorithm for text placement
- **Integration**: Automatically selects corresponding letter beads
- **Validation**: Text length validation based on available bracelet space

#### 11. LetterBeadManager
- **Purpose**: Manages letter bead selection and positioning
- **Features**:
  - Automatic letter-to-bead mapping (a→a-letter, א→א-letter)
  - Center positioning algorithm for text arrangement
  - Mixed language support within single text
- **Algorithms**: 
  - Text centering: Calculate center positions based on total bead count
  - Letter spacing: Ensure proper spacing between letter beads
- **Error Handling**: Handle missing letter beads gracefully

### Data Interfaces

#### Template Interface
```typescript
interface JewelryTemplate {
  id: string;
  name: string;
  category: 'necklace' | 'earrings' | 'bracelet' | 'ring';
  previewImage: string;
  svgTemplate: string;
  positions: TemplatePosition[];
  basePrice: number;
  isBracelet: boolean; // New: enables bracelet-specific functionality
}

interface TemplatePosition {
  id: string;
  x: number;
  y: number;
  type: 'bead' | 'charm' | 'pendant' | 'chain';
  size: 'small' | 'medium' | 'large';
  required: boolean;
}
```

#### Component Interface
```typescript
interface JewelryComponent {
  id: string;
  name: string;
  type: 'bead' | 'charm' | 'pendant' | 'chain';
  color: string;
  material: string;
  image: string;
  svgElement: string;
  price: number;
  compatibleSizes: string[];
  diameter?: number; // New: diameter in cm for bracelet calculations
  isLetterBead?: boolean; // New: identifies letter beads
  letterValue?: string; // New: the letter this bead represents
}
```

#### Bracelet-Specific Interfaces
```typescript
interface BraceletConfiguration {
  wristCircumference: number; // in centimeters
  customText?: string; // user-entered text for letter beads
  calculatedBeadCount: number; // total beads that fit
  letterBeadPositions: LetterBeadPosition[]; // positions of letter beads
}

interface LetterBeadPosition {
  letter: string;
  componentId: string;
  positionIndex: number; // position in the bracelet sequence
}

interface BraceletCalculationResult {
  totalCircumference: number; // wrist + clasp space
  availableBeadSpace: number; // space available for beads
  maxBeadCount: number; // maximum beads that can fit
  recommendedBeadCount: number; // recommended for comfortable fit
  textFitsInSpace: boolean; // whether entered text fits
}
```

#### Enhanced Design State Interface
```typescript
interface DesignState {
  templateId: string;
  selectedComponents: Map<string, JewelryComponent>;
  totalPrice: number;
  previewImage?: string;
  designData: DesignConfiguration;
  braceletConfig?: BraceletConfiguration; // New: bracelet-specific data
}

interface DesignConfiguration {
  templateId: string;
  components: ComponentPlacement[];
  timestamp: Date;
  braceletData?: BraceletConfiguration; // New: bracelet configuration
}

interface ComponentPlacement {
  positionId: string;
  componentId: string;
  customizations?: Record<string, any>;
  isLetterBead?: boolean; // New: identifies letter bead placements
  letterValue?: string; // New: letter value for letter beads
}
```

## Bracelet-Specific Algorithms

### Bead Calculation Algorithm
```typescript
function calculateBraceletBeads(wristCircumference: number, beadDiameter: number): BraceletCalculationResult {
  const claspSpace = 1.5; // cm
  const totalCircumference = wristCircumference + claspSpace;
  const availableBeadSpace = totalCircumference;
  const maxBeadCount = Math.floor(availableBeadSpace / beadDiameter);
  const recommendedBeadCount = Math.floor(maxBeadCount * 0.9); // 90% for comfort
  
  return {
    totalCircumference,
    availableBeadSpace,
    maxBeadCount,
    recommendedBeadCount,
    textFitsInSpace: true // calculated based on text length
  };
}
```

### Text Positioning Algorithm
```typescript
function calculateLetterBeadPositions(
  text: string, 
  totalBeadCount: number, 
  letterBeadComponents: Map<string, JewelryComponent>
): LetterBeadPosition[] {
  const textLength = text.length;
  const startPosition = Math.floor((totalBeadCount - textLength) / 2);
  
  return text.split('').map((letter, index) => ({
    letter,
    componentId: getLetterBeadId(letter, letterBeadComponents),
    positionIndex: startPosition + index
  }));
}

function getLetterBeadId(letter: string, components: Map<string, JewelryComponent>): string {
  const letterBeadName = `${letter.toLowerCase()}-letter`;
  const component = Array.from(components.values())
    .find(c => c.name === letterBeadName);
  return component?.id || '';
}
```

### Bracelet Validation Rules
```typescript
interface BraceletValidationRules {
  minWristSize: 12; // cm
  maxWristSize: 25; // cm
  minBeadDiameter: 0.3; // cm
  maxBeadDiameter: 2.0; // cm
  maxTextLength: 20; // characters
  supportedLanguages: ['en', 'he']; // English and Hebrew
}

function validateBraceletConfiguration(config: BraceletConfiguration): ValidationResult {
  const errors: string[] = [];
  
  if (config.wristCircumference < 12 || config.wristCircumference > 25) {
    errors.push('Wrist circumference must be between 12-25cm');
  }
  
  if (config.customText && config.customText.length > 20) {
    errors.push('Custom text cannot exceed 20 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

## Data Models

### Strapi Content Types

#### Jewelry Templates
- **Collection Name**: `jewelry-templates`
- **Fields**:
  - `name` (Text, required)
  - `category` (Enumeration: necklace, earrings, bracelet, ring)
  - `description` (Rich Text)
  - `preview_image` (Media, single)
  - `svg_template` (Long Text, for SVG markup)
  - `base_price` (Number, decimal)
  - `positions` (Component, repeatable)
  - `is_active` (Boolean, default true)
  - `is_bracelet` (Boolean, default false) **NEW**: Enables bracelet-specific features

#### Template Positions (Component)
- **Component Name**: `template-position`
- **Fields**:
  - `position_id` (Text, required, unique within template)
  - `x_coordinate` (Number, decimal)
  - `y_coordinate` (Number, decimal)
  - `position_type` (Enumeration: bead, charm, pendant, chain)
  - `size_category` (Enumeration: small, medium, large)
  - `is_required` (Boolean, default false)

#### Jewelry Components
- **Collection Name**: `jewelry-components`
- **Fields**:
  - `name` (Text, required)
  - `component_type` (Enumeration: bead, charm, pendant, chain)
  - `color` (Text)
  - `material` (Text)
  - `description` (Rich Text)
  - `image` (Media, single)
  - `svg_element` (Long Text, for SVG markup)
  - `price` (Number, decimal)
  - `compatible_sizes` (JSON, array of size categories)
  - `diameter` (Number, decimal, default 0.5) **NEW**: Diameter in cm for bracelet calculations
  - `is_active` (Boolean, default true)

#### Custom Orders
- **Collection Name**: `custom-jewelry-orders`
- **Fields**:
  - `customer_name` (Text, required)
  - `customer_phone` (Text, required)
  - `customer_message` (Long Text)
  - `design_preview` (Media, single)
  - `design_configuration` (JSON, complete design data)
  - `total_price` (Number, decimal)
  - `order_status` (Enumeration: pending, confirmed, in_production, completed)
  - `order_date` (DateTime, auto-populated)
  - `wrist_circumference` (Number, decimal) **NEW**: For bracelet orders
  - `custom_text` (Text) **NEW**: Custom text for letter bead bracelets

## Error Handling

### Client-Side Error Handling
- **Network Errors**: Retry mechanisms with exponential backoff
- **Validation Errors**: Real-time field validation with clear error messages
- **State Errors**: Graceful degradation when design state becomes invalid
- **Asset Loading**: Fallback images and loading states for missing assets

### Server-Side Error Handling
- **API Failures**: Proper HTTP status codes and error responses
- **Data Validation**: Server-side validation matching client-side rules
- **File Upload Errors**: Clear messaging for file size/type restrictions
- **Database Errors**: Logging and user-friendly error messages

### Error Recovery Strategies
- **Auto-save**: Periodic saving of design progress to localStorage
- **Session Recovery**: Restore design state on page reload
- **Offline Support**: Basic functionality when network is unavailable
- **Error Boundaries**: Svelte error boundaries to prevent complete app crashes

### Bracelet-Specific Error Handling
- **Size Validation Errors**: Clear messaging for invalid wrist circumference inputs
- **Bead Overflow Errors**: Warning when selected beads exceed bracelet capacity
- **Text Length Errors**: Real-time validation of custom text length
- **Missing Letter Beads**: Graceful handling when letter beads are unavailable
- **Calculation Errors**: Fallback to default sizing when calculation fails

## Testing Strategy

### Unit Testing
- **Component Testing**: Individual Svelte component functionality
- **Store Testing**: State management logic and mutations
- **Utility Functions**: SVG manipulation and calculation functions
- **API Integration**: Mock API responses and error scenarios
- **Bracelet Calculations**: Bead count and text positioning algorithms
- **Letter Bead Mapping**: Text-to-component conversion logic
- **Size Validation**: Wrist circumference validation rules

### Integration Testing
- **User Flows**: Complete design process from start to finish
- **API Integration**: Real API calls with test data
- **Cross-Browser**: Testing across major browsers and devices
- **Performance**: Load testing with multiple concurrent users

### End-to-End Testing
- **Complete User Journey**: Full design and order process
- **Mobile Responsiveness**: Touch interactions and mobile layouts
- **Accessibility**: Screen reader compatibility and keyboard navigation
- **Order Processing**: Verification of Strapi data storage and Telegram notifications
- **Bracelet Workflows**: Complete bracelet design with text input
- **Multi-language Text**: Hebrew and English letter bead functionality
- **Size Edge Cases**: Testing with minimum and maximum wrist sizes

### Visual Regression Testing
- **Component Snapshots**: Visual consistency across updates
- **Design Preview**: Accuracy of generated jewelry previews
- **Responsive Layouts**: Consistent appearance across screen sizes
- **Animation Testing**: Smooth transitions and loading states

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Lazy loading of design components
- **Image Optimization**: WebP format with fallbacks, responsive images
- **SVG Optimization**: Minified SVG assets and efficient rendering
- **Bundle Size**: Tree shaking and minimal dependencies

### Backend Optimization
- **API Caching**: Redis caching for frequently accessed templates and components
- **Image CDN**: Cloudinary or similar for optimized image delivery
- **Database Indexing**: Proper indexing on frequently queried fields
- **Response Compression**: Gzip compression for API responses

### User Experience Optimization
- **Progressive Loading**: Show content as it becomes available
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Preloading**: Anticipatory loading of likely-needed assets
- **Offline Caching**: Service worker for offline functionality

## Security Considerations

### Data Protection
- **Input Validation**: Comprehensive validation of all user inputs
- **XSS Prevention**: Proper sanitization of user-generated content
- **CSRF Protection**: Token-based protection for form submissions
- **Rate Limiting**: API rate limiting to prevent abuse

### File Upload Security
- **File Type Validation**: Strict validation of uploaded file types
- **File Size Limits**: Reasonable limits on upload sizes
- **Virus Scanning**: Integration with virus scanning services
- **Secure Storage**: Proper file permissions and access controls

### API Security
- **Authentication**: Secure API authentication for admin functions
- **Authorization**: Role-based access control for content management
- **HTTPS**: Encrypted communication for all API calls
- **Input Sanitization**: Server-side sanitization of all inputs