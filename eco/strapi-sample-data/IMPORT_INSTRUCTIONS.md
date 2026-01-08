# Import Instructions for Bow Design

This guide will help you import the bow design template and components into your Strapi CMS.

## Files Created

1. **bow-design-template.json** - The infinity bow necklace template with 23 customizable positions
2. **bow-design-components.json** - Matching beads, charms, and pendants in pink and blue colors

## Template Overview

The bow design features:
- **Infinity bow loops** with 10 bead positions (5 on each loop)
- **Center knot** with 1 required charm position
- **Two drop chains** with 5 bead positions each (10 total)
- **Two pendant positions** at the bottom of each drop chain

**Total positions:** 23 customizable points

## Step 1: Import the Template

1. Log into your Strapi admin panel
2. Go to **Content Manager** → **Jewelry Templates**
3. Click **Create new entry**
4. Copy the data from `bow-design-template.json`:
   - **Name:** Bow Design
   - **Category:** necklace
   - **Description:** Elegant infinity bow necklace with customizable bead positions and pendant drops
   - **Base Price:** 150.00
   - **Is Active:** true
   - **SVG Template:** Copy the entire SVG string
   - **Positions:** Add all 23 positions (you'll need to add them one by one in Strapi)

### Position Details

The template includes these position types:

**Bead Positions (20 total):**
- Left loop: 5 positions
- Right loop: 5 positions
- Left drop chain: 5 positions
- Right drop chain: 5 positions

**Charm Position (1 total):**
- Center knot: 1 required position

**Pendant Positions (2 total):**
- Left drop end: 1 position
- Right drop end: 1 position

## Step 2: Import Components

### Import Beads (5 varieties)

From `bow-design-components.json`, add each bead to **Content Manager** → **Jewelry Components**:

1. **Pink Pearl Bead** - $5.00
   - Small/Medium compatible
   - Soft pink pearl finish

2. **Large Pink Pearl Bead** - $8.00
   - Medium/Large compatible
   - Emphasis bead

3. **Rose Pink Bead** - $4.50
   - Small/Medium compatible
   - Vibrant glass

4. **Coral Pink Bead** - $4.00
   - Small/Medium compatible
   - Warm ceramic

5. **Magenta Bead** - $5.50
   - Small/Medium compatible
   - Bold glass

### Import Charms (3 varieties)

1. **Blue Center Knot** - $15.00
   - Medium/Large compatible
   - Matches the drawing's blue center

2. **Turquoise Center Knot** - $15.00
   - Medium/Large compatible
   - Alternative color option

3. **Pink Center Knot** - $15.00
   - Medium/Large compatible
   - Monochromatic option

### Import Pendants (4 varieties)

1. **Blue Teardrop Pendant** - $20.00
   - Large size
   - Matches the drawing's blue drops

2. **Turquoise Teardrop Pendant** - $20.00
   - Large size
   - Alternative color

3. **Pink Heart Pendant** - $22.00
   - Large size
   - Romantic option

4. **Blue Oval Pendant** - $18.00
   - Large size
   - Classic style

## Step 3: Upload Images (Optional)

For better user experience, you should upload actual product images:

1. Take photos of your real beads, charms, and pendants
2. Remove backgrounds (use tools like remove.bg)
3. Save as PNG with transparency
4. Upload to each component's **image** field in Strapi

## Step 4: Test the Design

1. Navigate to your custom jewelry designer page
2. Select the "Bow Design" template
3. Try clicking on different positions
4. Verify that:
   - Pink beads appear for bead positions
   - Blue/pink charms appear for the center knot
   - Blue/pink pendants appear for drop ends
   - Components are properly sized and positioned

## Pricing Example

Here's a sample configuration with pricing:

**Base Template:** $150.00

**Components:**
- 10 Pink Pearl Beads (loops): 10 × $5.00 = $50.00
- 10 Rose Pink Beads (drops): 10 × $4.50 = $45.00
- 1 Blue Center Knot: $15.00
- 2 Blue Teardrop Pendants: 2 × $20.00 = $40.00

**Total:** $300.00

## Customization Tips

### Adjusting Positions

If the positions don't align perfectly with your design:

1. Edit the template in Strapi
2. Adjust the `x_coordinate` and `y_coordinate` values
3. Save and test in the designer

### Adding More Components

To add more bead/charm/pendant options:

1. Create new entries in **Jewelry Components**
2. Use the same SVG structure as examples
3. Adjust colors in the `fill` and `stroke` attributes
4. Set appropriate `compatible_sizes`

### SVG Customization

The SVG template can be customized:
- Change stroke colors for different metal finishes
- Adjust loop sizes by modifying ellipse `rx` and `ry`
- Change chain angles by modifying path `d` attributes

## Troubleshooting

**Issue: Components not showing**
- Check that `is_active` is true for all components
- Verify `compatible_sizes` matches position `size_category`

**Issue: Components misaligned**
- Adjust position coordinates in the template
- Ensure SVG viewBox matches your design dimensions

**Issue: Colors don't match**
- Edit the `svg_element` field for each component
- Modify `fill` and `stroke` color values

## Next Steps

After importing:

1. Create additional color variations (gold, silver, etc.)
2. Add more pendant styles (stars, flowers, etc.)
3. Create matching earring templates
4. Test the complete order flow

## Support

If you need help:
- Check the main README.md for API documentation
- Review the design.md for component structure
- Test with the sample data first before creating custom designs
