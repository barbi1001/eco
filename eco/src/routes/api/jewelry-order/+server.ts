import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { 
			customerName, 
			customerPhone, 
			customerMessage, 
			designConfiguration, 
			totalPrice, 
			previewImageBlob,
			wristCircumference,
			customText
		} = data;

		// Step 1: Create the order in Strapi
		const orderData = {
			data: {
				customer_name: customerName,
				customer_phone: customerPhone,
				customer_message: customerMessage || '',
				design_configuration: designConfiguration,
				total_price: totalPrice,
				order_status: 'pending',
				order_date: new Date().toISOString(),
				// Add bracelet-specific fields if provided
				...(wristCircumference && { wrist_circumference: wristCircumference }),
				...(customText && { custom_text: customText })
			}
		};

		const headers: HeadersInit = {
			'Content-Type': 'application/json'
		};

		if (STRAPI_API_TOKEN) {
			headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
		}

		const orderResponse = await fetch(`${STRAPI_URL}/api/custom-jewelry-orders`, {
			method: 'POST',
			headers,
			body: JSON.stringify(orderData)
		});

		if (!orderResponse.ok) {
			throw new Error(`Failed to create order: ${orderResponse.status}`);
		}

		const orderResult = await orderResponse.json();
		const orderId = orderResult.data.id;

		// Step 2: Upload preview image if provided
		let imageUrl = '';
		if (previewImageBlob) {
			try {
				// Convert base64 to blob
				const base64Data = previewImageBlob.split(',')[1];
				const byteCharacters = atob(base64Data);
				const byteNumbers = new Array(byteCharacters.length);
				for (let i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				const byteArray = new Uint8Array(byteNumbers);
				const blob = new Blob([byteArray], { type: 'image/png' });

				// Create form data for file upload
				const formData = new FormData();
				formData.append('files', blob, `design-preview-${orderId}.png`);
				formData.append('refId', orderId.toString());
				formData.append('ref', 'api::custom-jewelry-order.custom-jewelry-order');
				formData.append('field', 'design_preview');

				const uploadHeaders: HeadersInit = {};
				if (STRAPI_API_TOKEN) {
					uploadHeaders['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
				}

				const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
					method: 'POST',
					headers: uploadHeaders,
					body: formData
				});

				if (uploadResponse.ok) {
					const uploadResult = await uploadResponse.json();
					imageUrl = uploadResult[0]?.url || '';
				}
			} catch (uploadError) {
				console.error('Failed to upload preview image:', uploadError);
				// Continue even if image upload fails
			}
		}

		// Step 3: Send Telegram notification
		if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
			try {
				// Prepare template name
				const templateName = designConfiguration.templateId || 'לא צוין';
				const componentsCount = designConfiguration.components?.length || 0;
				
				// Build Telegram message
				const telegramMessage = `🎨 הזמנת תכשיט מותאם אישית חדשה!
%0A
%0A👤 שם: ${customerName}
%0A📱 טלפון: ${customerPhone}
%0A💰 סכום כולל: ₪${totalPrice.toFixed(2)}
%0A
%0A📋 פרטי העיצוב:
%0A• תבנית: ${templateName}
%0A• מספר רכיבים: ${componentsCount}
${wristCircumference ? `%0A• היקף פרק יד: ${wristCircumference} ס"מ` : ''}
${customText ? `%0A• טקסט מותאם: ${customText}` : ''}
%0A
${customerMessage ? `%0A💬 הודעה: ${customerMessage}%0A` : ''}
%0A🔗 לצפייה בהזמנה: ${STRAPI_URL}/admin/content-manager/collectionType/api::custom-jewelry-order.custom-jewelry-order/${orderId}`;

				// Send text message
				const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${telegramMessage}&parse_mode=HTML`;
				await fetch(telegramUrl);

				// Send preview image if available
				if (previewImageBlob && imageUrl) {
					try {
						const photoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
						const photoFormData = new FormData();
						photoFormData.append('chat_id', TELEGRAM_CHAT_ID);
						
						// Convert base64 to blob for Telegram
						const base64Data = previewImageBlob.split(',')[1];
						const byteCharacters = atob(base64Data);
						const byteNumbers = new Array(byteCharacters.length);
						for (let i = 0; i < byteCharacters.length; i++) {
							byteNumbers[i] = byteCharacters.charCodeAt(i);
						}
						const byteArray = new Uint8Array(byteNumbers);
						const photoBlob = new Blob([byteArray], { type: 'image/png' });
						
						photoFormData.append('photo', photoBlob, `design-${orderId}.png`);
						photoFormData.append('caption', `תצוגה מקדימה של התכשיט - הזמנה #${orderId}`);

						await fetch(photoUrl, {
							method: 'POST',
							body: photoFormData
						});
					} catch (photoError) {
						console.error('Failed to send preview image to Telegram:', photoError);
						// Continue even if photo fails
					}
				}
			} catch (telegramError) {
				console.error('Failed to send Telegram notification:', telegramError);
				// Continue even if Telegram notification fails
			}
		}

		return json({
			success: true,
			orderId,
			imageUrl,
			message: 'Order created successfully'
		});
	} catch (error) {
		console.error('Order submission error:', error);
		return json(
			{
				success: false,
				error: 'Failed to submit order',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
