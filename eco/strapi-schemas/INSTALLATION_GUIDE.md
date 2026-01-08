# Strapi Schema Installation Guide

This guide will help you set up the custom jewelry designer content types in Strapi.

## Content Types to Create

You need to create the following content types in your Strapi admin panel:

1. **Jewelry Templates** - Base templates for jewelry designs
2. **Template Position Component** - Component for defining positions on templates
3. **Jewelry Components** - Individual beads, charms, and pendants
4. **Custom Jewelry Orders** - Customer orders with design data

## Installation Methods

### Method 1: Manual Creation via Strapi Admin (Recommended for beginners)

1. Log into your Strapi admin panel
2. Go to **Content-Type Builder**
3. Create each content type following the schemas below

### Method 2: Direct File Import (Advanced)

If you have direct access to your Strapi project files:

1. Copy the schema files to your Strapi project:
   - `jewelry-templates.json` → `src/api/jewelry-template/content-types/jewelry-template/schema.json`
   - `jewelry-components.json` → `src/api/jewelry-component/content-types/jewelry-component/schema.json`
   - `custom-jewelry-orders.json` → `src/api/custom-jewelry-order/content-types/custom-jewelry-order/schema.json`

2. For the component:
   - `template-position-component.json` → `src/components/jewelry/template-position.json`

3. Restart your Strapi server

## Step-by-Step Manual Creation

### Step 1: Create Template Position Component

1. Go to **Content-Type Builder** → **Components** → **Create new component**
2. Category: `jewelry`
3. Name: `Template Position`
4. Add the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| position_id | Text | Yes | - |
| x_coordinate | Number (decimal) | Yes | - |
| y_coordinate | Number (decimal) | Yes | - |
| position_type | Enumeration | Yes | Values: bead, charm, pendant, chain |
| size_category | Enumeration | Yes | Values: small, medium, large |
| is_required | Boolean | No | Default: false |

### Step 2: Create Jewelry Templates Collection

1. Go to **Content-Type Builder** → **Create new collection type**
2. Display name: `Jewelry Template`
3. Add the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | Yes | - |
| category | Enumeration | Yes | Values: necklace, earrings, bracelet, ring |
| description | Rich text | No | - |
| preview_image | Media | No | Single image |
| svg_template | Text (Long text) | Yes | - |
| base_price | Number (decimal) | Yes | Default: 0 |
| positions | Component | No | Repeatable, Select: jewelry.template-position |
| is_active | Boolean | No | Default: true |

### Step 3: Create Jewelry Components Collection

1. Go to **Content-Type Builder** → **Create new collection type**
2. Display name: `Jewelry Component`
3. Add the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | Yes | - |
| component_type | Enumeration | Yes | Values: bead, charm, pendant, chain |
| color | Text | No | - |
| material | Text | No | - |
| description | Rich text | No | - |
| image | Media | No | Single image |
| svg_element | Text (Long text) | Yes | - |
| price | Number (decimal) | Yes | Default: 0 |
| compatible_sizes | JSON | Yes | - |
| is_active | Boolean | No | Default: true |

### Step 4: Create Custom Jewelry Orders Collection

1. Go to **Content-Type Builder** → **Create new collection type**
2. Display name: `Custom Jewelry Order`
3. **Disable** Draft & Publish
4. Add the following fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| customer_name | Text | Yes | - |
| customer_phone | Text | Yes | - |
| customer_message | Text (Long text) | No | - |
| design_preview | Media | No | Single image |
| design_configuration | JSON | Yes | - |
| total_price | Number (decimal) | Yes | - |
| order_status | Enumeration | No | Values: pending, confirmed, in_production, completed, cancelled; Default: pending |
| order_date | DateTime | No | - |
| notes | Text (Long text) | No | - |

## Step 5: Configure Permissions

After creating the content types, configure API permissions:

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Enable the following permissions:

**Jewelry-template:**
- `find` (to fetch all templates)
- `findOne` (to fetch individual templates)

**Jewelry-component:**
- `find` (to fetch all components)
- `findOne` (to fetch individual components)

**Custom-jewelry-order:**
- `create` (to allow order submissions)

## Step 6: Import Sample Data

After setting up the content types, you can import the sample data:

1. Go to **Content Manager**
2. Import the data from the `strapi-sample-data` folder:
   - `bow-necklace-template.json` → Jewelry Templates
   - `sample-beads.json` → Jewelry Components
   - `sample-charms.json` → Jewelry Components
   - `sample-pendants.json` → Jewelry Components

## Verification

To verify everything is set up correctly:

1. Check that all content types appear in the Content Manager
2. Try creating a test jewelry template with positions
3. Try creating a test jewelry component
4. Verify the API endpoints are accessible:
   - `GET /api/jewelry-templates`
   - `GET /api/jewelry-components`
   - `POST /api/custom-jewelry-orders`

## Troubleshooting

**Issue: Component not showing in dropdown**
- Make sure you saved the Template Position component before creating the Jewelry Templates collection

**Issue: API endpoints not accessible**
- Check permissions in Settings → Users & Permissions Plugin → Roles → Public

**Issue: Images not uploading**
- Check your Strapi upload plugin configuration
- Verify file size limits in your server configuration

**Issue: JSON field validation errors**
- For `compatible_sizes`, use format: `["small", "medium", "large"]`
- For `design_configuration`, it will be populated by the frontend application

## Next Steps

After setting up the schemas:

1. Upload images for templates and components
2. Create your first jewelry template
3. Add beads, charms, and pendants
4. Test the custom jewelry designer frontend
5. Configure Telegram notifications for new orders

## Support

If you encounter issues:
- Check the Strapi documentation: https://docs.strapi.io
- Review the sample data files for reference
- Ensure your Strapi version is compatible (v4.x recommended)
