<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// Import stores and types
	import {
		availableTemplates,
		isLoadingTemplates,
		jewelryDesignerActions
	} from '$lib/stores/jewelryDesigner';
	import type { JewelryTemplate, JewelryDesignerError } from '$lib/types/jewelry';

	// Import API and components
	import { templatesApi } from '$lib/api/strapiClient';
	import { parseRichText } from '$lib/utils/jewelryHelpers';
	import SkeletonLoader from './SkeletonLoader.svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	// Component props
	interface Props {
		onTemplateSelect?: (template: JewelryTemplate) => void;
		onError?: (error: JewelryDesignerError) => void;
	}

	let { onTemplateSelect, onError }: Props = $props();

	// Component state
	let loadingError = $state<JewelryDesignerError | null>(null);
	let retryCount = $state(0);
	let maxRetries = 3;
	let selectedCategory = $state<string>('all');

	// Filtered templates based on category selection
	let filteredTemplates = $derived(
		selectedCategory === 'all'
			? $availableTemplates
			: $availableTemplates.filter((template) => template.category === selectedCategory)
	);
	$effect(() => {
		console.log($availableTemplates);
	});
	// Load templates on mount
	onMount(() => {
		loadTemplates();
	});

	/**
	 * Load templates from Strapi with error handling
	 */
	async function loadTemplates() {
		loadingError = null;
		isLoadingTemplates.set(true);

		try {
			const templates = await templatesApi.getAll();

			if (templates.length === 0) {
				throw new Error('לא נמצאו תבניות זמינות כרגע');
			}

			availableTemplates.set(templates);
			retryCount = 0; // Reset retry count on success
		} catch (error) {
			console.error('Failed to load templates:', error);

			const jewelryError: JewelryDesignerError = {
				type: 'network',
				message: getErrorMessage(error),
				details: {
					originalError: error,
					retryCount,
					timestamp: new Date().toISOString()
				}
			};

			loadingError = jewelryError;
			onError?.(jewelryError);
		} finally {
			isLoadingTemplates.set(false);
		}
	}

	/**
	 * Get user-friendly error message
	 */
	function getErrorMessage(error: any): string {
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return 'בעיית חיבור לאינטרנט. אנא בדקי את החיבור ונסי שוב.';
		}

		if (error.message?.includes('404')) {
			return 'השירות אינו זמין כרגע. אנא נסי שוב מאוחר יותר.';
		}

		if (error.message?.includes('500')) {
			return 'שגיאת שרת. אנא נסי שוב בעוד כמה רגעים.';
		}

		if (typeof error.message === 'string') {
			return error.message;
		}

		return 'אירעה שגיאה בטעינת התבניות. אנא נסי שוב.';
	}

	/**
	 * Handle template selection
	 */
	function handleTemplateSelect(template: JewelryTemplate) {
		jewelryDesignerActions.selectTemplate(template);
		onTemplateSelect?.(template);
	}

	/**
	 * Handle retry button click
	 */
	function handleRetry() {
		if (retryCount < maxRetries) {
			retryCount++;
			loadTemplates();
		} else {
			const maxRetriesError: JewelryDesignerError = {
				type: 'network',
				message: 'מספר הניסיונות המקסימלי הושג. אנא רענני את הדף ונסי שוב.',
				details: { maxRetries, retryCount }
			};

			loadingError = maxRetriesError;
			onError?.(maxRetriesError);
		}
	}

	/**
	 * Format price for display
	 */
	function formatPrice(price: number): string {
		return `₪${price.toLocaleString('he-IL')}`;
	}

	/**
	 * Get category display name in Hebrew
	 */
	function getCategoryName(category: string): string {
		const categoryNames: Record<string, string> = {
			necklace: 'שרשרת',
			earrings: 'עגילים',
			bracelet: 'צמיד',
			ring: 'טבעת'
		};

		return categoryNames[category] || category;
	}

	/**
	 * Get available categories from templates
	 */
	function getAvailableCategories(): Array<{ value: string; label: string; count: number }> {
		const categories = [{ value: 'all', label: 'הכל', count: $availableTemplates.length }];

		const categoryCounts: Record<string, number> = {};
		$availableTemplates.forEach((template) => {
			categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
		});

		Object.entries(categoryCounts).forEach(([category, count]) => {
			categories.push({
				value: category,
				label: getCategoryName(category),
				count
			});
		});

		return categories;
	}

	/**
	 * Check if template is a bracelet
	 */
	function isBraceletTemplate(template: JewelryTemplate): boolean {
		return template.isBracelet === true || template.category === 'bracelet';
	}

	/**
	 * Get bracelet-specific preview information
	 */
	function getBraceletInfo(template: JewelryTemplate): string | null {
		if (!isBraceletTemplate(template)) return null;

		// Count bead positions for bracelet preview
		const beadPositions = template.positions.filter((pos) => pos.type === 'bead').length;
		if (beadPositions > 0) {
			return `מתאים עד ${beadPositions} חרוזים`;
		}

		return 'צמיד מותאם אישית';
	}
</script>

<div class="template-gallery-container" dir="rtl">
	<div class="gallery-header">
		<h2 class="gallery-title">בחירת תבנית</h2>
		<p class="gallery-subtitle">בחרי תבנית בסיס לתכשיט שלך</p>
	</div>

	<!-- Category Filter -->
	{#if $availableTemplates.length > 0}
		<div class="category-filter" in:fly={{ y: -20, duration: 400, easing: quintOut }}>
			<div class="filter-buttons">
				{#each getAvailableCategories() as category}
					<button
						class="filter-button {selectedCategory === category.value ? 'active' : ''}"
						onclick={() => (selectedCategory = category.value)}
					>
						{category.label}
						<span class="category-count">({category.count})</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="gallery-content">
		{#if $isLoadingTemplates}
			<!-- Loading State with Skeleton Loaders -->
			<div class="loading-state" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
				<div class="templates-grid">
					<SkeletonLoader
						count={6}
						type="template"
						className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
					/>
				</div>
				<div class="loading-text">
					<div class="loading-spinner"></div>
					<p>טוען תבניות...</p>
				</div>
			</div>
		{:else if loadingError}
			<!-- Error State -->
			<div
				class="error-state"
				in:fly={{ y: 20, duration: 400, easing: quintOut }}
				out:fade={{ duration: 300 }}
			>
				<ErrorMessage
					error={loadingError}
					showRetry={retryCount < maxRetries}
					showDetails={false}
					onRetry={handleRetry}
					onDismiss={() => (loadingError = null)}
				/>

				{#if retryCount >= maxRetries}
					<div class="max-retries-message">
						<p>נסי לרענן את הדף או לחזור מאוחר יותר</p>
						<button class="refresh-button" onclick={() => window.location.reload()}>
							רענן דף
						</button>
					</div>
				{/if}
			</div>
		{:else if $availableTemplates.length === 0}
			<!-- Empty State -->
			<div class="empty-state" in:fly={{ y: 20, duration: 400, easing: quintOut }}>
				<div class="empty-icon">🎨</div>
				<h3>אין תבניות זמינות</h3>
				<p>כרגע אין תבניות זמינות. אנא נסי שוב מאוחר יותר.</p>
				<button class="retry-button" onclick={() => loadTemplates()}> נסה שוב </button>
			</div>
		{:else}
			<!-- Templates Grid -->
			<div class="templates-grid" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
				{#each filteredTemplates as template, index}
					<div
						class="template-card {isBraceletTemplate(template) ? 'bracelet-template' : ''}"
						in:fly={{
							y: 30,
							duration: 400,
							delay: index * 100,
							easing: quintOut
						}}
						out:fade={{ duration: 200 }}
					>
						<div class="template-image-container">
							{#if isBraceletTemplate(template)}
								<div class="bracelet-badge">
									<span class="bracelet-icon">📿</span>
									<span class="bracelet-text">צמיד</span>
								</div>
							{/if}

							<img
								src={template.previewImage}
								alt={template.name}
								class="template-image"
								loading="lazy"
								decoding="async"
								onerror={(e) => {
									// Handle image loading errors
									const target = e.currentTarget as HTMLImageElement;
									target.src = '/images/placeholder-jewelry.svg';
								}}
							/>
							<div class="template-overlay">
								<button class="select-button" onclick={() => handleTemplateSelect(template)}>
									בחירת תבנית זו
								</button>
							</div>
						</div>

						<div class="template-info">
							<h3 class="template-name">{template.name}</h3>
							<p class="template-category">{getCategoryName(template.category)}</p>

							{#if isBraceletTemplate(template)}
								<div class="bracelet-info">
									<span class="bracelet-info-icon">ℹ️</span>
									<span class="bracelet-info-text">{getBraceletInfo(template)}</span>
								</div>
							{/if}

							<div class="template-price">
								<span class="price-label">מחיר בסיס:</span>
								<span class="price-value">{formatPrice(template.basePrice)}</span>
							</div>

							{#if template.description}
								<p class="template-description">{parseRichText(template.description)}</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* ===== Color Variables ===== */
	/* Pink palette from site: deep rose #C2185B, hot pink #E91E8C, light pink #FCE4EC */
	/* Gold palette: #BF953F, #FCF6BA, #B38728 */

	.template-gallery-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background: linear-gradient(160deg, #fff0f5 0%, #fde8f0 50%, #fff8e7 100%);
		border-radius: 1.5rem;
	}

	/* ===== Header ===== */
	.gallery-header {
		text-align: center;
		margin-bottom: 2.5rem;
		position: relative;
		padding-bottom: 1.5rem;
	}

	.gallery-header::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 120px;
		height: 2px;
		background: linear-gradient(to right, transparent, #bf953f, #e91e8c, #bf953f, transparent);
		border-radius: 1px;
	}

	.gallery-title {
		font-family: 'MakabiYG', sans-serif;
		font-size: 2.5rem;
		font-weight: bold;
		background: linear-gradient(135deg, #c2185b 0%, #e91e8c 40%, #bf953f 70%, #fcf6ba 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
		letter-spacing: 0.05em;
	}

	.gallery-subtitle {
		font-size: 1.1rem;
		color: #9d4f6e;
		font-family: 'MakabiYG', sans-serif;
		letter-spacing: 0.03em;
	}

	.gallery-content {
		width: 100%;
	}

	/* ===== Category Filter ===== */
	.category-filter {
		margin-bottom: 2rem;
		display: flex;
		justify-content: center;
	}

	.filter-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 3rem;
		border: 1px solid rgba(194, 24, 91, 0.15);
		box-shadow: 0 2px 12px rgba(194, 24, 91, 0.08);
		backdrop-filter: blur(4px);
	}

	.filter-button {
		background: transparent;
		border: 1.5px solid rgba(194, 24, 91, 0.25);
		color: #9d4f6e;
		padding: 0.4rem 1rem;
		border-radius: 2rem;
		cursor: pointer;
		font-family: 'MakabiYG', sans-serif;
		font-size: 0.875rem;
		transition: all 0.25s ease;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.filter-button:hover {
		border-color: #e91e8c;
		color: #c2185b;
		background: rgba(233, 30, 140, 0.06);
	}

	.filter-button.active {
		background: linear-gradient(135deg, #e91e8c, #c2185b);
		border-color: transparent;
		color: white;
		font-weight: 600;
		box-shadow: 0 3px 10px rgba(194, 24, 91, 0.35);
	}

	.category-count {
		font-size: 0.7rem;
		opacity: 0.8;
	}

	/* ===== Loading State ===== */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.loading-text {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #9d4f6e;
		font-family: 'MakabiYG', sans-serif;
	}

	.loading-spinner {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid #fce4ec;
		border-top: 2px solid #e91e8c;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* ===== Error State ===== */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.max-retries-message {
		text-align: center;
		padding: 1.5rem;
		background: #fff0f5;
		border: 1px solid #f48fb1;
		border-radius: 0.75rem;
		color: #880e4f;
	}

	.max-retries-message p {
		margin-bottom: 1rem;
		font-family: 'MakabiYG', sans-serif;
	}

	.refresh-button {
		background: linear-gradient(135deg, #e91e8c, #c2185b);
		color: white;
		font-weight: 600;
		padding: 0.5rem 1.5rem;
		border: none;
		border-radius: 2rem;
		cursor: pointer;
		font-family: 'MakabiYG', sans-serif;
		transition: all 0.3s ease;
		box-shadow: 0 3px 10px rgba(194, 24, 91, 0.3);
	}

	.refresh-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(194, 24, 91, 0.4);
	}

	/* ===== Empty State ===== */
	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #9d4f6e;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #c2185b;
		font-family: 'MakabiYG', sans-serif;
	}

	.empty-state p {
		font-size: 1rem;
		margin-bottom: 2rem;
		font-family: 'MakabiYG', sans-serif;
	}

	.retry-button {
		background: linear-gradient(135deg, #e91e8c, #c2185b);
		color: white;
		font-weight: 600;
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 2rem;
		cursor: pointer;
		font-family: 'MakabiYG', sans-serif;
		transition: all 0.3s ease;
		box-shadow: 0 3px 10px rgba(194, 24, 91, 0.3);
	}

	.retry-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(194, 24, 91, 0.4);
	}

	/* ===== Templates Grid ===== */
	.templates-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.75rem;
		width: 100%;
	}

	.template-card {
		background: white;
		border-radius: 1.25rem;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(194, 24, 91, 0.08);
		border: 1.5px solid rgba(244, 143, 177, 0.3);
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
	}

	.template-card::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 1.25rem;
		background: linear-gradient(135deg, rgba(233, 30, 140, 0.03), rgba(191, 149, 63, 0.03));
		pointer-events: none;
		z-index: 0;
	}

	.template-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 16px 40px rgba(194, 24, 91, 0.18);
		border-color: #e91e8c;
	}

	/* Bracelet-specific styling */
	.template-card.bracelet-template {
		border-color: rgba(191, 149, 63, 0.4);
	}

	.template-card.bracelet-template:hover {
		border-color: #bf953f;
		box-shadow: 0 16px 40px rgba(191, 149, 63, 0.2);
	}

	.bracelet-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728);
		color: #5a3e00;
		padding: 0.25rem 0.6rem;
		border-radius: 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		font-family: 'MakabiYG', sans-serif;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		z-index: 10;
		box-shadow: 0 2px 8px rgba(191, 149, 63, 0.4);
	}

	.bracelet-icon {
		font-size: 0.875rem;
	}

	.bracelet-text {
		font-size: 0.75rem;
	}

	.template-image-container {
		position: relative;
		width: 100%;
		height: 210px;
		overflow: hidden;
	}

	/* Pink-tinted top border on image container */
	.template-image-container::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(to right, #e91e8c, #bf953f, #e91e8c);
		z-index: 5;
	}

	.template-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
		image-rendering: -webkit-optimize-contrast;
		image-rendering: crisp-edges;
	}

	.template-image[loading='lazy'] {
		background: linear-gradient(90deg, #fce4ec 25%, #f8bbd9 50%, #fce4ec 75%);
		background-size: 200% 100%;
		animation: imageShimmer 1.5s infinite;
	}

	@keyframes imageShimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.template-card:hover .template-image {
		transform: scale(1.06);
	}

	.template-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(160deg, rgba(194, 24, 91, 0.75), rgba(100, 20, 50, 0.85));
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 4;
	}

	.template-card:hover .template-overlay {
		opacity: 1;
	}

	.select-button {
		background: linear-gradient(135deg, #fcf6ba, #bf953f);
		color: #5a3e00;
		font-weight: 700;
		padding: 0.75rem 1.75rem;
		border: none;
		border-radius: 2rem;
		cursor: pointer;
		font-family: 'MakabiYG', sans-serif;
		font-size: 0.95rem;
		transform: translateY(12px);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
		letter-spacing: 0.03em;
	}

	.template-card:hover .select-button {
		transform: translateY(0);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.select-button:hover {
		background: linear-gradient(135deg, #fcf6ba, #d4a017);
	}

	/* ===== Card Info Section ===== */
	.template-info {
		padding: 1.25rem 1.5rem 1.5rem;
		background: linear-gradient(180deg, white 0%, #fff8fb 100%);
		position: relative;
		z-index: 1;
	}

	.template-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: #880e4f;
		margin-bottom: 0.25rem;
		font-family: 'MakabiYG', sans-serif;
		letter-spacing: 0.02em;
	}

	.template-category {
		font-size: 0.8rem;
		color: #c2185b;
		margin-bottom: 1rem;
		font-family: 'MakabiYG', sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.8;
	}

	.bracelet-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(135deg, #fff8e1, #fff3e0);
		border-radius: 0.5rem;
		border: 1px solid rgba(191, 149, 63, 0.3);
	}

	.bracelet-info-icon {
		font-size: 0.875rem;
	}

	.bracelet-info-text {
		font-size: 0.8rem;
		color: #7a5500;
		font-weight: 500;
		font-family: 'MakabiYG', sans-serif;
	}

	.template-price {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(135deg, #fff0f5, #fce4ec);
		border-radius: 0.5rem;
		border: 1px solid rgba(194, 24, 91, 0.12);
	}

	.price-label {
		font-size: 0.8rem;
		color: #9d4f6e;
		font-family: 'MakabiYG', sans-serif;
	}

	.price-value {
		font-size: 1.05rem;
		font-weight: 700;
		background: linear-gradient(135deg, #c2185b, #e91e8c);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		font-family: 'MakabiYG', sans-serif;
	}

	.template-description {
		font-size: 0.8rem;
		color: #9d4f6e;
		line-height: 1.5;
		font-family: 'MakabiYG', sans-serif;
		opacity: 0.85;
	}

	/* ===== Responsive Design ===== */
	@media (max-width: 768px) {
		.template-gallery-container {
			padding: 1rem;
			border-radius: 1rem;
		}

		.gallery-title {
			font-size: 2rem;
		}

		.gallery-subtitle {
			font-size: 0.95rem;
		}

		.category-filter {
			margin-bottom: 1.5rem;
		}

		.filter-buttons {
			gap: 0.25rem;
			padding: 0.5rem 0.75rem;
		}

		.filter-button {
			padding: 0.35rem 0.75rem;
			font-size: 0.75rem;
		}

		.templates-grid {
			grid-template-columns: 1fr;
			gap: 1.25rem;
		}

		.template-image-container {
			height: 180px;
		}

		.template-info {
			padding: 1rem 1.25rem 1.25rem;
		}

		.template-overlay {
			opacity: 1;
			background: linear-gradient(160deg, rgba(194, 24, 91, 0.55), rgba(100, 20, 50, 0.65));
		}

		.select-button {
			transform: translateY(0);
		}

		.bracelet-badge {
			top: 0.25rem;
			right: 0.25rem;
			padding: 0.15rem 0.4rem;
			font-size: 0.625rem;
		}

		.bracelet-icon {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.gallery-header {
			margin-bottom: 1.75rem;
		}

		.gallery-title {
			font-size: 1.75rem;
		}

		.template-image-container {
			height: 160px;
		}
	}
</style>
