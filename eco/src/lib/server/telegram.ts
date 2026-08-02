import { env } from '$env/dynamic/private';

/**
 * Telegram notifications — server only.
 *
 * The credentials are read from private env vars so they never reach the browser
 * bundle. The legacy `VITE_`-prefixed names are still accepted as a fallback so
 * existing deployments keep working, but they should be renamed: any variable
 * with a `VITE_` prefix is inlined into client-side code by Vite and is public
 * by definition.
 */
const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = env.TELEGRAM_CHAT_ID || env.VITE_TELEGRAM_CHAT_ID;

export function isTelegramConfigured(): boolean {
	return Boolean(BOT_TOKEN && CHAT_ID);
}

/**
 * Sends a plain-text message. Returns false when the send failed (or when
 * Telegram is not configured) so callers can decide how to surface it.
 */
export async function sendTelegramMessage(
	text: string,
	options: { parseMode?: 'HTML' | 'MarkdownV2' } = {}
): Promise<boolean> {
	if (!isTelegramConfigured()) {
		console.error('Telegram is not configured — TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing');
		return false;
	}

	try {
		const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text,
				...(options.parseMode && { parse_mode: options.parseMode }),
				disable_web_page_preview: true
			})
		});

		if (!res.ok) {
			console.error('Telegram sendMessage failed:', res.status, await res.text());
			return false;
		}

		return true;
	} catch (e) {
		console.error('Telegram sendMessage error:', e);
		return false;
	}
}

/**
 * Sends an image with a caption. Used for jewelry design previews.
 */
export async function sendTelegramPhoto(
	blob: Blob,
	caption: string,
	filename: string
): Promise<boolean> {
	if (!isTelegramConfigured()) return false;

	try {
		const fd = new FormData();
		fd.append('chat_id', CHAT_ID as string);
		fd.append('caption', caption);
		fd.append('photo', blob, filename);

		const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
			method: 'POST',
			body: fd
		});

		if (!res.ok) {
			console.error('Telegram sendPhoto failed:', res.status, await res.text());
			return false;
		}

		return true;
	} catch (e) {
		console.error('Telegram sendPhoto error:', e);
		return false;
	}
}
