<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { JewelryTemplate, TemplatePosition, JewelryComponent } from '$lib/types/jewelry';
	import {
		designState,
		jewelryDesignerActions,
		braceletConfiguration,
		availableComponents
	} from '$lib/stores/jewelryDesigner';
	import { prepareSvgForRendering } from '$lib/utils/svgSanitizer';
	import { parseRichText } from '$lib/utils/jewelryHelpers';

	// Import bracelet-specific components
	import WristSizeSelector from './WristSizeSelector.svelte';
	import TextInputInterface from './TextInputInterface.svelte';

	interface Props {
		template: JewelryTemplate;
		onPositionSelected?: (position: TemplatePosition) => void;
	}

	let { template, onPositionSelected }: Props = $props();

	// Canvas state
	let svgContainer = $state<SVGSVGElement>();
	let hoveredPosition = $state<string | null>(null);
	let selectedPosition = $state<string | null>(null);
	let canvasWidth = 800;
	let canvasHeight = 600;

	// Active template state (allows local modification for adding beads)
	let activeTemplate = $state<JewelryTemplate>(template);

	// Parse SVG template and inject it into the canvas
	// We prioritize template.svgTemplate but fall back to activeTemplate if needed
	let templateSvgContent = $state('');

	// Bracelet-specific state
	// Derive isBracelet from the PROP 'template' to keep it stable during local mutations of activeTemplate
	let isBracelet = $derived.by(
		() => template.isBracelet === true || template.category === 'bracelet'
	);
	let showBraceletInterfaces = $state(false);

	// Get current bracelet configuration from store
	let currentBraceletConfig = $derived($braceletConfiguration);
	let currentWristSize = $derived(currentBraceletConfig?.wristCircumference || 17);
	let currentCustomText = $derived(currentBraceletConfig?.customText || '');

	// Get letter bead components (check both isLetterBead flag and name pattern)
	let letterBeadComponents = $derived.by(() => {
		const components = $availableComponents;
		const letterBeads = new Map<string, JewelryComponent>();
		components.forEach((comp) => {
			const isLetterBead =
				comp.isLetterBead ||
				(comp.name && (comp.name.endsWith('-letter') || comp.name.includes('-letter')));
			if (isLetterBead) {
				letterBeads.set(comp.id, comp);
			}
		});
		return letterBeads;
	});

	// Effect to sync prop template with activeTemplate
	$effect(() => {
		if (template.id !== activeTemplate.id) {
			activeTemplate = template;
		}
	});

	// Logic: Watch for charm diameter changes and update wrist size
	function updateWristSizeFromCharms() {
		if (!isBracelet) return;

		let previousCharmAdjustment = 0;
		// Calculate total adjustment needed based on charms/pendants > 0.7cm
		let currentAdjustment = 0;
		const selComponents = $designState.selectedComponents;

		// Check positions in the ORIGINAL template since we only add beads to activeTemplate.
		template.positions.forEach((pos) => {
			if (pos.type === 'charm' || pos.type === 'pendant') {
				const comp = selComponents.get(pos.id);
				if (comp) {
					// Default bead/pearl is 0.7cm
					const baseSize = 0.7;
					const actualSize = comp.diameter || 0.7;
					// Add the difference to the wrist size
					currentAdjustment += actualSize - baseSize;
				}
			}
		});

		// Check for significant change (avoid floating point noise)
		if (Math.abs(currentAdjustment - previousCharmAdjustment) > 0.01) {
			const diff = currentAdjustment - previousCharmAdjustment;
			previousCharmAdjustment = currentAdjustment;

			// Update the wrist size in the store
			const newSize = (currentBraceletConfig?.wristCircumference || 17) + diff;
			const roundedSize = Math.round(newSize * 10) / 10;
			jewelryDesignerActions.updateWristSize(roundedSize);
		}
	}

	// Logic: Redistribute beads along the circle based on current wrist size
	function updateBeadPositions() {
		if (!isBracelet) return;

		// Constants
		const BEAD_SIZE = 0.7;
		const CLASP_SPACE = 1.5; // cm

		// Calculate needed beads based on wrist size
		// We use currentWristSize which is derived from store.
		const neededBeads = Math.ceil((currentWristSize - CLASP_SPACE) / BEAD_SIZE);

		// Get original beads from the base template (source of truth for geometry)
		const originalBeadPositions = template.positions.filter((p) => p.type === 'bead');
		const originalCount = originalBeadPositions.length;

		// Only redistribute if we need MORE beads than original
		if (neededBeads <= originalCount) {
			if (activeTemplate.positions.length !== template.positions.length) {
				activeTemplate = template;
				// IMPORTANT: activeTemplate update triggers render, but not effects (since we removed them).
			}
			return;
		}

		// --- Circular Redistribution Logic ---

		// 1. Geometry Analysis
		const cx = 250;
		const cy = 250;

		const getAngle = (x: number, y: number) => {
			let deg = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
			if (deg < 0) deg += 360;
			return deg;
		};

		// Analyze original segments
		interface BeadInfo {
			pos: TemplatePosition;
			angle: number;
			radius: number;
			originalIndex: number;
		}
		let beads: BeadInfo[] = originalBeadPositions.map((p, i) => {
			const dx = p.x - cx;
			const dy = p.y - cy;
			return {
				pos: p,
				angle: getAngle(p.x, p.y),
				radius: Math.sqrt(dx * dx + dy * dy),
				originalIndex: i
			};
		});

		// Sort by angle
		beads.sort((a, b) => a.angle - b.angle);

		// Detect segments (gaps > 30 deg)
		const segments: BeadInfo[][] = [];
		let currentSegment: BeadInfo[] = [beads[0]];

		for (let i = 1; i < beads.length; i++) {
			const prev = beads[i - 1];
			const curr = beads[i];
			let diff = curr.angle - prev.angle;
			if (diff > 30) {
				segments.push(currentSegment);
				currentSegment = [];
			}
			currentSegment.push(curr);
		}
		segments.push(currentSegment);

		// 2. Distribute new beads
		let newPositions: TemplatePosition[] = [];
		let generatedCount = 0;

		segments.forEach((seg) => {
			if (seg.length === 0) return;

			const startAngle = seg[0].angle;
			const endAngle = seg[seg.length - 1].angle;
			const span = endAngle - startAngle;
			const avgRadius = seg.reduce((r, b) => r + b.radius, 0) / seg.length;

			// Proportion of total beads for this segment
			const segShare = seg.length / originalCount;
			const segBeadCount = Math.round(neededBeads * segShare);

			// Generate standard positions along this arc
			for (let i = 0; i < segBeadCount; i++) {
				const t = segBeadCount > 1 ? i / (segBeadCount - 1) : 0.5;
				const angleDeg = startAngle + span * t;
				const angleRad = (angleDeg * Math.PI) / 180;

				const nx = cx + avgRadius * Math.cos(angleRad);
				const ny = cy + avgRadius * Math.sin(angleRad);

				let pid = '';
				let isRequired = false;

				if (i < seg.length) {
					pid = seg[i].pos.id;
					isRequired = seg[i].pos.required;
				} else {
					generatedCount++;
					pid = `generated_bead_${generatedCount}`;
				}

				newPositions.push({
					id: pid,
					x: nx,
					y: ny,
					type: 'bead',
					size: 'medium',
					required: isRequired
				});
			}
		});

		// 3. Update Template
		const nonBeads = activeTemplate.positions.filter((p) => p.type !== 'bead');

		activeTemplate = {
			...activeTemplate,
			positions: [...nonBeads, ...newPositions]
		};
	}

	onMount(() => {
		// Initialize
		// updateWristSizeFromCharms(); // Skip for now to avoid side effect on mount without context
		updateBeadPositions();

		// Parse the SVG template
		if (activeTemplate.svgTemplate) {
			templateSvgContent = activeTemplate.svgTemplate;
		}

		// Show bracelet interfaces after a short delay for better UX
		if (isBracelet) {
			setTimeout(() => {
				showBraceletInterfaces = true;
			}, 300);
		}
	});

	// If the user changes wrist size manually, we must recalculate
	$effect(() => {
		if (currentWristSize) {
			untrack(() => updateBeadPositions());
		}
	});

	// Handle position click
	function handlePositionClick(position: TemplatePosition) {
		selectedPosition = position.id;
		onPositionSelected?.(position);
	}

	// Handle position hover
	function handlePositionHover(positionId: string | null) {
		hoveredPosition = positionId;
	}

	// Get component for a position
	function getComponentForPosition(positionId: string): JewelryComponent | undefined {
		return $designState.selectedComponents.get(positionId);
	}

	// Check if position has a component
	function hasComponent(positionId: string): boolean {
		return $designState.selectedComponents.has(positionId);
	}

	// Get position marker color based on state
	function getMarkerColor(position: TemplatePosition): string {
		if (hasComponent(position.id)) {
			return '#10b981'; // Green for filled
		} else if (position.required) {
			return '#ef4444'; // Red for required empty
		} else {
			return '#BF953F'; // Gold for optional empty
		}
	}

	// Get position marker size based on position size
	function getMarkerSize(position: TemplatePosition): number {
		switch (position.size) {
			case 'small':
				return 8;
			case 'medium':
				return 12;
			case 'large':
				return 16;
			default:
				return 12;
		}
	}

	// Handle wrist size change for bracelets
	function handleWristSizeChange(size: number) {
		jewelryDesignerActions.updateWristSize(size);
	}

	// Handle text input change for bracelets (only updates local state, not store)
	let pendingText = $state('');
	let isTextInputFocused = $state(false);
	let lastAppliedText = $state('');

	// Initialize pendingText with current value from store (only on mount or when store changes externally)
	$effect(() => {
		const currentText = $braceletConfiguration?.customText || '';
		// Only sync if:
		// 1. pendingText is empty (initial load)
		// 2. Input is not focused
		// 3. Store text changed externally (not by our apply action)
		if (
			!isTextInputFocused &&
			(pendingText === '' || (currentText !== pendingText && currentText !== lastAppliedText))
		) {
			pendingText = currentText;
		}
	});

	function handleTextInput(text: string) {
		pendingText = text;
	}

	function handleTextFocus() {
		isTextInputFocused = true;
	}

	function handleTextBlur() {
		// Don't reset focus immediately on blur - wait a bit to allow button clicks
		setTimeout(() => {
			isTextInputFocused = false;
		}, 200);
	}

	// Apply text changes to store and create letter beads
	function handleApplyText() {
		const currentText = $braceletConfiguration?.customText || '';
		if (pendingText !== currentText) {
			lastAppliedText = pendingText;
			jewelryDesignerActions.updateCustomText(pendingText);
			// Create letter beads automatically
			jewelryDesignerActions.createLetterBeadsFromText(pendingText);
		}
		isTextInputFocused = false;
	}
</script>

<div class="design-canvas-container">
	<div class="canvas-header">
		<h2>{activeTemplate.name}</h2>
		<p class="template-description">
			{parseRichText(activeTemplate.description) || 'התאימי את התכשיט שלך'}
		</p>

		{#if isBracelet}
			<div class="bracelet-badge">
				<span class="bracelet-icon">📿</span>
				<span class="bracelet-text">צמיד מותאם אישית</span>
			</div>
		{/if}
	</div>

	<!-- Bracelet-specific interfaces -->
	{#if isBracelet && showBraceletInterfaces}
		<div class="bracelet-interfaces" in:fade={{ duration: 400, delay: 100 }}>
			<div class="bracelet-section">
				<h3 class="section-title">מידת היד</h3>
				<WristSizeSelector selectedSize={currentWristSize} onSizeChange={handleWristSizeChange} />
			</div>

			<div class="bracelet-section">
				<h3 class="section-title">טקסט אישי (אופציונלי)</h3>
				<TextInputInterface
					customText={pendingText}
					{letterBeadComponents}
					onTextChange={handleTextInput}
					onApply={handleApplyText}
					onFocus={handleTextFocus}
					onBlur={handleTextBlur}
				/>
			</div>
		</div>
	{/if}

	<div class="canvas-wrapper">
		<svg
			bind:this={svgContainer}
			class="design-canvas"
			viewBox="0 0 {canvasWidth} {canvasHeight}"
			xmlns="http://www.w3.org/2000/svg"
		>
			<!-- Background -->
			<rect width="100%" height="100%" fill="#ffffff" />

			<!-- Template SVG Content -->
			{#if templateSvgContent}
				<g class="template-layer">
					{@html prepareSvgForRendering(templateSvgContent)}
				</g>
			{/if}

			<!-- Component Layer - Render selected components -->
			<g class="components-layer">
				{#each activeTemplate.positions as position}
					{@const hasText = currentCustomText && currentCustomText.trim().length > 0}
					{@const isCenterPendant = position.id === 'pendant_center'}
					{@const shouldHide = hasText && isCenterPendant}
					{#if !shouldHide}
						{@const component = getComponentForPosition(position.id)}
						{#if component && component.svgElement}
							<g
								transform="translate({position.x}, {position.y})"
								class="component-element"
								in:scale={{ duration: 300, easing: quintOut }}
							>
								{@html prepareSvgForRendering(component.svgElement)}
							</g>
						{/if}
					{/if}
				{/each}
			</g>

			<!-- Position Markers Layer -->
			<g class="positions-layer">
				{#each activeTemplate.positions as position}
					{@const hasText = currentCustomText && currentCustomText.trim().length > 0}
					{@const isCenterPendant = position.id === 'pendant_center'}
					{@const shouldHide = hasText && isCenterPendant}
					{#if !shouldHide}
						{@const markerSize = getMarkerSize(position)}
						{@const markerColor = getMarkerColor(position)}
						{@const isHovered = hoveredPosition === position.id}
						{@const isSelected = selectedPosition === position.id}

						<g
							class="position-marker"
							class:hovered={isHovered}
							class:selected={isSelected}
							class:filled={hasComponent(position.id)}
							transform="translate({position.x}, {position.y})"
							onclick={() => handlePositionClick(position)}
							onkeydown={(e) => e.key === 'Enter' && handlePositionClick(position)}
							onmouseenter={() => handlePositionHover(position.id)}
							onmouseleave={() => handlePositionHover(null)}
							role="button"
							tabindex="0"
							aria-label="מיקום {position.type} - {hasComponent(position.id) ? 'ממולא' : 'ריק'}"
						>
							<!-- Outer glow for hover effect -->
							{#if isHovered || isSelected}
								<circle
									r={markerSize + 6}
									fill={markerColor}
									opacity="0.2"
									in:scale={{ duration: 200 }}
								/>
							{/if}

							<!-- Main marker circle -->
							<circle
								r={markerSize}
								fill={markerColor}
								stroke="white"
								stroke-width="2"
								class="marker-circle"
							/>

							<!-- Pulse animation for empty required positions -->
							{#if position.required && !hasComponent(position.id)}
								<circle
									r={markerSize}
									fill="none"
									stroke={markerColor}
									stroke-width="2"
									opacity="0.6"
									class="pulse-ring"
								/>
							{/if}

							<!-- Icon based on position type -->
							<text
								x="0"
								y="0"
								text-anchor="middle"
								dominant-baseline="central"
								fill="white"
								font-size={markerSize}
								font-weight="bold"
								pointer-events="none"
							>
								{#if hasComponent(position.id)}
									✓
								{:else if position.type === 'bead'}
									●
								{:else if position.type === 'charm'}
									★
								{:else if position.type === 'pendant'}
									◆
								{:else}
									○
								{/if}
							</text>
						</g>
					{/if}
				{/each}
			</g>
		</svg>

		<!-- Legend -->
		<div class="canvas-legend">
			<div class="legend-item">
				<div class="legend-marker" style="background-color: #10b981;"></div>
				<span>ממולא</span>
			</div>
			<div class="legend-item">
				<div class="legend-marker" style="background-color: #ef4444;"></div>
				<span>נדרש</span>
			</div>
			<div class="legend-item">
				<div class="legend-marker" style="background-color: #BF953F;"></div>
				<span>אופציונלי</span>
			</div>
		</div>
	</div>

	<!-- Instructions -->
	<div class="canvas-instructions">
		{#if isBracelet}
			<p>הגדירי את מידת היד והטקסט הרצוי, ולאחר מכן לחצי על נקודות המיקום להוספת חרוזים</p>
		{:else}
			<p>לחצי על נקודות המיקום להוספת רכיבים לתכשיט שלך</p>
		{/if}
	</div>
</div>

<style>
	.design-canvas-container {
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
	}

	.canvas-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.canvas-header h2 {
		font-family: 'MakabiYG', sans-serif;
		font-size: 2rem;
		margin-bottom: 0.5rem;
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.template-description {
		color: #6b7280;
		font-size: 1rem;
	}

	.bracelet-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, #8b5cf6, #a855f7);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'MakabiYG', sans-serif;
		margin-top: 0.5rem;
		box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
	}

	.bracelet-icon {
		font-size: 1rem;
	}

	.bracelet-text {
		font-size: 0.875rem;
	}

	/* Bracelet-specific interfaces */
	.bracelet-interfaces {
		background: linear-gradient(135deg, #f3e8ff, #ede9fe);
		border: 2px solid #c4b5fd;
		border-radius: 1rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.bracelet-section {
		background: white;
		padding: 1rem;
		border-radius: 0.75rem;
		box-shadow: 0 2px 4px rgba(139, 92, 246, 0.1);
	}

	.section-title {
		font-family: 'MakabiYG', sans-serif;
		font-size: 1.125rem;
		font-weight: 600;
		color: #7c3aed;
		margin-bottom: 1rem;
		text-align: center;
	}

	.canvas-wrapper {
		background: white;
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		border: 2px solid #f3e8ff;
		position: relative;
	}

	.design-canvas {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 0.5rem;
		background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
		/* Optimize SVG rendering performance */
		will-change: transform;
		transform: translateZ(0);
	}

	:global(.design-canvas .template-layer) {
		pointer-events: none;
	}

	:global(.design-canvas .component-element) {
		pointer-events: none;
	}

	.position-marker {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.position-marker:hover .marker-circle,
	.position-marker.hovered .marker-circle {
		filter: brightness(1.2);
		transform: scale(1.2);
	}

	.position-marker.selected .marker-circle {
		stroke-width: 3;
		filter: drop-shadow(0 0 8px currentColor);
	}

	.position-marker:focus {
		outline: none;
	}

	.position-marker:focus .marker-circle {
		stroke: #3b82f6;
		stroke-width: 3;
	}

	.marker-circle {
		transition: all 0.2s ease;
	}

	.pulse-ring {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 0;
			transform: scale(1.8);
		}
	}

	.canvas-legend {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.legend-marker {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid white;
	}

	.canvas-instructions {
		text-align: center;
		margin-top: 1rem;
		padding: 0.75rem;
		background: linear-gradient(to right, rgba(191, 149, 63, 0.1), rgba(252, 246, 186, 0.1));
		border-radius: 0.5rem;
		color: #6b7280;
		font-size: 0.95rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.design-canvas-container {
			padding: 0.5rem;
		}

		.canvas-header h2 {
			font-size: 1.5rem;
		}

		.bracelet-badge {
			padding: 0.375rem 0.75rem;
			font-size: 0.75rem;
		}

		.bracelet-icon {
			font-size: 0.875rem;
		}

		.bracelet-text {
			font-size: 0.75rem;
		}

		.bracelet-interfaces {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1rem;
			margin-bottom: 1.5rem;
		}

		.bracelet-section {
			padding: 0.75rem;
		}

		.section-title {
			font-size: 1rem;
			margin-bottom: 0.75rem;
		}

		.canvas-wrapper {
			padding: 0.75rem;
		}

		.design-canvas {
			/* Improve touch target sizes on mobile */
			touch-action: manipulation;
		}

		.position-marker {
			/* Increase touch target size */
			cursor: pointer;
		}

		/* Larger markers for easier touch interaction */
		:global(.design-canvas .position-marker circle) {
			r: 14;
		}

		.canvas-legend {
			flex-wrap: wrap;
			gap: 0.75rem;
			justify-content: space-around;
		}

		.legend-item {
			font-size: 0.8rem;
		}

		.canvas-instructions {
			font-size: 0.875rem;
			padding: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.canvas-header h2 {
			font-size: 1.25rem;
		}

		.template-description {
			font-size: 0.9rem;
		}

		.bracelet-badge {
			padding: 0.25rem 0.5rem;
			font-size: 0.625rem;
		}

		.bracelet-interfaces {
			padding: 0.75rem;
			margin-bottom: 1rem;
		}

		.bracelet-section {
			padding: 0.5rem;
		}

		.section-title {
			font-size: 0.875rem;
			margin-bottom: 0.5rem;
		}

		.canvas-wrapper {
			padding: 0.5rem;
		}

		.canvas-legend {
			gap: 0.5rem;
		}

		.legend-item {
			font-size: 0.75rem;
		}

		.legend-marker {
			width: 10px;
			height: 10px;
		}
	}
</style>
