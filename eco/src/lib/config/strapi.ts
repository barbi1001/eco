/**
 * Single source of truth for the Strapi base URL.
 *
 * Previously `strapiClient.ts` and the order endpoint defaulted to
 * `http://localhost:1337` while the rest of the site hard-coded the production
 * host. If `VITE_STRAPI_URL` was missing from the hosting env, the whole jewelry
 * designer failed ("no templates available") while every other page kept
 * working — a silent failure that was hard to trace.
 *
 * The default is now the production host, so a missing env var degrades to
 * "works against production" instead of "broken".
 */
export const PUBLIC_STRAPI_URL: string =
	import.meta.env.VITE_STRAPI_URL || 'https://strapi-7iq2.onrender.com';
