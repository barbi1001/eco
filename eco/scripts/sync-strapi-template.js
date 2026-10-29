import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CONFIGURATION
 * Edit these values or pass them via environment variables
 */
const STRAPI_URL = process.env.STRAPI_URL || "https://barbi.1lev1.com"
// Never hard-code the token: this file is in git, so a committed token stays in
// the history forever. Pass it in:  STRAPI_API_TOKEN=xxx node scripts/sync-strapi-template.js
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

const TEMPLATE_FILE_PATH = path.resolve(__dirname, '../strapi-sample-data/bow-design-template.json');

async function syncTemplate() {
  if (!STRAPI_API_TOKEN) {
    console.error('❌ Error: STRAPI_API_TOKEN is not defined.');
    console.log('Please run the script as: STRAPI_API_TOKEN=your_token node scripts/sync-strapi-template.js');
    process.exit(1);
  }

  try {
    // 1. Read the local JSON file
    console.log(`Reading template from: ${TEMPLATE_FILE_PATH}`);
    const rawData = fs.readFileSync(TEMPLATE_FILE_PATH, 'utf8');
    const templateData = JSON.parse(rawData);

    const headers = {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 2. Check if template exists
    console.log(`Checking if template "${templateData.name}" exists in Strapi...`);
    const searchUrl = `${STRAPI_URL}/api/jewelry-templates?filters[name][$eq]=${encodeURIComponent(templateData.name)}`;

    const searchResponse = await fetch(searchUrl, { headers });
    if (!searchResponse.ok) {
      throw new Error(`Failed to search template: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const { data: existingEntries } = await searchResponse.json();

    // Prepare the payload for Strapi
    const payload = {
      data: {
        name: templateData.name,
        category: templateData.category,
        description: templateData.description,
        svg_template: templateData.svg_template,
        base_price: templateData.base_price,
        positions: templateData.positions,
        is_active: templateData.is_active,
        is_bracelet: templateData.is_bracelet
      }
    };

    let response;
    if (existingEntries && existingEntries.length > 0) {
      // 3. Update existing
      const entryId = existingEntries[0].id;
      console.log(`Template found (ID: ${entryId}). Updating...`);
      const updateUrl = `${STRAPI_URL}/api/jewelry-templates/${entryId}`;

      response = await fetch(updateUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
    } else {
      // 3. Create new
      console.log('Template not found. Creating new entry...');
      const createUrl = `${STRAPI_URL}/api/jewelry-templates`;

      response = await fetch(createUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Successfully synced template!`);
      console.log(`ID: ${result.data.id}`);
    } else {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error(errorText);
    }

  } catch (error) {
    console.error('❌ Unexpected Error:', error.message);
  }
}

syncTemplate();
