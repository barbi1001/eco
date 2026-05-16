<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/adminAuth';

	onMount(() => {
		goto($isAuthenticated ? '/admin/orders' : '/admin/login');
	});
</script>

<div class="loading">מעבירה…</div>

<style>
	.loading {
		padding: 4rem 2rem;
		text-align: center;
		color: #888;
	}
</style>
