# Strapi Content Types for Custom Jewelry Designer

This directory contains the content type definitions for the Custom Jewelry Designer feature. These JSON files define the schema for Strapi collections and components.

## Content Types

### 1. Jewelry Templates (`jewelry-templates.json`)
Collection type for jewelry base designs (necklaces, earrings, bracelets, rings).

**Fields:**
- `name`: Template name (string, required)
- `category`: Jewelry category (enum: necklace, earrings, bracelet, ring)
- `description`: Template description (rich text)
- `preview_image`: Template preview image (media, required)
- `svg_template`: SVG markup for the template (text, required)
- `base_price`: Base price in currency (decimal, required)
- `positions`: Array of position components (component, repeatable)
- `is_active`: Whether template is active (boolean, default: true)

### 2. Template Position Component (`template-position.json`)
Component type for defining customizable positions on templates.

**Fields:**
- `position_id`: Unique position identifier (string, required)
- `x_coordinate`: X position on template (decimal, required)
- `y_coordinate`: Y position on template (decimal, required)
- `position_type`: Type of component that can be placed (enum: bead, charm, pendant, chain)
- `size_category`: Size category for compatibility (enum: small, medium, large)
- `is_required`: Whether position must be filled (boolean, default: false)

### 3. Jewelry Components (`jewelry-components.json`)
Collection type for individual jewelry components (beads, charms, pendants).

**Fields:**
- `name`: Component name (string, required)
- `component_type`: Component type (enum: bead, charm, pendant, chain)
- `color`: Component color (string, required)
- `material`: Component material (string, required)
- `description`: Component description (rich text)
- `image`: Component image (media, required)
- `svg_element`: SVG markup for the component (text, required)
- `price`: Component price (decimal, required)
- `compatible_sizes`: Array of compatible sizes (JSON, required)
- `is_active`: Whether component is active (boolean, default: true)

### 4. Custom Jewelry Orders (`custom-jewelry-orders.json`)
Collection type for storing customer orders.

**Fields:**
- `customer_name`: Customer name (string, required)
- `customer_phone`: Customer phone number (string, required)
- `customer_message`: Optional customer message (text)
- `design_preview`: Generated design preview image (media)
- `design_configuration`: Complete design data (JSON, required)
- `total_price`: Total order price (decimal, required)
- `order_status`: Order status (enum: pending, confirmed, in_production, completed)
- `order_date`: Order creation date (datetime, required)

## Installation Instructions

### Method 1: Manual Import via Strapi Admin
1. Start your Strapi application
2. Go to Content-Type Builder in the admin panel
3. Create each collection type manually using the field definitions above
4. For the template-position component:
   - Go to Content-Type Builder → Components
   - Create a new component in category "jewelry"
   - Add the fields as defined in `template-position.json`

### Method 2: Import via Strapi CLI (if available)
1. Copy the JSON files to your Strapi project's appropriate directories
2. Restart Strapi to apply the schema changes

### Method 3: Database Import
1. Use the sample data files in `../strapi-sample-data/` directory
2. Import the data through Strapi admin or via API calls

## Sample Data

Sample data files are available in the `../strapi-sample-data/` directory:
- `bow-necklace-template.json`: Sample bow necklace template with positions
- `sample-beads.json`: Various bead components with SVG elements
- `sample-charms.json`: Charm components with different designs
- `sample-pendants.json`: Pendant components for larger positions

## API Endpoints

Once the content types are created, the following API endpoints will be available:

- `GET /api/jewelry-templates` - Get all templates
- `GET /api/jewelry-templates/:id` - Get specific template
- `GET /api/jewelry-components` - Get all components
- `GET /api/jewelry-components/:id` - Get specific component
- `POST /api/custom-jewelry-orders` - Create new order
- `GET /api/custom-jewelry-orders` - Get all orders (admin)

## Notes

- All content types include draft/publish functionality
- Media fields support image uploads only
- The `compatible_sizes` field in components should be stored as JSON array: `["small", "medium"]`
- SVG elements should be valid SVG markup without the root `<svg>` tag
- Position coordinates are relative to the template's SVG viewBox
- The frontend application expects these exact field names and structures