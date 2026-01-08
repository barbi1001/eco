# Custom Jewelry Designer - Component Structure

This directory contains all components for the Custom Jewelry Designer system.

## Directory Structure

```
eco/src/lib/
├── types/
│   └── jewelry.ts              # TypeScript interfaces and types
├── stores/
│   └── jewelryDesigner.ts      # Svelte stores for state management
├── utils/
│   └── jewelryHelpers.ts       # Utility functions and helpers
├── api/
│   └── strapiClient.ts         # Strapi API client and endpoints
└── components/jewelry/
    ├── index.ts                # Component exports
    ├── LoadingSpinner.svelte   # Loading indicator component
    ├── ErrorMessage.svelte     # Error display component
    ├── JewelryDesignerPage.svelte    # Main page component (to be created)
    ├── WelcomeScreen.svelte          # Welcome screen (to be created)
    ├── TemplateGallery.svelte        # Template selection (to be created)
    ├── DesignCanvas.svelte           # Interactive design workspace (to be created)
    ├── ComponentSelector.svelte      # Component selection modal (to be created)
    ├── DesignPreview.svelte          # Design preview and export (to be created)
    └── OrderForm.svelte              # Order form and submission (to be created)
```

## Core Interfaces

### JewelryTemplate
Represents a jewelry template with positions for customization.

### JewelryComponent  
Represents individual components (beads, charms, pendants) that can be placed on templates.

### DesignState
Manages the current design state including selected template and components.

## State Management

The system uses Svelte stores for centralized state management:

- `currentStep`: Current step in the design process
- `selectedTemplate`: Currently selected jewelry template
- `designState`: Complete design configuration
- `availableTemplates`: Templates loaded from Strapi
- `availableComponents`: Components loaded from Strapi

## API Integration

The `strapiClient.ts` provides:
- Template fetching and management
- Component loading and filtering
- Order submission and file upload
- Error handling and retry logic

## Utility Functions

The `jewelryHelpers.ts` includes:
- Data transformation between Strapi and internal formats
- Component filtering and compatibility checking
- SVG manipulation and preview generation
- Price calculations and validation

## Usage

```typescript
import { 
  JewelryDesignerPage,
  WelcomeScreen,
  TemplateGallery 
} from '$lib/components/jewelry';

import { 
  currentStep,
  selectedTemplate,
  jewelryDesignerActions 
} from '$lib/stores/jewelryDesigner';
```

## Next Steps

1. Create the main page component and route
2. Implement individual screen components
3. Add Strapi content types and sample data
4. Test the complete user flow