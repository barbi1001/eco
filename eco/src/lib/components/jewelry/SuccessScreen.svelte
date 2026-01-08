<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Check } from 'lucide-svelte';
	import HeartButton from '$lib/ui/heartButton.svelte';

	interface SuccessScreenProps {
		onRestart?: () => void;
		onGoHome?: () => void;
	}

	let { onRestart, onGoHome }: SuccessScreenProps = $props();
</script>

<div class="success-screen-container" in:fade={{ duration: 300 }}>
	<div class="success-content" in:scale={{ duration: 600, easing: quintOut, delay: 200 }}>
		<!-- Success Icon -->
		<div class="success-icon-wrapper">
			<div class="success-icon">
				<Check size={64} strokeWidth={3} />
			</div>
		</div>

		<!-- Success Message -->
		<h1 class="success-title">ההזמנה נשלחה בהצלחה!</h1>

		<p class="success-message">
			תודה שבחרת ליצור תכשיט מותאם אישית איתנו! 💎
			<br />
			<br />
			קיבלנו את פרטי העיצוב שלך ונחזור אלייך בהקדם לתיאום פרטים נוספים.
			<br />
			<br />
			ההזמנה שלך חשובה לנו ואנחנו כבר מתחילים לעבוד על התכשיט המושלם עבורך!
		</p>

		<!-- Decorative Elements -->
		<div class="sparkles">
			<div class="sparkle sparkle-1">✨</div>
			<div class="sparkle sparkle-2">💫</div>
			<div class="sparkle sparkle-3">⭐</div>
			<div class="sparkle sparkle-4">✨</div>
			<div class="sparkle sparkle-5">💫</div>
		</div>

		<!-- Action Buttons -->
		<div class="action-buttons">
			{#if onRestart}
				<button class="primary-button" onclick={onRestart}>
					<span>עיצוב תכשיט נוסף</span>
				</button>
			{/if}

			{#if onGoHome}
				<button class="secondary-button" onclick={onGoHome}>
					<HeartButton text="חזרה לדף הבית" className="text-gray-700" />
				</button>
			{/if}
		</div>

		<!-- Contact Info -->
		<div class="contact-info">
			<p>יש שאלות? ניתן ליצור קשר:</p>
			<div class="contact-methods">
				<a href="https://wa.me/972123456789" target="_blank" rel="noopener noreferrer" class="contact-link">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
					</svg>
					<span>WhatsApp</span>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.success-screen-container {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
	}

	.success-content {
		max-width: 600px;
		width: 100%;
		background: white;
		border-radius: 1.5rem;
		padding: 3rem 2rem;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
		border: 2px solid #f3e8ff;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.success-icon-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.success-icon {
		width: 120px;
		height: 120px;
		background: linear-gradient(135deg, #4ade80, #22c55e);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		animation: successPulse 2s ease-in-out infinite;
		box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
	}

	@keyframes successPulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 15px 40px rgba(34, 197, 94, 0.4);
		}
	}

	.success-title {
		font-family: 'MakabiYG', sans-serif;
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-shadow: 0 2px 10px rgba(191, 149, 63, 0.2);
	}

	.success-message {
		font-size: 1.1rem;
		line-height: 1.8;
		color: #6b7280;
		margin-bottom: 2.5rem;
	}

	.sparkles {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.sparkle {
		position: absolute;
		font-size: 2rem;
		animation: sparkleFloat 3s ease-in-out infinite;
		opacity: 0;
	}

	.sparkle-1 {
		top: 10%;
		left: 10%;
		animation-delay: 0s;
	}

	.sparkle-2 {
		top: 20%;
		right: 15%;
		animation-delay: 0.5s;
	}

	.sparkle-3 {
		bottom: 30%;
		left: 15%;
		animation-delay: 1s;
	}

	.sparkle-4 {
		bottom: 20%;
		right: 10%;
		animation-delay: 1.5s;
	}

	.sparkle-5 {
		top: 50%;
		left: 50%;
		animation-delay: 2s;
	}

	@keyframes sparkleFloat {
		0%,
		100% {
			opacity: 0;
			transform: translateY(0) rotate(0deg);
		}
		50% {
			opacity: 1;
			transform: translateY(-20px) rotate(180deg);
		}
	}

	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.primary-button,
	.secondary-button {
		width: 100%;
		padding: 1rem 2rem;
		border: none;
		border-radius: 0.75rem;
		font-family: 'MakabiYG', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.primary-button {
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		color: #374151;
	}

	.primary-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 20px rgba(191, 149, 63, 0.3);
	}

	.secondary-button {
		background: white;
		color: #6b7280;
		border: 2px solid #e5e7eb;
	}

	.secondary-button:hover {
		background: #f9fafb;
		border-color: #bf953f;
		transform: translateY(-2px);
	}

	.contact-info {
		padding-top: 2rem;
		border-top: 1px solid #e5e7eb;
		color: #6b7280;
	}

	.contact-info p {
		margin-bottom: 1rem;
		font-size: 0.95rem;
	}

	.contact-methods {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.contact-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(to right, #25d366, #128c7e);
		color: white;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.contact-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.success-content {
			padding: 2rem 1.5rem;
		}

		.success-title {
			font-size: 2rem;
		}

		.success-message {
			font-size: 1rem;
		}

		.success-icon {
			width: 100px;
			height: 100px;
		}

		.success-icon :global(svg) {
			width: 48px;
			height: 48px;
		}

		.sparkle {
			font-size: 1.5rem;
		}
	}
</style>
