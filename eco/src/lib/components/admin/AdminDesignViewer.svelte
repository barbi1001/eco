<script lang="ts">
	import { onMount } from 'svelte';
	import { adminFetch, STRAPI_URL } from '$lib/stores/adminAuth';
	import { prepareSvgForRendering } from '$lib/utils/svgSanitizer';
	import type {
		JewelryTemplate,
		JewelryComponent,
		TemplatePosition,
		ComponentType,
		SizeCategory
	} from '$lib/types/jewelry';

	interface Placement {
		positionId: string;
		componentId: string;
	}

	interface Props {
		designConfig: {
			templateId?: string | number;
			components?: Placement[];
			braceletData?: any;
		} | null;
		wristCircumference?: number;
		customText?: string;
	}

	let { designConfig, wristCircumference, customText }: Props = $props();

	let template = $state<JewelryTemplate | null>(null);
	let componentsById = $state<Map<string, JewelryComponent>>(new Map());
	let loading = $state(true);
	let errorMsg = $state('');
	let selectedPositionId = $state<string | null>(null);
	let hoveredPositionId = $state<string | null>(null);

	const placements = $derived<Placement[]>(designConfig?.components ?? []);

	const componentIdByPosition = $derived.by(() => {
		const map = new Map<string, string>();
		placements.forEach((p) => map.set(p.positionId, String(p.componentId)));
		return map;
	});

	const canvasWidth = $derived.by(() => {
		const svg = template?.svgTemplate || '';
		const m = svg.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/);
		return m ? parseFloat(m[1]) : 800;
	});

	const canvasHeight = $derived.by(() => {
		const svg = template?.svgTemplate || '';
		const m = svg.match(/viewBox=["']\s*[\d.]+\s+[\d.]+\s+[\d.]+\s+([\d.]+)/);
		return m ? parseFloat(m[1]) : 600;
	});

	const placedItems = $derived.by(() => {
		if (!template) return [] as Array<{ position: TemplatePosition; component: JewelryComponent }>;
		return template.positions
			.map((position) => {
				const compId = componentIdByPosition.get(position.id);
				if (!compId) return null;
				const component = componentsById.get(compId);
				if (!component) return null;
				return { position, component };
			})
			.filter((x): x is { position: TemplatePosition; component: JewelryComponent } => x !== null);
	});

	const totalComponents = $derived(placedItems.length);

	const selectedComponent = $derived.by(() => {
		if (!selectedPositionId) return null;
		return placedItems.find((p) => p.position.id === selectedPositionId) ?? null;
	});

	function flexAttrs(raw: any): any {
		return raw?.attributes ?? raw ?? {};
	}

	function flexMediaUrl(media: any): string {
		if (!media) return '';
		return (
			media?.data?.attributes?.url ||
			media?.url ||
			media?.formats?.thumbnail?.url ||
			''
		);
	}

	function normalizeTemplate(raw: any): JewelryTemplate {
		const attrs = flexAttrs(raw);
		return {
			id: String(raw?.id ?? attrs.id ?? ''),
			name: attrs.name ?? '',
			category: attrs.category ?? 'bracelet',
			description: attrs.description ?? '',
			previewImage: flexMediaUrl(attrs.preview_image),
			svgTemplate: attrs.svg_template ?? '',
			basePrice: Number(attrs.base_price ?? 0),
			isActive: !!attrs.is_active,
			isBracelet: !!attrs.is_bracelet,
			positions:
				(attrs.positions ?? []).map((p: any) => ({
					id: p.position_id ?? p.id,
					x: Number(p.x_coordinate ?? p.x ?? 0),
					y: Number(p.y_coordinate ?? p.y ?? 0),
					type: (p.position_type ?? p.type) as ComponentType,
					size: (p.size_category ?? p.size) as SizeCategory,
					required: !!(p.is_required ?? p.required)
				})) ?? []
		};
	}

	function normalizeComponent(raw: any): JewelryComponent {
		const attrs = flexAttrs(raw);
		const isLetter =
			attrs.is_letter_bead ||
			(attrs.name && (attrs.name.endsWith('-letter') || attrs.name.includes('-letter')));
		return {
			id: String(raw?.id ?? attrs.id ?? ''),
			name: attrs.name ?? '',
			type: attrs.component_type ?? 'bead',
			color: attrs.color ?? '',
			material: attrs.material ?? '',
			description: attrs.description ?? '',
			image: flexMediaUrl(attrs.image),
			svgElement: attrs.svg_element ?? '',
			price: Number(attrs.price ?? 0),
			compatibleSizes: attrs.compatible_sizes ?? [],
			isActive: !!attrs.is_active,
			diameter: attrs.diameter,
			isLetterBead: !!isLetter,
			letterValue: attrs.letter_value
		};
	}

	async function loadDesign() {
		if (!designConfig?.templateId || !placements.length) {
			loading = false;
			return;
		}

		loading = true;
		errorMsg = '';

		try {
			const templateRes = await adminFetch(
				`/api/jewelry-templates/${designConfig.templateId}?populate=*`
			);
			if (!templateRes.ok) {
				throw new Error(`טעינת תבנית נכשלה (${templateRes.status})`);
			}
			const templateBody = await templateRes.json();
			template = normalizeTemplate(templateBody?.data);

			const ids = Array.from(new Set(placements.map((p) => String(p.componentId))));
			const idParams = ids
				.map((id, i) => `filters[id][$in][${i}]=${encodeURIComponent(id)}`)
				.join('&');
			const compRes = await adminFetch(
				`/api/jewelry-components?${idParams}&populate=*&pagination[pageSize]=${ids.length}`
			);
			if (!compRes.ok) {
				throw new Error(`טעינת רכיבים נכשלה (${compRes.status})`);
			}
			const compBody = await compRes.json();
			const list: any[] = compBody?.data ?? [];
			const map = new Map<string, JewelryComponent>();
			list.forEach((raw) => {
				const c = normalizeComponent(raw);
				map.set(c.id, c);
			});
			componentsById = map;
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'שגיאה בטעינת העיצוב';
		} finally {
			loading = false;
		}
	}

	function imageUrl(url: string): string {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		return `${STRAPI_URL}${url}`;
	}

	function typeLabel(type: ComponentType): string {
		const map: Record<ComponentType, string> = {
			bead: 'חרוז',
			charm: "צ'ארם",
			pendant: 'תליון',
			chain: 'שרשרת'
		};
		return map[type] ?? type;
	}

	function handlePositionClick(positionId: string) {
		selectedPositionId = selectedPositionId === positionId ? null : positionId;
	}

	onMount(loadDesign);
</script>

<section class="card admin-canvas-card">
	<div class="card-head">
		<h2>תצוגת קנבס</h2>
		{#if !loading && template}
			<span class="meta">{template.name} · {totalComponents} רכיבים</span>
		{/if}
	</div>

	{#if loading}
		<div class="state">טוענת את העיצוב…</div>
	{:else if errorMsg}
		<div class="error">{errorMsg}</div>
	{:else if !template}
		<div class="state">אין נתוני עיצוב להצגה</div>
	{:else}
		<div class="viewer">
			<div class="canvas-wrap">
				<svg
					class="canvas-svg"
					viewBox="0 0 {canvasWidth} {canvasHeight}"
					xmlns="http://www.w3.org/2000/svg"
					role="img"
					aria-label="תצוגת קנבס של התכשיט"
				>
					<rect width="100%" height="100%" fill="#ffffff" />

					<g class="template-layer">
						{@html prepareSvgForRendering(template.svgTemplate)}
					</g>

					<g class="components-layer">
						{#each placedItems as item (item.position.id)}
							{@const isSel = selectedPositionId === item.position.id}
							{@const isHov = hoveredPositionId === item.position.id}
							<g
								class="component-marker"
								class:selected={isSel}
								class:hovered={isHov}
								transform="translate({item.position.x}, {item.position.y})"
								role="button"
								tabindex="0"
								aria-label={`רכיב ${item.component.name}`}
								onclick={() => handlePositionClick(item.position.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handlePositionClick(item.position.id);
									}
								}}
								onmouseenter={() => (hoveredPositionId = item.position.id)}
								onmouseleave={() => (hoveredPositionId = null)}
							>
								{@html prepareSvgForRendering(item.component.svgElement)}
								{#if isSel || isHov}
									<circle
										class="halo"
										cx="0"
										cy="0"
										r={item.position.size === 'large'
											? 32
											: item.position.size === 'medium'
												? 22
												: 16}
										fill="none"
										stroke={isSel ? '#b38728' : '#bf953f'}
										stroke-width="2"
										stroke-dasharray={isSel ? '0' : '4 3'}
									/>
								{/if}
							</g>
						{/each}
					</g>
				</svg>

				<p class="hint">לחצי על רכיב כדי לראות את פרטיו</p>
			</div>

			<div class="details">
				<h3>פרטי רכיבים</h3>

				{#if wristCircumference || customText}
					<div class="bracelet-meta">
						{#if wristCircumference}
							<div><span>היקף פרק יד:</span> {wristCircumference} ס״מ</div>
						{/if}
						{#if customText}
							<div><span>טקסט מותאם:</span> {customText}</div>
						{/if}
					</div>
				{/if}

				{#if selectedComponent}
					<div class="selected-card">
						<div class="selected-head">
							<strong>{selectedComponent.component.name}</strong>
							<button
								type="button"
								class="close-btn"
								aria-label="סגור"
								onclick={() => (selectedPositionId = null)}
							>×</button>
						</div>
						{#if selectedComponent.component.image}
							<img
								src={imageUrl(selectedComponent.component.image)}
								alt={selectedComponent.component.name}
								class="selected-image"
								loading="lazy"
							/>
						{/if}
						<dl>
							<dt>סוג</dt>
							<dd>{typeLabel(selectedComponent.component.type)}</dd>
							{#if selectedComponent.component.color}
								<dt>צבע</dt>
								<dd>{selectedComponent.component.color}</dd>
							{/if}
							{#if selectedComponent.component.material}
								<dt>חומר</dt>
								<dd>{selectedComponent.component.material}</dd>
							{/if}
							{#if selectedComponent.component.diameter}
								<dt>קוטר</dt>
								<dd>{selectedComponent.component.diameter} ס״מ</dd>
							{/if}
							{#if selectedComponent.component.isLetterBead}
								<dt>אות</dt>
								<dd>{selectedComponent.component.letterValue ?? '—'}</dd>
							{/if}
							<dt>מחיר</dt>
							<dd>₪{selectedComponent.component.price.toFixed(2)}</dd>
							<dt>מיקום</dt>
							<dd>{selectedComponent.position.id}</dd>
						</dl>
					</div>
				{/if}

				<ul class="component-list">
					{#each placedItems as item (item.position.id)}
						{@const active = selectedPositionId === item.position.id}
						<li>
							<button
								type="button"
								class="list-row"
								class:active
								onmouseenter={() => (hoveredPositionId = item.position.id)}
								onmouseleave={() => (hoveredPositionId = null)}
								onclick={() => handlePositionClick(item.position.id)}
							>
								<span class="swatch" style:background={item.component.color || '#eee'}></span>
								<span class="row-name">
									{item.component.name}
									{#if item.component.isLetterBead && item.component.letterValue}
										<span class="letter">[{item.component.letterValue}]</span>
									{/if}
								</span>
								<span class="row-meta">
									{typeLabel(item.component.type)} · ₪{item.component.price.toFixed(2)}
								</span>
							</button>
						</li>
					{/each}
				</ul>

				{#if placedItems.length === 0}
					<p class="state">לא נמצאו רכיבים בעיצוב</p>
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.admin-canvas-card {
		background: #fff;
		border: 1px solid #ece6d5;
		border-radius: 0.85rem;
		padding: 1.1rem 1.25rem;
	}

	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
		margin: 0 0 0.85rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f3ecd9;
	}

	.card-head h2 {
		margin: 0;
		font-size: 1.05rem;
		color: #b38728;
	}

	.meta {
		font-size: 0.82rem;
		color: #888;
	}

	.state {
		padding: 1.5rem;
		text-align: center;
		color: #888;
	}

	.error {
		background: #fdecea;
		color: #b1351a;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid #f6c8bf;
	}

	.viewer {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 1rem;
		align-items: start;
	}

	.canvas-wrap {
		background: linear-gradient(135deg, #fdfcf8 0%, #fff8ec 100%);
		border: 1px solid #ece6d5;
		border-radius: 0.6rem;
		padding: 0.75rem;
		position: relative;
	}

	.canvas-svg {
		width: 100%;
		height: auto;
		display: block;
		max-height: 520px;
	}

	:global(.admin-canvas-card .template-layer) {
		pointer-events: none;
	}

	.component-marker {
		cursor: pointer;
		transition: filter 0.15s ease;
	}

	.component-marker.hovered {
		filter: drop-shadow(0 0 4px rgba(191, 149, 63, 0.6));
	}

	.component-marker.selected {
		filter: drop-shadow(0 0 6px rgba(179, 135, 40, 0.85));
	}

	.halo {
		pointer-events: none;
	}

	.hint {
		margin: 0.45rem 0 0;
		text-align: center;
		font-size: 0.78rem;
		color: #a0a0a0;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}

	.details h3 {
		margin: 0;
		font-size: 0.95rem;
		color: #b38728;
	}

	.bracelet-meta {
		background: #fdfcf8;
		border: 1px solid #f3ecd9;
		border-radius: 0.5rem;
		padding: 0.55rem 0.7rem;
		font-size: 0.88rem;
		color: #2b2b2b;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.bracelet-meta span {
		color: #888;
		margin-inline-end: 0.25rem;
	}

	.selected-card {
		border: 1px solid #ece6d5;
		border-radius: 0.6rem;
		padding: 0.75rem;
		background: #fffdf6;
	}

	.selected-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		color: #2b2b2b;
	}

	.close-btn {
		background: transparent;
		border: none;
		font-size: 1.3rem;
		line-height: 1;
		cursor: pointer;
		color: #888;
		padding: 0 0.25rem;
	}

	.close-btn:hover {
		color: #b38728;
	}

	.selected-image {
		width: 100%;
		max-height: 140px;
		object-fit: contain;
		border-radius: 0.4rem;
		margin-bottom: 0.5rem;
		background: #fff;
		border: 1px solid #f3ecd9;
	}

	.selected-card dl {
		margin: 0;
		display: grid;
		grid-template-columns: 5rem 1fr;
		gap: 0.3rem 0.6rem;
		font-size: 0.88rem;
	}

	.selected-card dt {
		color: #888;
	}

	.selected-card dd {
		margin: 0;
		color: #2b2b2b;
	}

	.component-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		max-height: 320px;
		overflow-y: auto;
	}

	.list-row {
		width: 100%;
		display: grid;
		grid-template-columns: 18px 1fr auto;
		align-items: center;
		gap: 0.5rem;
		background: #fdfcf8;
		border: 1px solid #f3ecd9;
		border-radius: 0.45rem;
		padding: 0.5rem 0.6rem;
		font-family: inherit;
		font-size: 0.88rem;
		text-align: start;
		cursor: pointer;
		color: #2b2b2b;
		min-height: 40px;
	}

	.list-row:hover {
		border-color: #bf953f;
	}

	.list-row.active {
		background: #fff7e0;
		border-color: #b38728;
	}

	.swatch {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 1px solid rgba(0, 0, 0, 0.15);
	}

	.row-name {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.letter {
		color: #b38728;
		font-weight: 700;
	}

	.row-meta {
		font-size: 0.78rem;
		color: #888;
		white-space: nowrap;
	}

	@media (max-width: 900px) {
		.viewer {
			grid-template-columns: 1fr;
		}

		.component-list {
			max-height: none;
		}
	}
</style>
