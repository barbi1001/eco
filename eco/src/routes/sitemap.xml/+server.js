// /src/routes/sitemap.xml/+server.js
import * as sitemap from 'super-sitemap';

export const prerender = true; // optional

export const GET = async () => {
  // Get data for parameterized routes however you need to; this is only an example.
 

  return await sitemap.response({
    origin: 'https://barbracha.vercel.app',
 
    paramValues: {
        // paramValues can be a 1D array of strings
        '/[category]': [
          ['1']
        ],
        '/[category]/[item]': [
          ['1', '7']
        ],
      },
    defaultChangefreq: 'daily',
    defaultPriority: 0.7,
    sort: 'alpha', // default is false; 'alpha' sorts all paths alphabetically.
    processPaths: (paths) => {

      // Optional callback to allow arbitrary processing of your path objects. See the
      // processPaths() section of the README.
      return paths;
    },
  });
};