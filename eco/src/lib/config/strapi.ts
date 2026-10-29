/**
 * Single source of truth for the Strapi base URL.
 *
 * Previously `strapiClient.ts` and the order endpoint defaulted to
 * `http://localhost:1337` while the rest of the site hard-coded the production
 * host. If `VITE_STRAPI_URL` was missing from the hosting env, the whole jewelry
 * designer failed ("no templates available") while every other page kept
 * working — a silent failure that was hard to trace.
 *
 * The default is the production host, so a missing env var degrades to
 * "works against production" instead of "broken".
 *
 * A *malformed* value is treated the same as a missing one. `VITE_STRAPI_URL`
 * was once set on Vercel to "https://barbi 1lev1.com" (a space for the dot):
 * that is not an absolute URL, so the browser resolved every request against
 * the page instead — `/customjewelry/barbi%201lev1.com/api/...` — and the
 * designer showed nothing, with only a failed request in the console.
 *
 * Production moved from Render (strapi-7iq2.onrender.com, now gone) to
 * barbi.1lev1.com on 2026-10-29.
 */
const DEFAULT_STRAPI_URL = 'https://barbi.1lev1.com';

export function resolveStrapiUrl(raw: string | undefined): string {
	const value = raw?.trim();
	if (!value) return DEFAULT_STRAPI_URL;
	try {
		// `new URL` alone is not enough: Chrome accepts "https://barbi 1lev1.com"
		// and percent-encodes the host to "barbi%201lev1.com" (Node throws), so
		// the host is checked for plain hostname characters explicitly.
		const url = new URL(value);
		const httpish = url.protocol === 'https:' || url.protocol === 'http:';
		if (httpish && /^[a-z0-9.-]+$/i.test(url.hostname)) return value.replace(/\/+$/, '');
	} catch {
		// fall through to the default
	}
	console.warn(`VITE_STRAPI_URL is not a valid URL ("${value}") - using ${DEFAULT_STRAPI_URL}`);
	return DEFAULT_STRAPI_URL;
}

export const PUBLIC_STRAPI_URL: string = resolveStrapiUrl(import.meta.env.VITE_STRAPI_URL);
