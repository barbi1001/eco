<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	interface Props {
		timestamp: Date;
		onDismiss?: () => void;
	}

	let { timestamp, onDismiss }: Props = $props();

	function formatTimestamp(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);

		if (diffMins < 1) {
			return 'לפני רגע';
		} else if (diffMins < 60) {
			return `לפני ${diffMins} דקות`;
		} else if (diffHours < 24) {
			return `לפני ${diffHours} שעות`;
		} else {
			return date.toLocaleDateString('he-IL');
		}
	}

	function handleDismiss() {
		onDismiss?.();
	}
</script>

<div class="recovery-notification" in:fly={{ y: -20, duration: 400, easing: quintOut }} out:fade={{ duration: 200 }}>
	<div class="notification-content">
		<div class="icon">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		</div>
		<div class="message">
			<p class="title">העיצוב שלך שוחזר!</p>
			<p class="subtitle">המשיכי מהמקום שבו הפסקת ({formatTimestamp(timestamp)})</p>
		</div>
		<button class="dismiss-button" onclick={handleDismiss} aria-label="סגור הודעה">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
</div>

<style>
	.recovery-notification {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		max-width: 90%;
		width: 500px;
	}

	.notification-content {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
		padding: 1rem 1.5rem;
		border-radius: 0.75rem;
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
		display: flex;
		align-items: center;
		gap: 1rem;
		animation: pulse 2s ease-in-out;
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
		}
		50% {
			box-shadow: 0 10px 35px rgba(16, 185, 129, 0.5);
		}
	}

	.icon {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
	}

	.icon svg {
		width: 100%;
		height: 100%;
	}

	.message {
		flex: 1;
		text-align: right;
	}

	.title {
		font-weight: 700;
		font-size: 1rem;
		margin: 0 0 0.25rem 0;
		font-family: 'MakabiYG', sans-serif;
	}

	.subtitle {
		font-size: 0.875rem;
		margin: 0;
		opacity: 0.95;
		font-family: 'MakabiYG', sans-serif;
	}

	.dismiss-button {
		flex-shrink: 0;
		background: rgba(255, 255, 255, 0.2);
		border: none;
		border-radius: 0.375rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		padding: 0;
	}

	.dismiss-button:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.1);
	}

	.dismiss-button svg {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.recovery-notification {
			top: 0.5rem;
			width: calc(100% - 1rem);
		}

		.notification-content {
			padding: 0.875rem 1rem;
			gap: 0.75rem;
		}

		.icon {
			width: 1.5rem;
			height: 1.5rem;
		}

		.title {
			font-size: 0.9rem;
		}

		.subtitle {
			font-size: 0.8rem;
		}

		.dismiss-button {
			width: 1.75rem;
			height: 1.75rem;
		}

		.dismiss-button svg {
			width: 1rem;
			height: 1rem;
		}
	}
</style>
