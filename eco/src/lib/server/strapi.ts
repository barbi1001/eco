import { env } from '$env/dynamic/private';
import { resolveStrapiUrl } from '$lib/config/strapi';

/**
 * Strapi access from the server, with the write token.
 *
 * `VITE_STRAPI_API_TOKEN` is accepted as a fallback for existing deployments,
 * but a write token must never carry a `VITE_` prefix — Vite inlines those into
 * the browser bundle. Rename it to `STRAPI_API_TOKEN` in the hosting env.
 */
export const STRAPI_URL = resolveStrapiUrl(env.STRAPI_URL || env.VITE_STRAPI_URL);

const API_TOKEN = env.STRAPI_API_TOKEN || env.VITE_STRAPI_API_TOKEN;

export function strapiHeaders(extra: Record<string, string> = {}): HeadersInit {
	const headers: Record<string, string> = { ...extra };
	if (API_TOKEN) headers['Authorization'] = `Bearer ${API_TOKEN}`;
	return headers;
}

export function hasStrapiToken(): boolean {
	return Boolean(API_TOKEN);
}
