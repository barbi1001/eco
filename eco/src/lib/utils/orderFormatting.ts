export type OrderStatusKey =
	| 'pending'
	| 'confirmed'
	| 'in_production'
	| 'ready'
	| 'shipped'
	| 'completed'
	| 'cancelled';

export type PriorityKey = 'low' | 'normal' | 'high' | 'urgent';

export type PaymentMethodKey =
	| 'cash'
	| 'bit'
	| 'credit_card'
	| 'bank_transfer'
	| 'paybox';

export type ShippingMethodKey =
	| 'pickup'
	| 'delivery'
	| 'israel_post'
	| 'courier';

export const orderStatusOptions: { value: OrderStatusKey; label: string; color: string }[] = [
	{ value: 'pending', label: 'ממתינה', color: '#b58a1a' },
	{ value: 'confirmed', label: 'אושרה', color: '#1e6fbf' },
	{ value: 'in_production', label: 'בהפקה', color: '#8c4dbf' },
	{ value: 'ready', label: 'מוכנה', color: '#0d7d5a' },
	{ value: 'shipped', label: 'נשלחה', color: '#0d6383' },
	{ value: 'completed', label: 'הושלמה', color: '#2c6e3f' },
	{ value: 'cancelled', label: 'בוטלה', color: '#8a8a8a' }
];

export const priorityOptions: { value: PriorityKey; label: string; color: string }[] = [
	{ value: 'low', label: 'נמוכה', color: '#888' },
	{ value: 'normal', label: 'רגילה', color: '#5a7a9a' },
	{ value: 'high', label: 'גבוהה', color: '#c97a1c' },
	{ value: 'urgent', label: 'דחופה', color: '#c0392b' }
];

export const paymentMethodOptions: { value: PaymentMethodKey; label: string }[] = [
	{ value: 'cash', label: 'מזומן' },
	{ value: 'bit', label: 'ביט' },
	{ value: 'credit_card', label: 'כרטיס אשראי' },
	{ value: 'bank_transfer', label: 'העברה בנקאית' },
	{ value: 'paybox', label: 'PayBox' }
];

export const shippingMethodOptions: { value: ShippingMethodKey; label: string }[] = [
	{ value: 'pickup', label: 'איסוף עצמי' },
	{ value: 'delivery', label: 'משלוח עד הבית' },
	{ value: 'israel_post', label: 'דואר ישראל' },
	{ value: 'courier', label: 'שליח' }
];

export function statusLabel(key: string | null | undefined): string {
	return orderStatusOptions.find((o) => o.value === key)?.label || key || '—';
}

export function statusColor(key: string | null | undefined): string {
	return orderStatusOptions.find((o) => o.value === key)?.color || '#888';
}

export function priorityLabel(key: string | null | undefined): string {
	return priorityOptions.find((o) => o.value === key)?.label || 'רגילה';
}

export function priorityColor(key: string | null | undefined): string {
	return priorityOptions.find((o) => o.value === key)?.color || '#5a7a9a';
}

export function paymentMethodLabel(key: string | null | undefined): string {
	return paymentMethodOptions.find((o) => o.value === key)?.label || '—';
}

export function shippingMethodLabel(key: string | null | undefined): string {
	return shippingMethodOptions.find((o) => o.value === key)?.label || '—';
}

export function formatDate(input: string | Date | null | undefined): string {
	if (!input) return '—';
	try {
		const d = typeof input === 'string' ? new Date(input) : input;
		return d.toLocaleDateString('he-IL', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	} catch {
		return String(input);
	}
}

export function formatDateTime(input: string | Date | null | undefined): string {
	if (!input) return '—';
	try {
		const d = typeof input === 'string' ? new Date(input) : input;
		return d.toLocaleString('he-IL', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	} catch {
		return String(input);
	}
}

export function formatPrice(value: number | string | null | undefined): string {
	const n = Number(value || 0);
	return `₪${n.toFixed(2)}`;
}
