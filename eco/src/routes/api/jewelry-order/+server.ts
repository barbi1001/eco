import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendTelegramMessage, sendTelegramPhoto } from '$lib/server/telegram';
import { STRAPI_URL, strapiHeaders } from '$lib/server/strapi';

function dataUrlToBlob(dataUrl: string): Blob | null {
	try {
		const [meta, base64] = dataUrl.split(',');
		if (!base64) return null;
		const mime = /data:(image\/[a-zA-Z+]+);base64/.exec(meta)?.[1] || 'image/png';
		const bytes = atob(base64);
		const arr = new Uint8Array(bytes.length);
		for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
		return new Blob([arr], { type: mime });
	} catch (e) {
		console.error('Failed to convert dataUrl to blob:', e);
		return null;
	}
}

async function uploadAndLinkImage(blob: Blob, filename: string, orderId: number | string) {
	const fd = new FormData();
	fd.append('files', blob, filename);

	const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
		method: 'POST',
		headers: strapiHeaders(),
		body: fd
	});

	if (!uploadRes.ok) {
		const body = await uploadRes.text();
		console.error('Strapi upload failed:', uploadRes.status, body);
		return { url: '', fileId: null as number | null };
	}

	const uploaded = await uploadRes.json();
	const fileId: number | null = uploaded?.[0]?.id ?? null;
	const url: string = uploaded?.[0]?.url || '';

	if (!fileId) {
		console.error('Strapi upload returned no file id:', uploaded);
		return { url, fileId: null };
	}

	const linkRes = await fetch(`${STRAPI_URL}/api/custom-jewelry-orders/${orderId}`, {
		method: 'PUT',
		headers: strapiHeaders({ 'Content-Type': 'application/json' }),
		body: JSON.stringify({ data: { design_preview: fileId } })
	});

	if (!linkRes.ok) {
		const body = await linkRes.text();
		console.error('Strapi link design_preview failed:', linkRes.status, body);
	}

	return { url, fileId };
}

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const {
		customerName,
		customerPhone,
		customerMessage,
		customerEmail,
		city,
		street,
		houseNumber,
		apartment,
		postalCode,
		designConfiguration,
		totalPrice,
		previewImageBlob,
		wristCircumference,
		customText
	} = data;

	let orderId: number | string | null = null;
	let imageUrl = '';
	let strapiOk = false;
	let strapiError: string | null = null;

	// Step 1: Create the order in Strapi
	try {
		const orderPayload = {
			data: {
				customer_name: customerName,
				customer_phone: customerPhone,
				customer_message: customerMessage || '',
				customer_email: customerEmail || '',
				city: city || '',
				street: street || '',
				house_number: houseNumber || '',
				apartment: apartment || '',
				postal_code: postalCode || '',
				design_configuration: designConfiguration,
				total_price: totalPrice,
				order_status: 'pending',
				order_date: new Date().toISOString(),
				...(wristCircumference && { wrist_circumference: wristCircumference }),
				...(customText && { custom_text: customText })
			}
		};

		const orderResponse = await fetch(`${STRAPI_URL}/api/custom-jewelry-orders`, {
			method: 'POST',
			headers: strapiHeaders({ 'Content-Type': 'application/json' }),
			body: JSON.stringify(orderPayload)
		});

		if (!orderResponse.ok) {
			strapiError = `Failed to create order: ${orderResponse.status} ${await orderResponse.text()}`;
			console.error(strapiError);
		} else {
			const orderResult = await orderResponse.json();
			orderId = orderResult?.data?.id ?? null;
			strapiOk = !!orderId;
		}
	} catch (e) {
		strapiError = e instanceof Error ? e.message : 'Unknown Strapi error';
		console.error('Strapi order create exception:', e);
	}

	// Step 2: Upload preview image and link to order (best-effort)
	const imageBlob = previewImageBlob ? dataUrlToBlob(previewImageBlob) : null;
	if (strapiOk && orderId && imageBlob) {
		try {
			const { url } = await uploadAndLinkImage(imageBlob, `design-preview-${orderId}.png`, orderId);
			imageUrl = url;
		} catch (e) {
			console.error('Image upload/link exception:', e);
		}
	}

	// Step 3: Telegram notification — independent of Strapi success so owner always gets notified
	const templateName = designConfiguration?.templateId || 'לא צוין';
	const componentsCount = designConfiguration?.components?.length || 0;

	const addressLine = [street, houseNumber, apartment ? `דירה ${apartment}` : '', city, postalCode]
		.filter(Boolean)
		.join(', ');

	const lines = [
		'🎨 הזמנת תכשיט מותאם אישית חדשה!',
		'',
		`👤 שם: ${customerName}`,
		`📱 טלפון: ${customerPhone}`,
		customerEmail ? `✉️ אימייל: ${customerEmail}` : '',
		addressLine ? `🏠 כתובת: ${addressLine}` : '',
		`💰 סכום כולל: ₪${Number(totalPrice || 0).toFixed(2)}`,
		'',
		'📋 פרטי העיצוב:',
		`• תבנית: ${templateName}`,
		`• מספר רכיבים: ${componentsCount}`,
		wristCircumference ? `• היקף פרק יד: ${wristCircumference} ס"מ` : '',
		customText ? `• טקסט מותאם: ${customText}` : '',
		customerMessage ? `\n💬 הודעה: ${customerMessage}` : '',
		strapiOk && orderId
			? `\n🔗 לצפייה בהזמנה: ${STRAPI_URL}/admin/content-manager/collectionType/api::custom-jewelry-order.custom-jewelry-order/${orderId}`
			: `\n⚠️ הערה: שמירה ב-Strapi נכשלה — בדקי את הלוגים. (${strapiError ?? 'לא ידוע'})`
	];
	const telegramText = lines.filter((l) => l !== '').join('\n');

	await sendTelegramMessage(telegramText);
	if (imageBlob) {
		await sendTelegramPhoto(
			imageBlob,
			`תצוגה מקדימה - הזמנה${orderId ? ' #' + orderId : ''}`,
			`design-${orderId ?? Date.now()}.png`
		);
	}

	if (!strapiOk) {
		return json(
			{ success: false, error: 'Failed to save order in Strapi', details: strapiError },
			{ status: 500 }
		);
	}

	return json({ success: true, orderId, imageUrl, message: 'Order created successfully' });
};