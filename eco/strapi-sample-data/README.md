# Sample Data for Custom Jewelry Designer

This directory contains sample data that can be imported into Strapi to populate the Custom Jewelry Designer with initial content.

## Files

### Templates
- `bow-necklace-template.json`: A complete bow necklace template with 8 customizable positions

### Components
- `sample-beads.json`: 6 different bead components (pearls, gold, crystal)
- `sample-charms.json`: 5 charm components (heart, star, flower, moon, butterfly)
- `sample-pendants.json`: 5 pendant components (teardrop, diamond, cross, infinity, hamsa)

## Import Instructions

### Via Strapi Admin Panel
1. Log into your Strapi admin panel
2. Navigate to Content Manager
3. For each collection type:
   - Click "Create new entry"
   - Copy the data from the JSON files
   - Upload corresponding images for `preview_image` and `image` fields
   - Save and publish

### Via API (Programmatic Import)
You can use the provided sample data with the Strapi REST API:

```javascript
// Example: Import template
const templateData = require('./bow-necklace-template.json');
await fetch('http://localhost:1337/api/jewelry-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({ data: templateData })
});
```

### Bulk Import Script
Create a Node.js script to import all sample data:

```javascript
const fs = require('fs');
const path = require('path');

async function importSampleData() {
  const strapiUrl = 'http://localhost:1337/api';
  const apiToken = 'YOUR_API_TOKEN';
  
  // Import template
  const template = JSON.parse(fs.readFileSync('./bow-necklace-template.json'));
  await createEntry('jewelry-templates', template);
  
  // Import beads
  const beads = JSON.parse(fs.readFileSync('./sample-beads.json'));
  for (const bead of beads) {
    await createEntry('jewelry-components', bead);
  }
  
  // Import charms
  const charms = JSON.parse(fs.readFileSync('./sample-charms.json'));
  for (const charm of charms) {
    await createEntry('jewelry-components', charm);
  }
  
  // Import pendants
  const pendants = JSON.parse(fs.readFileSync('./sample-pendants.json'));
  for (const pendant of pendants) {
    await createEntry('jewelry-components', pendant);
  }
}

async function createEntry(contentType, data) {
  const response = await fetch(`${strapiUrl}/${contentType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    body: JSON.stringify({ data })
  });
  
  if (!response.ok) {
    console.error(`Failed to create ${contentType}:`, await response.text());
  } else {
    console.log(`Created ${contentType}:`, data.name);
  }
}
```

## Image Assets

The sample data references images that need to be uploaded separately. You'll need to:

1. Create or source appropriate images for:
   - Template preview images (bow necklace preview)
   - Component images (bead photos, charm photos, pendant photos)

2. Upload these images through Strapi's media library

3. Update the sample data with the correct image URLs/IDs after upload

## SVG Elements

The sample data includes SVG elements for each component. These are designed to:
- Work with the bow necklace template coordinates
- Include gradients and animations for visual appeal
- Be properly sized for their respective position types
- Maintain consistent styling across components

## Customization

You can modify the sample data to:
- Add more templates (earrings, bracelets, rings)
- Include additional component variations
- Adjust pricing
- Change colors and materials
- Add more position types

## Testing

After importing the sample data, you can test the jewelry designer by:
1. Selecting the bow necklace template
2. Clicking on position markers
3. Choosing from the available beads, charms, and pendants
4. Previewing the complete design
5. Submitting a test order

The sample data provides enough variety to test all major functionality of the custom jewelry designer system.