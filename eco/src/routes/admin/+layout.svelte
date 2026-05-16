<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { adminAuth, isAuthenticated, logout } from '$lib/stores/adminAuth';
	import { LogOut, Package, Home } from 'lucide-svelte';

	let { children } = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!mounted) return;
		const path = $page.url.pathname;
		const isPublicAdminPath =
			path === '/admin/login' || path === '/admin' || path === '/admin/';
		if (!$isAuthenticated && !isPublicAdminPath) {
			goto('/admin/login');
		} else if ($isAuthenticated && isPublicAdminPath) {
			goto('/admin/orders');
		}
	});

	function handleLogout() {
		logout();
		goto('/admin/login');
	}
</script>

<div class="admin-app" dir="rtl">
	{#if mounted && $isAuthenticated}
		<header class="admin-header">
			<div class="header-inner">
				<div class="brand">
					<Package size={22} />
					<span>ניהול הזמנות — ברבי עיצובים</span>
				</div>

				<nav class="nav">
					<a href="/admin/orders" class:active={$page.url.pathname.startsWith('/admin/orders')}>
						<Package size={16} />
						<span class="link-text">הזמנות</span>
					</a>
					<a href="/" class="external">
						<Home size={16} />
						<span class="link-text">לאתר</span>
					</a>
				</nav>

				<div class="user-area">
					{#if $adminAuth.user}
						<span class="user-name">{$adminAuth.user.username}</span>
					{/if}
					<button class="logout-btn" onclick={handleLogout} title="התנתקות" aria-label="התנתקות">
						<LogOut size={16} />
						<span class="logout-text">התנתקות</span>
					</button>
				</div>
			</div>
		</header>
	{/if}

	<main class="admin-main">
		{#if mounted}
			{@render children?.()}
		{:else}
			<div class="loading">טוען…</div>
		{/if}
	</main>
</div>

<style>
	:global(body) {
		font-family: 'Heebo', 'MakabiYG', sans-serif;
		-webkit-tap-highlight-color: transparent;
	}

	:global(button, a) {
		-webkit-tap-highlight-color: transparent;
	}

	.admin-app {
		min-height: 100vh;
		background: #f6f4ef;
		color: #2b2b2b;
	}

	.admin-header {
		background: linear-gradient(135deg, #1f1f1f 0%, #3a2e1f 100%);
		color: #f8efd9;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
		position: sticky;
		top: 0;
		z-index: 50;
		padding-top: env(safe-area-inset-top);
	}

	.header-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.9rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-weight: 700;
		font-size: 1.05rem;
		color: #f8efd9;
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.nav {
		display: flex;
		gap: 0.5rem;
		flex: 1;
	}

	.nav a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 0.9rem;
		min-height: 44px;
		border-radius: 0.5rem;
		color: #e8dfc6;
		text-decoration: none;
		font-size: 0.95rem;
		transition: background 0.2s ease;
	}

	.nav a:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.nav a.active {
		background: rgba(191, 149, 63, 0.25);
		color: #fcf6ba;
	}

	.nav a.external {
		opacity: 0.75;
	}

	.user-area {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.user-name {
		font-size: 0.9rem;
		color: #e8dfc6;
	}

	.logout-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.55rem 0.85rem;
		min-height: 44px;
		background: rgba(255, 255, 255, 0.08);
		color: #f8efd9;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 0.5rem;
		cursor: pointer;
		font-family: inherit;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.logout-btn:hover {
		background: rgba(255, 90, 90, 0.18);
		border-color: rgba(255, 90, 90, 0.4);
	}

	.admin-main {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1.5rem;
		padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
	}

	.loading {
		padding: 4rem 2rem;
		text-align: center;
		color: #888;
	}

	@media (max-width: 768px) {
		.header-inner {
			padding: 0.55rem 0.75rem;
			gap: 0.5rem;
		}
		.brand {
			font-size: 0.9rem;
			flex-shrink: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.nav {
			flex: 0 0 auto;
			gap: 0.25rem;
		}
		.nav a {
			padding: 0.55rem;
			min-width: 44px;
			justify-content: center;
		}
		.nav .link-text {
			display: none;
		}
		.user-name {
			display: none;
		}
		.logout-btn {
			padding: 0.55rem;
			min-width: 44px;
			justify-content: center;
		}
		.logout-text {
			display: none;
		}
		.admin-main {
			padding: 0.85rem;
		}
	}
</style>
