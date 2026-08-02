<script>
	import BowRibbon from '$lib/svg/decor/BowRibbon.svelte';
	import PearlString from '$lib/svg/decor/PearlString.svelte';

	/** @type {{ shem?: string, price?: any, kind?: string, url?: string, des?: string }} */
	let { shem = '', price = '', kind = '', url = '', des = '' } = $props();
</script>

<div class="info" dir="rtl">
	<BowRibbon width="120px" class="mb-2" />
	<h1 class="text-2xl font-extrabold leading-tight text-[#fff6d5] drop-shadow-[0_3px_6px_rgba(58,10,31,0.6)] lg:text-4xl">
		{shem}
	</h1>

	{#if kind}
		<a
			href={url ? `/${url}/` : null}
			class="mt-2 inline-block rounded-full border border-[#fff6d5]/60 bg-[#aa1f5d]/40 px-4 py-1.5 text-sm font-medium text-[#fff6d5]"
		>
			{kind}
		</a>
	{/if}

	<div class="my-4 h-0.5 w-24 bg-goldGrad"></div>

	<p class="price bg-goldGrad bg-clip-text text-4xl font-black text-transparent lg:text-5xl">
		₪{price}
	</p>

	{#if des}
		<h2 class="mt-6 mb-2 text-xl font-bold text-[#fff6d5]">מידע נוסף</h2>
		<PearlString width="180px" class="mb-4" />
		<p class="des whitespace-pre-line text-lg leading-relaxed text-[#fff6d5]">
			{des}
		</p>
	{/if}
</div>

<style>
	.price {
		text-shadow: none;
		-webkit-text-fill-color: transparent;
	}
	.des {
		text-shadow: 0 0 1px #4a0e2a, 0 4px 10px rgba(58, 10, 31, 0.45);
	}
</style>
