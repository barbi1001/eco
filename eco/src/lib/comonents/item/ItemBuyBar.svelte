<script>
	/** @type {{ price?: any, onbuy: () => void, low?: boolean }} */
	let { price = '', onbuy, low = false } = $props();
</script>

<div class="buybar" dir="rtl">
	<span class="price">₪{price}</span>
	<button type="button" class="cta" aria-label="הוספה לסל" disabled={low} onclick={() => onbuy?.()}>
		להזמנה!
	</button>
</div>

<style>
	.buybar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
		background: rgba(74, 14, 42, 0.92);
		backdrop-filter: blur(6px);
		box-shadow: 0 -8px 24px rgba(58, 10, 31, 0.35);
	}
	.price {
		color: #fff6d5;
		font-size: 1.5rem;
		font-weight: 800;
		white-space: nowrap;
	}
	.cta {
		flex: 1;
		min-height: 56px;
		font-family: 'Heebo', 'Assistant', sans-serif;
		font-weight: 800;
		font-size: 1.35rem;
		letter-spacing: 0.08em;
		color: #fff6d5;
		background: linear-gradient(135deg, #aa1f5d 0%, #d52474 45%, #aa1f5d 100%);
		border: 3px solid #fff6d5;
		border-radius: 999px;
		padding: 0.5rem 2rem;
		cursor: pointer;
		box-shadow:
			0 0 0 4px rgba(255, 246, 213, 0.25),
			0 8px 20px rgba(58, 10, 31, 0.55),
			inset 0 -6px 16px rgba(58, 10, 31, 0.35),
			inset 0 6px 12px rgba(255, 246, 213, 0.25);
		text-shadow: 0 2px 4px rgba(58, 10, 31, 0.7);
	}
	.cta:focus-visible {
		outline: 3px solid #fcf6ba;
		outline-offset: 2px;
	}
	.cta:active {
		transform: translateY(1px);
	}
	.cta:disabled {
		opacity: 0.6;
		cursor: default;
	}

	@media (min-width: 1024px) {
		.buybar {
			position: static;
			padding: 0;
			margin-top: 1.5rem;
			background: none;
			backdrop-filter: none;
			box-shadow: none;
		}
		.price {
			display: none; /* המחיר כבר מוצג ב-ItemInfo בעמודת המידע */
		}
		.cta {
			flex: 0 1 auto;
			min-width: 260px;
		}
	}
</style>
