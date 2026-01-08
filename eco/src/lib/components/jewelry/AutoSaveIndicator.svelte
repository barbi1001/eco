<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { jewelryDesignerActions } from '$lib/stores/jewelryDesigner';

	let lastSaveTime: Date | null = null;
	let showIndicator = false;
	let saveStatus: 'saving' | 'saved' | 'idle' = 'idle';
	let checkInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		// Check for last save time periodically
		checkInterval = setInterval(() => {
			const savedTime = jewelryDesignerActions.getLastSaveTime();
			if (savedTime && savedTime !== lastSaveTime) {
				lastSaveTime = savedTime;
				saveStatus = 'saved';
				showIndicator = true;
				
				// Hide after 3 seconds
				setTimeout(() => {
					showIndicator = false;
				}, 3000);
			}
		}, 1000);
	});

	onDestroy(() => {
		if (checkInterval) {
			clearInterval(checkInterval);
		}
	});

	function formatLastSave(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSecs = Math.floor(diffMs / 1000);

		if (diffSecs < 5) {
			return 'נשמר כעת';
		} else if (diffSecs < 60) {
			return `נשמר לפני ${diffSecs} שניות`;
		} else {
			const diffMins = Math.floor(diffSecs / 60);
			return `נשמר לפני ${diffMins} דקות`;
		}
	}
</script>

{#if showIndicator && lastSaveTime}
	<div class="auto-save-indicator" transition:fade={{ duration: 200 }}>
		<div class="indicator-content">
			{#if saveStatus === 'saving'}
				<div class="spinner"></div>
				<span>שומר...</span>
			{:else if saveStatus === 'saved'}
				<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
				</svg>
				<span>{formatLastSave(lastSaveTime)}</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	.auto-save-indicator {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		z-index: 100;
		pointer-events: none;
	}

	.indicator-content {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
		font-family: 'MakabiYG', sans-serif;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid #e5e7eb;
		border-top: 2px solid #bf953f;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.check-icon {
		width: 1rem;
		height: 1rem;
		color: #10b981;
		animation: checkmark 0.3s ease-in-out;
	}

	@keyframes checkmark {
		0% {
			transform: scale(0);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.auto-save-indicator {
			bottom: 0.5rem;
			left: 0.5rem;
		}

		.indicator-content {
			padding: 0.375rem 0.75rem;
			font-size: 0.8rem;
		}

		.spinner,
		.check-icon {
			width: 0.875rem;
			height: 0.875rem;
		}
	}
</style>
