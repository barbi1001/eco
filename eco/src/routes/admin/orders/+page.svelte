<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, adminFetch, STRAPI_URL } from '$lib/stores/adminAuth';
	import {
		statusLabel,
		statusColor,
		priorityLabel,
		priorityColor,
		formatDateTime,
		formatPrice,
		orderStatusOptions
	} from '$lib/utils/orderFormatting';
	import { Search, RefreshCw, Eye, Archive } from 'lucide-svelte';

	interface OrderRow {
		id: number;
		customer_name: string;
		customer_phone: string;
		customer_email?: string;
		total_price: number;
		order_status: string;
		order_date: string;
		priority?: string;
		paid?: boolean;
		is_archived?: boolean;
		design_preview?: { url?: string } | null;
		[k: string]: any;
	}

	let orders = $state<OrderRow[]>([]);
	let loading = $state(true);
	let errorMsg = $state('');
	let statusFilter = $state<string>('all');
	let searchTerm = $state('');
	let showArchived = $state(false);

	onMount(() => {
		if (!$isAuthenticated) {
			goto('/admin/login');
			return;
		}
		loadOrders();
	});

	async function loadOrders() {
		loading = true;
		errorMsg = '';
		try {
			const params = new URLSearchParams();
			params.set('populate', 'design_preview');
			params.set('sort[0]', 'order_date:desc');
			params.set('pagination[pageSize]', '100');

			const res = await adminFetch(`/api/custom-jewelry-orders?${params.toString()}`);
			if (!res.ok) {
				if (res.status === 401 || res.status === 403) {
					goto('/admin/login');
					return;
				}
				throw new Error(`שגיאה בטעינה: ${res.status}`);
			}
			const body = await res.json();
			orders = (body?.data || []).map(normalizeOrder);
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'שגיאה לא ידועה';
		} finally {
			loading = false;
		}
	}

	function normalizeOrder(raw: any): OrderRow {
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
			total_price: Number(attrs.total_price ?? 0),
			order_status: attrs.order_status ?? 'pending',
			order_date: attrs.order_date ?? attrs.createdAt ?? '',
			priority: attrs.priority ?? 'normal',
			paid: !!attrs.paid,
			is_archived: !!attrs.is_archived,
			design_preview: previewUrl ? { url: previewUrl } : null
		};
	}

	const statusCounts = $derived.by(() => {
		const counts: Record<string, number> = { all: 0 };
		for (const o of orders) {
			if (!showArchived && o.is_archived) continue;
			counts.all += 1;
			counts[o.order_status] = (counts[o.order_status] || 0) + 1;
		}
		return counts;
	});

	const filteredOrders = $derived.by(() => {
		const term = searchTerm.trim().toLowerCase();
		return orders.filter((o) => {
			if (!showArchived && o.is_archived) return false;
			if (statusFilter !== 'all' && o.order_status !== statusFilter) return false;
			if (term) {
				const hay = [
					o.customer_name,
					o.customer_phone,
					o.customer_email,
					String(o.id)
				]
					.join(' ')
					.toLowerCase();
				if (!hay.includes(term)) return false;
			}
			return true;
		});
	});

	function imageUrl(url: string): string {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		return `${STRAPI_URL}${url}`;
	}

	function openOrder(id: number) {
		goto(`/admin/orders/${id}`);
	}
</script>

<div class="page">
	<header class="page-head">
		<div>
			<h1>הזמנות תכשיטים מותאמים</h1>
			<p class="subtitle">
				{filteredOrders.length}
				מתוך
				{statusCounts.all || 0}
				הזמנות
			</p>
		</div>
		<button class="refresh-btn" onclick={loadOrders} disabled={loading} title="רענון">
			<RefreshCw size={16} class={loading ? 'spin' : ''} />
			רענון
		</button>
	</header>

	<div class="filters-bar">
		<div class="search-wrap">
			<Search size={16} class="search-icon" />
			<input
				type="text"
				placeholder="חיפוש לפי שם, טלפון, אימייל או מס׳ הזמנה…"
				bind:value={searchTerm}
			/>
		</div>

		<label class="archive-toggle">
			<input type="checkbox" bind:checked={showArchived} />
			<Archive size={14} />
			הצגת ארכיון
		</label>
	</div>

	<div class="status-tabs">
		<button
			class="tab"
			class:active={statusFilter === 'all'}
			onclick={() => (statusFilter = 'all')}
		>
			הכל
			<span class="count">{statusCounts.all || 0}</span>
		</button>
		{#each orderStatusOptions as opt}
			<button
				class="tab"
				class:active={statusFilter === opt.value}
				onclick={() => (statusFilter = opt.value)}
				style="--tab-color: {opt.color};"
			>
				{opt.label}
				<span class="count">{statusCounts[opt.value] || 0}</span>
			</button>
		{/each}
	</div>

	{#if errorMsg}
		<div class="error-box">{errorMsg}</div>
	{/if}

	{#if loading && orders.length === 0}
		<div class="state-msg">טוענת הזמנות…</div>
	{:else if filteredOrders.length === 0}
		<div class="state-msg">לא נמצאו הזמנות התואמות את הסינון</div>
	{:else}
		<div class="orders-grid">
			{#each filteredOrders as order (order.id)}
				<button class="order-card" onclick={() => openOrder(order.id)}>
					<div class="card-image">
						{#if order.design_preview?.url}
							<img src={imageUrl(order.design_preview.url)} alt="עיצוב" loading="lazy" />
						{:else}
							<div class="no-image">ללא תמונה</div>
						{/if}
						<span
							class="status-pill"
							style="background:{statusColor(order.order_status)}"
						>
							{statusLabel(order.order_status)}
						</span>
						{#if order.priority && order.priority !== 'normal' && order.priority !== 'low'}
							<span
								class="priority-pill"
								style="background:{priorityColor(order.priority)}"
							>
								{priorityLabel(order.priority)}
							</span>
						{/if}
					</div>
					<div class="card-body">
						<div class="row-top">
							<span class="order-id">#{order.id}</span>
							<span class="order-date">{formatDateTime(order.order_date)}</span>
						</div>
						<h3 class="customer-name">{order.customer_name || '—'}</h3>
						<div class="meta-row">
							<span>📱 {order.customer_phone || '—'}</span>
						</div>
						{#if order.customer_email}
							<div class="meta-row email">✉️ {order.customer_email}</div>
						{/if}
						<div class="card-footer">
							<span class="price">{formatPrice(order.total_price)}</span>
							<span class="paid-badge" class:yes={order.paid} class:no={!order.paid}>
								{order.paid ? '✓ שולם' : 'לא שולם'}
							</span>
							<span class="view-link"><Eye size={14} /> פרטים</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.page-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.page-head h1 {
		font-size: 1.5rem;
		margin: 0;
		color: #2b2b2b;
	}

	@media (max-width: 600px) {
		.page-head h1 {
			font-size: 1.2rem;
		}
	}

	.subtitle {
		margin: 0.25rem 0 0;
		color: #777;
		font-size: 0.9rem;
	}

	.refresh-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 1rem;
		min-height: 44px;
		background: #fff;
		border: 1px solid #e2dcc8;
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.95rem;
		color: #444;
		transition: all 0.2s ease;
	}

	.refresh-btn:hover:not(:disabled) {
		border-color: #bf953f;
		color: #b38728;
	}

	.refresh-btn:disabled {
		opacity: 0.6;
	}

	:global(.spin) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.filters-bar {
		display: flex;
		gap: 0.85rem;
		flex-wrap: wrap;
		align-items: center;
		background: #fff;
		padding: 0.75rem 0.9rem;
		border-radius: 0.75rem;
		border: 1px solid #ece6d5;
	}

	@media (max-width: 500px) {
		.filters-bar {
			padding: 0.65rem 0.75rem;
			gap: 0.6rem;
		}
	}

	.search-wrap {
		position: relative;
		flex: 1;
		min-width: 240px;
	}

	.search-wrap :global(.search-icon) {
		position: absolute;
		right: 0.7rem;
		top: 50%;
		transform: translateY(-50%);
		color: #b38728;
	}

	.search-wrap input {
		width: 100%;
		padding: 0.7rem 2.4rem 0.7rem 0.85rem;
		min-height: 44px;
		border: 1px solid #ece6d5;
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 16px;
		background: #fdfcf8;
		box-sizing: border-box;
	}

	.search-wrap input:focus {
		outline: none;
		border-color: #bf953f;
	}

	.archive-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #666;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.status-tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		padding-bottom: 0.25rem;
	}

	.status-tabs::-webkit-scrollbar {
		display: none;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.55rem 0.95rem;
		min-height: 40px;
		flex-shrink: 0;
		background: #fff;
		border: 1px solid #ece6d5;
		border-radius: 999px;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9rem;
		color: #555;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.tab:hover {
		border-color: var(--tab-color, #bf953f);
	}

	.tab.active {
		background: var(--tab-color, #bf953f);
		color: #fff;
		border-color: var(--tab-color, #bf953f);
	}

	.tab .count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.4rem;
		height: 1.4rem;
		padding: 0 0.4rem;
		background: rgba(0, 0, 0, 0.08);
		border-radius: 999px;
		font-size: 0.8rem;
	}

	.tab.active .count {
		background: rgba(255, 255, 255, 0.25);
	}

	.error-box {
		background: #fdecea;
		color: #b1351a;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #f6c8bf;
	}

	.state-msg {
		padding: 3rem;
		text-align: center;
		color: #888;
		background: #fff;
		border-radius: 0.75rem;
		border: 1px dashed #ece6d5;
	}

	.orders-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.85rem;
	}

	@media (max-width: 600px) {
		.orders-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}

	.order-card {
		display: flex;
		flex-direction: column;
		background: #fff;
		border: 1px solid #ece6d5;
		border-radius: 0.85rem;
		overflow: hidden;
		cursor: pointer;
		font-family: inherit;
		text-align: right;
		padding: 0;
		transition: all 0.2s ease;
		-webkit-tap-highlight-color: rgba(191, 149, 63, 0.1);
	}

	.order-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
		border-color: #bf953f;
	}

	.order-card:active {
		transform: scale(0.99);
	}

	.card-image {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;
		background: #f6f4ef;
		overflow: hidden;
	}

	@media (max-width: 600px) {
		.card-image {
			aspect-ratio: 21 / 10;
		}
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #b8b09a;
		font-size: 0.9rem;
	}

	.status-pill,
	.priority-pill {
		position: absolute;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.status-pill {
		top: 0.6rem;
		right: 0.6rem;
	}

	.priority-pill {
		top: 0.6rem;
		left: 0.6rem;
	}

	.card-body {
		padding: 0.85rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.row-top {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: #888;
	}

	.order-id {
		font-weight: 600;
		color: #b38728;
	}

	.customer-name {
		margin: 0.1rem 0 0.2rem;
		font-size: 1.05rem;
		color: #2b2b2b;
	}

	.meta-row {
		font-size: 0.88rem;
		color: #555;
	}

	.meta-row.email {
		color: #777;
		font-size: 0.83rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-footer {
		margin-top: 0.55rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: 0.55rem;
		border-top: 1px dashed #ece6d5;
		flex-wrap: wrap;
	}

	.price {
		font-weight: 700;
		color: #2b2b2b;
	}

	.paid-badge {
		font-size: 0.78rem;
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
	}

	.paid-badge.yes {
		background: #e7f4ec;
		color: #1e6e3e;
	}

	.paid-badge.no {
		background: #f6efe2;
		color: #a87410;
	}

	.view-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		color: #b38728;
		font-weight: 600;
	}
</style>
