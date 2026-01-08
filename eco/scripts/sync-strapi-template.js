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
const STRAPI_URL = "https://strapi-7iq2.onrender.com"
const STRAPI_API_TOKEN = "0392108fd94a9cd10bae241624798ad49c68e875d4c670b9ea63c0e4a118b2672a83079f979e162eed23d1491b00428ea1be867ade7cd7db6c96013c65fd769343086a5bdb5a9add51ba42e9c9c431e4bc0157050113001f09d7b32840541f9287ca36ec194fa366fffda75edad6cfd5edd078d9e3ca5ba49fe398dfc3dcd8d2"

const TEMPLATE_FILE_PATH = path.resolve(__dirname, '../strapi-sample-data/complete-bracelet-template.json');

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
        is_bracelet:  templateData.is_bracelet
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
