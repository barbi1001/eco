import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STRAPI_URL = "https://strapi-7iq2.onrender.com"
const STRAPI_API_TOKEN = "0392108fd94a9cd10bae241624798ad49c68e875d4c670b9ea63c0e4a118b2672a83079f979e162eed23d1491b00428ea1be867ade7cd7db6c96013c65fd769343086a5bdb5a9add51ba42e9c9c431e4bc0157050113001f09d7b32840541f9287ca36ec194fa366fffda75edad6cfd5edd078d9e3ca5ba49fe398dfc3dcd8d2"

const LETTER_BEADS_FILE_PATH = path.resolve(__dirname, '../strapi-sample-data/bracelet-pendants.json');

async function syncLetterBeads() {
  if (!STRAPI_API_TOKEN) {
    console.error('❌ Error: STRAPI_API_TOKEN is not defined.');
    console.log('Please run the script as: STRAPI_API_TOKEN=your_token node scripts/sync-letter-beads.js');
    process.exit(1);
  }

  try {
    // 1. Read the local JSON file
    console.log(`Reading letter beads from: ${LETTER_BEADS_FILE_PATH}`);
    const rawData = fs.readFileSync(LETTER_BEADS_FILE_PATH, 'utf8');
    const letterBeads = JSON.parse(rawData);

    console.log(`Found ${letterBeads.length} letter beads to sync\n`);

    const headers = {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    let successCount = 0;
    let errorCount = 0;

    // 2. Loop through each letter bead
    for (const bead of letterBeads) {
      try {
        console.log(`Processing: ${bead.name} (${bead?.letter_value?.toUpperCase()})...`);

        // 3. Check if component exists
        const searchUrl = `${STRAPI_URL}/api/jewelry-components?filters[name][$eq]=${encodeURIComponent(bead.name)}`;
        
        const searchResponse = await fetch(searchUrl, { headers });
        if (!searchResponse.ok) {
          throw new Error(`Failed to search component: ${searchResponse.status} ${searchResponse.statusText}`);
        }

        const { data: existingEntries } = await searchResponse.json();
        
        // Prepare the payload for Strapi
        const payload = {
          data: {
            name: bead.name,
            component_type: bead.component_type,
            color: bead.color,
            material: bead.material,
            description: bead.description,
            svg_element: bead.svg_element,
            price: bead.price,
            compatible_sizes: bead.compatible_sizes,
            diameter: bead.diameter ?? 1.0,
            is_active: bead.is_active,
            is_letter_bead: bead.is_letter_bead,
            letter_value: bead.letter_value
          }
        };

        let response;
        if (existingEntries && existingEntries.length > 0) {
          // 4. Update existing
          const entryId = existingEntries[0].id;
          console.log(`  → Found (ID: ${entryId}). Updating...`);
          const updateUrl = `${STRAPI_URL}/api/jewelry-components/${entryId}`;
          
          response = await fetch(updateUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
          });
        } else {
          // 4. Create new
          console.log(`  → Not found. Creating new entry...`);
          const createUrl = `${STRAPI_URL}/api/jewelry-components`;
          
          response = await fetch(createUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          });
        }

        if (response.ok) {
          const result = await response.json();
          console.log(`  ✅ Success! ID: ${result.data.id}\n`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.error(`  ❌ API Error: ${response.status} ${response.statusText}`);
          console.error(`  ${errorText}\n`);
          errorCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ❌ Error processing ${bead.name}:`, error.message, '\n');
        errorCount++;
      }
    }

    // 5. Summary
    console.log('='.repeat(50));
    console.log('📊 Sync Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📦 Total: ${letterBeads.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected Error:', error.message);
    process.exit(1);
  }
}

syncLetterBeads();