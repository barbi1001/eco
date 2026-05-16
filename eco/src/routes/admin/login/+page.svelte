<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { login, isAuthenticated } from '$lib/stores/adminAuth';
	import { Lock, User } from 'lucide-svelte';

	let identifier = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let errorMsg = $state('');

	onMount(() => {
		if ($isAuthenticated) goto('/admin/orders');
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (isSubmitting) return;
		errorMsg = '';
		isSubmitting = true;
		try {
			await login(identifier.trim(), password);
			goto('/admin/orders');
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'התחברות נכשלה';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="login-wrapper" dir="rtl">
	<div class="login-card">
		<div class="logo-area">
			<div class="logo-circle">B</div>
			<h1>פאנל הניהול</h1>
			<p>התחברי כדי לצפות בהזמנות</p>
		</div>

		<form onsubmit={handleSubmit}>
			<label class="field">
				<span class="label-text">שם משתמש או אימייל</span>
				<div class="input-wrap">
					<User size={18} class="input-icon" />
					<input
						type="text"
						bind:value={identifier}
						required
						autocomplete="username"
						placeholder="admin"
						disabled={isSubmitting}
					/>
				</div>
			</label>

			<label class="field">
				<span class="label-text">סיסמה</span>
				<div class="input-wrap">
					<Lock size={18} class="input-icon" />
					<input
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
						placeholder="••••••••"
						disabled={isSubmitting}
					/>
				</div>
			</label>

			{#if errorMsg}
				<div class="error-box">{errorMsg}</div>
			{/if}

			<button type="submit" class="submit-btn" disabled={isSubmitting}>
				{isSubmitting ? 'מתחברת…' : 'התחברות'}
			</button>
		</form>
	</div>
</div>

<style>
	.login-wrapper {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		padding-top: calc(1.5rem + env(safe-area-inset-top));
		padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
		background:
			radial-gradient(ellipse at 20% 10%, rgba(255, 220, 235, 0.6) 0%, transparent 55%),
			radial-gradient(ellipse at 80% 90%, rgba(191, 149, 63, 0.25) 0%, transparent 55%),
			linear-gradient(135deg, #faf6ee 0%, #f0e6d2 100%);
	}

	.login-card {
		width: 100%;
		max-width: 420px;
		background: #fff;
		border-radius: 1.25rem;
		padding: 2.5rem 2rem;
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(191, 149, 63, 0.15);
	}

	@media (max-width: 480px) {
		.login-wrapper {
			padding: 1rem;
		}
		.login-card {
			padding: 1.75rem 1.25rem;
			border-radius: 1rem;
		}
	}

	.logo-area {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo-circle {
		width: 64px;
		height: 64px;
		margin: 0 auto 1rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 1.75rem;
		color: #2b2b2b;
		box-shadow: 0 6px 16px rgba(191, 149, 63, 0.3);
	}

	.logo-area h1 {
		font-size: 1.4rem;
		margin: 0 0 0.3rem;
		color: #2b2b2b;
	}

	.logo-area p {
		color: #7a7a7a;
		font-size: 0.95rem;
		margin: 0;
	}

	.field {
		display: block;
		margin-bottom: 1rem;
	}

	.label-text {
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.4rem;
		color: #555;
	}

	.input-wrap {
		position: relative;
	}

	.input-wrap :global(.input-icon) {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #b38728;
	}

	.input-wrap input {
		width: 100%;
		padding: 0.85rem 2.4rem 0.85rem 0.85rem;
		min-height: 48px;
		border: 1px solid #e2dcc8;
		border-radius: 0.6rem;
		font-size: 16px;
		font-family: inherit;
		background: #fdfcf8;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
	}

	.input-wrap input:focus {
		outline: none;
		border-color: #bf953f;
		box-shadow: 0 0 0 3px rgba(191, 149, 63, 0.15);
	}

	.input-wrap input:disabled {
		opacity: 0.6;
	}

	.error-box {
		background: #fdecea;
		color: #b1351a;
		padding: 0.65rem 0.85rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		border: 1px solid #f6c8bf;
	}

	.submit-btn {
		width: 100%;
		padding: 0.9rem;
		min-height: 48px;
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		color: #2b2b2b;
		font-weight: 700;
		border: none;
		border-radius: 0.6rem;
		font-size: 1.05rem;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.25s ease;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(191, 149, 63, 0.35);
	}

	.submit-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
</style>
