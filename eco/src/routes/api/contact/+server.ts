import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramMessage } from '$lib/server/telegram';

/**
 * Lead / contact form endpoint.
 *
 * Exists so pages never touch the Telegram bot token: it used to be read on the
 * client via `import.meta.env.VITE_TELEGRAM_BOT_TOKEN`, which Vite inlines into
 * the browser bundle — i.e. the token shipped to every visitor.
 */

const MAX_FIELD_LENGTH = 2000;

function clean(value: unknown, max = MAX_FIELD_LENGTH): string {
	if (typeof value !== 'string') return '';
	return value.trim().slice(0, max);
}

export const POST: RequestHandler = async ({ request }) => {
	let payload: Record<string, unknown>;

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const name = clean(payload.name, 200);
	const phone = clean(payload.phone, 40);
	const message = clean(payload.message);
	const source = clean(payload.source, 80) || 'לא צוין';

	if (!name || !phone) {
		return json({ success: false, error: 'חסרים שם או טלפון' }, { status: 400 });
	}

	const lines = [
		'📩 פנייה חדשה מהאתר',
		'',
		`👤 שם: ${name}`,
		`📱 טלפון: ${phone}`,
		`📍 מאיפה: ${source}`,
		message ? `\n💬 הודעה: ${message}` : ''
	].filter((line) => line !== '');

	const sent = await sendTelegramMessage(lines.join('\n'));

	if (!sent) {
		return json(
			{ success: false, error: 'לא הצלחנו לשלוח את הפנייה כרגע' },
			{ status: 502 }
		);
	}

	return json({ success: true });
};
