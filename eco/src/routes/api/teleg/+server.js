import { json } from '@sveltejs/kit';
import { sendTelegramMessage } from '$lib/server/telegram';
import { STRAPI_URL } from '$lib/server/strapi';

/**
 * Order notification for the shop (hazmanas).
 * Credentials come from private env vars via $lib/server/telegram.
 */
export const POST = async ({ request }) => {
	let data;

	try {
		data = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid request body' }, { status: 400 });
	}

	const name = typeof data?.name === 'string' ? data.name.slice(0, 200) : '';
	const phone = typeof data?.phone === 'string' ? data.phone.slice(0, 40) : '';
	const total = data?.total ?? '';

	const adminLink = `${STRAPI_URL}/admin/content-manager/collectionType/api::hazmana.hazmana?page=1&pageSize=10&sort=id:DESC`;

	const botMessage = [
		`יש לי הזמנה חדשה מ-${name}`,
		`טלפון ${phone}`,
		`על סך ${total}`,
		'',
		`כדאי להיכנס ולבדוק בלינק ${adminLink}`
	].join('\n');

	const sent = await sendTelegramMessage(botMessage);

	return json({ success: sent }, { status: sent ? 200 : 502 });
};
