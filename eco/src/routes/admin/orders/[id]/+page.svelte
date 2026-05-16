<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { isAuthenticated, adminFetch, STRAPI_URL } from '$lib/stores/adminAuth';
	import {
		orderStatusOptions,
		priorityOptions,
		paymentMethodOptions,
		shippingMethodOptions,
		statusLabel,
		statusColor,
		formatDateTime,
		formatPrice
	} from '$lib/utils/orderFormatting';
	import { ArrowRight, Save, Trash2, Archive, RefreshCw, Phone, MessageCircle } from 'lucide-svelte';
	import AdminDesignViewer from '$lib/components/admin/AdminDesignViewer.svelte';

	interface OrderDetail {
		id: number;
		customer_name: string;
		customer_phone: string;
		customer_email: string;
		customer_message: string;
		city: string;
		street: string;
		house_number: string;
		apartment: string;
		postal_code: string;
		design_configuration: any;
		total_price: number;
		order_status: string;
		order_date: string;
		wrist_circumference?: number;
		custom_text?: string;
		design_preview?: { url?: string } | null;
		admin_notes?: string;
		paid?: boolean;
		payment_method?: string;
		payment_date?: string;
		tracking_number?: string;
		shipping_method?: string;
		production_deadline?: string;
		priority?: string;
		is_archived?: boolean;
		createdAt?: string;
		updatedAt?: string;
	}

	let order = $state<OrderDetail | null>(null);
	let loading = $state(true);
	let errorMsg = $state('');
	let savingField = $state<string | null>(null);
	let saveSuccess = $state<string | null>(null);

	const id = $derived($page.params.id);

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/admin/login');
			return;
		}
		loadOrder();
	});

	async function loadOrder() {
		loading = true;
		errorMsg = '';
		try {
			const res = await adminFetch(
				`/api/custom-jewelry-orders/${id}?populate=design_preview`
			);
			if (!res.ok) {
				if (res.status === 401 || res.status === 403) {
					goto('/admin/login');
					return;
				}
				if (res.status === 404) throw new Error('הזמנה לא נמצאה');
				throw new Error(`שגיאה בטעינה: ${res.status}`);
			}
			const body = await res.json();
			order = normalizeOrder(body?.data);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
		} finally {
			loading = false;
		}
	}

	function normalizeOrder(raw: any): OrderDetail {
		const attrs = raw?.attributes ?? raw;
		const preview = attrs?.design_preview;
		const previewUrl =
			preview?.data?.attributes?.url ||
			preview?.url ||
			null;
		return {
			id: raw.id,
			customer_name: attrs.customer_name ?? '',
			customer_phone: attrs.customer_phone ?? '',
			customer_email: attrs.customer_email ?? '',
			customer_message: attrs.customer_message ?? '',
			city: attrs.city ?? '',
			street: attrs.street ?? '',
			house_number: attrs.house_number ?? '',
			apartment: attrs.apartment ?? '',
			postal_code: attrs.postal_code ?? '',
			design_configuration: attrs.design_configuration ?? null,
			total_price: Number(attrs.total_price ?? 0),
			order_status: attrs.order_status ?? 'pending',
			order_date: attrs.order_date ?? attrs.createdAt ?? '',
			wrist_circumference: attrs.wrist_circumference ?? undefined,
			custom_text: attrs.custom_text ?? '',
			design_preview: previewUrl ? { url: previewUrl } : null,
			admin_notes: attrs.admin_notes ?? '',
			paid: !!attrs.paid,
			payment_method: attrs.payment_method ?? '',
			payment_date: attrs.payment_date ?? '',
			tracking_number: attrs.tracking_number ?? '',
			shipping_method: attrs.shipping_method ?? '',
			production_deadline: attrs.production_deadline ?? '',
			priority: attrs.priority ?? 'normal',
			is_archived: !!attrs.is_archived,
			createdAt: attrs.createdAt,
			updatedAt: attrs.updatedAt
		};
	}

	async function saveField(field: string, value: any) {
		if (!order) return;
		savingField = field;
		errorMsg = '';
		saveSuccess = null;
		try {
			const res = await adminFetch(`/api/custom-jewelry-orders/${order.id}`, {
				method: 'PUT',
				body: JSON.stringify({ data: { [field]: value } })
			});
			if (!res.ok) {
				const body = await res.text();
				throw new Error(`עדכון נכשל: ${res.status} ${body}`);
			}
			saveSuccess = 'נשמר ✓';
			setTimeout(() => (saveSuccess = null), 2000);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'שמירה נכשלה';
			await loadOrder();
		} finally {
			savingField = null;
		}
	}

	function imageUrl(url: string): string {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		return `${STRAPI_URL}${url}`;
	}

	const fullAddress = $derived.by(() => {
		if (!order) return '';
		return [
			order.street,
			order.house_number,
			order.apartment ? `דירה ${order.apartment}` : '',
			order.city,
			order.postal_code
		]
			.filter(Boolean)
			.join(', ');
	});

	const componentsCount = $derived(
		order?.design_configuration?.components?.length ?? 0
	);

	function whatsappLink(phone: string): string {
		const digits = phone.replace(/\D/g, '');
		if (!digits) return '';
		const intl = digits.startsWith('972')
			? digits
			: digits.startsWith('0')
				? `972${digits.slice(1)}`
				: digits;
		return `https://wa.me/${intl}`;
	}
</script>

<div class="page">
	<button class="back-btn" onclick={() => goto('/admin/orders')}>
		<ArrowRight size={16} />
		חזרה לרשימה
	</button>

	{#if loading}
		<div class="state-msg">טוענת פרטי הזמנה…</div>
	{:else if errorMsg && !order}
		<div class="error-box">{errorMsg}</div>
	{:else if order}
		<div class="head-row">
			<div>
				<h1>הזמנה #{order.id}</h1>
				<p class="created">נוצרה ב-{formatDateTime(order.order_date)}</p>
			</div>
			<div class="head-pills">
				<span
					class="status-pill"
					style="background:{statusColor(order.order_status)}"
				>
					{statusLabel(order.order_status)}
				</span>
				<span class="price-pill">{formatPrice(order.total_price)}</span>
			</div>
		</div>

		{#if errorMsg}
			<div class="error-box">{errorMsg}</div>
		{/if}
		{#if saveSuccess}
			<div class="success-toast">{saveSuccess}</div>
		{/if}

		<div class="grid">
			<!-- Customer details -->
			<section class="card">
				<h2>פרטי הלקוחה</h2>
				<dl>
					<dt>שם</dt>
					<dd>{order.customer_name || '—'}</dd>
					<dt>טלפון</dt>
					<dd>
						{#if order.customer_phone}
							<a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
						{:else}
							—
						{/if}
					</dd>
					<dt>אימייל</dt>
					<dd>
						{#if order.customer_email}
							<a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>
						{:else}
							—
						{/if}
					</dd>
					<dt>כתובת</dt>
					<dd>{fullAddress || '—'}</dd>
					{#if order.customer_message}
						<dt>הודעה</dt>
						<dd class="message">{order.customer_message}</dd>
					{/if}
				</dl>

				{#if order.customer_phone}
					<div class="contact-actions">
						<a class="contact-btn call" href={`tel:${order.customer_phone}`}>
							<Phone size={16} />
							התקשרי
						</a>
						<a
							class="contact-btn whatsapp"
							href={whatsappLink(order.customer_phone)}
							target="_blank"
							rel="noopener"
						>
							<MessageCircle size={16} />
							WhatsApp
						</a>
					</div>
				{/if}
			</section>

			<!-- Design preview -->
			<section class="card">
				<h2>תצוגה מקדימה</h2>
				{#if order.design_preview?.url}
					<a
						href={imageUrl(order.design_preview.url)}
						target="_blank"
						rel="noopener"
						class="preview-link"
					>
						<img src={imageUrl(order.design_preview.url)} alt="עיצוב" />
					</a>
				{:else}
					<div class="no-image">ללא תמונת תצוגה</div>
				{/if}
				<dl class="design-meta">
					<dt>תבנית</dt>
					<dd>{order.design_configuration?.templateId || '—'}</dd>
					<dt>מס׳ רכיבים</dt>
					<dd>{componentsCount}</dd>
					{#if order.wrist_circumference}
						<dt>היקף פרק יד</dt>
						<dd>{order.wrist_circumference} ס״מ</dd>
					{/if}
					{#if order.custom_text}
						<dt>טקסט מותאם</dt>
						<dd>{order.custom_text}</dd>
					{/if}
				</dl>
			</section>

			<!-- Interactive design canvas (full width) -->
			{#if order.design_configuration?.templateId && order.design_configuration?.components?.length}
				<div class="span-full">
					<AdminDesignViewer
						designConfig={order.design_configuration}
						wristCircumference={order.wrist_circumference}
						customText={order.custom_text}
					/>
				</div>
			{/if}

			<!-- Status & priority -->
			<section class="card">
				<h2>סטטוס וניהול</h2>

				<label class="field">
					<span class="label-text">סטטוס הזמנה</span>
					<select
						value={order.order_status}
						onchange={(e) => {
							const v = (e.target as HTMLSelectElement).value;
							if (order) order.order_status = v;
							saveField('order_status', v);
						}}
						disabled={savingField === 'order_status'}
					>
						{#each orderStatusOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="label-text">דחיפות</span>
					<select
						value={order.priority || 'normal'}
						onchange={(e) => {
							const v = (e.target as HTMLSelectElement).value;
							if (order) order.priority = v;
							saveField('priority', v);
						}}
						disabled={savingField === 'priority'}
					>
						{#each priorityOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="label-text">תאריך יעד להפקה</span>
					<input
						type="date"
						value={order.production_deadline?.split('T')[0] || ''}
						onchange={(e) => {
							const v = (e.target as HTMLInputElement).value;
							if (order) order.production_deadline = v;
							saveField('production_deadline', v || null);
						}}
						disabled={savingField === 'production_deadline'}
					/>
				</label>

				<label class="checkbox-field">
					<input
						type="checkbox"
						checked={order.is_archived ?? false}
						onchange={(e) => {
							const v = (e.target as HTMLInputElement).checked;
							if (order) order.is_archived = v;
							saveField('is_archived', v);
						}}
						disabled={savingField === 'is_archived'}
					/>
					<Archive size={14} />
					בארכיון
				</label>
			</section>

			<!-- Payment -->
			<section class="card">
				<h2>תשלום</h2>

				<label class="checkbox-field paid-toggle">
					<input
						type="checkbox"
						checked={order.paid ?? false}
						onchange={(e) => {
							const v = (e.target as HTMLInputElement).checked;
							if (order) order.paid = v;
							saveField('paid', v);
						}}
						disabled={savingField === 'paid'}
					/>
					{order.paid ? '✓ שולם' : 'טרם שולם'}
				</label>

				<label class="field">
					<span class="label-text">אמצעי תשלום</span>
					<select
						value={order.payment_method || ''}
						onchange={(e) => {
							const v = (e.target as HTMLSelectElement).value;
							if (order) order.payment_method = v;
							saveField('payment_method', v || null);
						}}
						disabled={savingField === 'payment_method'}
					>
						<option value="">—</option>
						{#each paymentMethodOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="label-text">תאריך תשלום</span>
					<input
						type="date"
						value={order.payment_date?.split('T')[0] || ''}
						onchange={(e) => {
							const v = (e.target as HTMLInputElement).value;
							if (order) order.payment_date = v;
							saveField('payment_date', v || null);
						}}
						disabled={savingField === 'payment_date'}
					/>
				</label>
			</section>

			<!-- Shipping -->
			<section class="card">
				<h2>משלוח</h2>

				<label class="field">
					<span class="label-text">שיטת איסוף/משלוח</span>
					<select
						value={order.shipping_method || ''}
						onchange={(e) => {
							const v = (e.target as HTMLSelectElement).value;
							if (order) order.shipping_method = v;
							saveField('shipping_method', v || null);
						}}
						disabled={savingField === 'shipping_method'}
					>
						<option value="">—</option>
						{#each shippingMethodOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				<label class="field">
					<span class="label-text">מספר מעקב / חשבונית</span>
					<input
						type="text"
						value={order.tracking_number || ''}
						oninput={(e) => {
							if (order) order.tracking_number = (e.target as HTMLInputElement).value;
						}}
						onblur={(e) =>
							saveField('tracking_number', (e.target as HTMLInputElement).value)}
						disabled={savingField === 'tracking_number'}
						placeholder="אופציונלי"
					/>
				</label>
			</section>

			<!-- Admin notes -->
			<section class="card span-full">
				<h2>הערות פנימיות</h2>
				<textarea
					rows="5"
					placeholder="הערות לעצמך — לא נשלחות ללקוחה"
					value={order.admin_notes || ''}
					oninput={(e) => {
						if (order) order.admin_notes = (e.target as HTMLTextAreaElement).value;
					}}
					onblur={(e) =>
						saveField('admin_notes', (e.target as HTMLTextAreaElement).value)}
					disabled={savingField === 'admin_notes'}
				></textarea>
				<p class="hint">השמירה אוטומטית בעת יציאה מהשדה.</p>
			</section>

			<!-- Strapi raw link -->
			<section class="card span-full strapi-link">
				<a
					href={`${STRAPI_URL}/admin/content-manager/collectionType/api::custom-jewelry-order.custom-jewelry-order/${order.id}`}
					target="_blank"
					rel="noopener"
				>
					פתיחה ב-Strapi (גישה לכל השדות הגולמיים) ↗
				</a>
				<button class="reload-btn" onclick={loadOrder} title="טעינה מחדש">
					<RefreshCw size={14} />
					טעינה מחדש
				</button>
			</section>
		</div>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 0.9rem;
		min-height: 44px;
		background: #fff;
		border: 1px solid #ece6d5;
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.95rem;
		color: #666;
		align-self: flex-start;
	}

	.back-btn:hover {
		background: #fff;
		border-color: #bf953f;
		color: #b38728;
	}

	.head-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.head-row h1 {
		margin: 0;
		font-size: 1.5rem;
		color: #2b2b2b;
	}

	.created {
		margin: 0.25rem 0 0;
		font-size: 0.88rem;
		color: #888;
	}

	.head-pills {
		display: flex;
		gap: 0.5rem;
	}

	.status-pill,
	.price-pill {
		padding: 0.4rem 0.95rem;
		border-radius: 999px;
		color: #fff;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.price-pill {
		background: linear-gradient(to right, #bf953f, #b38728);
	}

	.error-box {
		background: #fdecea;
		color: #b1351a;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #f6c8bf;
	}

	.success-toast {
		position: fixed;
		bottom: calc(1.25rem + env(safe-area-inset-bottom));
		left: 50%;
		transform: translateX(-50%);
		background: #1e6e3e;
		color: #fff;
		padding: 0.7rem 1.4rem;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 600;
		box-shadow: 0 8px 20px rgba(30, 110, 62, 0.35);
		z-index: 100;
		animation: toast-in 0.25s ease;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.state-msg {
		padding: 3rem;
		text-align: center;
		color: #888;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 0.85rem;
	}

	@media (max-width: 600px) {
		.grid {
			grid-template-columns: 1fr;
			gap: 0.7rem;
		}
	}

	.card {
		background: #fff;
		border: 1px solid #ece6d5;
		border-radius: 0.85rem;
		padding: 1.1rem 1.25rem;
	}

	@media (max-width: 600px) {
		.card {
			padding: 0.95rem 1rem;
			border-radius: 0.7rem;
		}
	}

	.card.span-full,
	.grid > .span-full {
		grid-column: 1 / -1;
	}

	.card h2 {
		margin: 0 0 0.85rem;
		font-size: 1.05rem;
		color: #b38728;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f3ecd9;
	}

	dl {
		margin: 0;
		display: grid;
		grid-template-columns: 7rem 1fr;
		gap: 0.55rem 0.85rem;
	}

	dt {
		font-size: 0.85rem;
		color: #888;
		font-weight: 500;
	}

	dd {
		margin: 0;
		font-size: 0.95rem;
		color: #2b2b2b;
		word-break: break-word;
	}

	dd a {
		display: inline-block;
		padding: 0.15rem 0;
		min-height: 28px;
	}

	dd a {
		color: #b38728;
		text-decoration: none;
	}

	dd a:hover {
		text-decoration: underline;
	}

	dd.message {
		white-space: pre-wrap;
		background: #fdfcf8;
		padding: 0.5rem 0.7rem;
		border-radius: 0.4rem;
		border: 1px solid #f3ecd9;
	}

	.preview-link {
		display: block;
		margin-bottom: 0.75rem;
		border-radius: 0.6rem;
		overflow: hidden;
		border: 1px solid #ece6d5;
	}

	.preview-link img {
		width: 100%;
		display: block;
	}

	.no-image {
		padding: 3rem 1rem;
		text-align: center;
		color: #b8b09a;
		background: #fdfcf8;
		border-radius: 0.6rem;
		border: 1px dashed #ece6d5;
		margin-bottom: 0.75rem;
	}

	.design-meta {
		grid-template-columns: 8rem 1fr;
	}

	.field {
		display: block;
		margin-bottom: 0.85rem;
	}

	.label-text {
		display: block;
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.35rem;
	}

	.field select,
	.field input[type='text'],
	.field input[type='date'],
	textarea {
		width: 100%;
		padding: 0.7rem 0.8rem;
		min-height: 44px;
		border: 1px solid #ece6d5;
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 16px;
		background: #fdfcf8;
		box-sizing: border-box;
	}

	.field select:focus,
	.field input:focus,
	textarea:focus {
		outline: none;
		border-color: #bf953f;
	}

	.field select:disabled,
	.field input:disabled,
	textarea:disabled {
		opacity: 0.6;
	}

	textarea {
		resize: vertical;
		min-height: 110px;
		font-family: inherit;
	}

	.checkbox-field {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		color: #555;
		font-size: 0.95rem;
		cursor: pointer;
		margin-top: 0.25rem;
		padding: 0.5rem 0;
		min-height: 44px;
	}

	.checkbox-field input[type='checkbox'] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.paid-toggle {
		font-weight: 600;
		margin-bottom: 0.85rem;
	}

	.hint {
		margin: 0.4rem 0 0;
		font-size: 0.78rem;
		color: #a0a0a0;
	}

	.strapi-link {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.strapi-link a {
		color: #b38728;
		text-decoration: none;
		font-size: 0.95rem;
	}

	.strapi-link a:hover {
		text-decoration: underline;
	}

	.reload-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.85rem;
		background: transparent;
		border: 1px solid #ece6d5;
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.88rem;
		color: #666;
	}

	.reload-btn:hover {
		border-color: #bf953f;
		color: #b38728;
	}

	.reload-btn {
		min-height: 44px;
	}

	.contact-actions {
		display: flex;
		gap: 0.55rem;
		margin-top: 0.85rem;
		padding-top: 0.85rem;
		border-top: 1px dashed #f3ecd9;
	}

	.contact-btn {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.7rem 0.85rem;
		min-height: 44px;
		border-radius: 0.55rem;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		color: #fff;
		transition: opacity 0.2s ease;
	}

	.contact-btn.call {
		background: linear-gradient(135deg, #b38728 0%, #bf953f 100%);
	}

	.contact-btn.whatsapp {
		background: linear-gradient(135deg, #1d8a5b 0%, #25d366 100%);
	}

	.contact-btn:active {
		opacity: 0.85;
	}

	@media (max-width: 600px) {
		dl {
			grid-template-columns: 1fr;
			gap: 0.15rem 0;
		}
		dt {
			padding-top: 0.55rem;
			border-top: 1px dashed #f3ecd9;
		}
		dt:first-of-type {
			border-top: none;
			padding-top: 0;
		}
		dd {
			padding-bottom: 0.55rem;
		}
		.head-row h1 {
			font-size: 1.2rem;
		}
		.status-pill,
		.price-pill {
			padding: 0.4rem 0.75rem;
			font-size: 0.85rem;
		}
		.card h2 {
			font-size: 1rem;
		}
	}
</style>
