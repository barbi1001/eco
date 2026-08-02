<script>
	import ItemGallery from '$lib/comonents/item/ItemGallery.svelte';
	import ItemInfo from '$lib/comonents/item/ItemInfo.svelte';
	import ItemBuyBar from '$lib/comonents/item/ItemBuyBar.svelte';
	import SimilarProducts from '$lib/comonents/item/similarProducts.svelte';
	import SkeletonLoader from '$lib/components/jewelry/SkeletonLoader.svelte';
	import PearlString from '$lib/svg/decor/PearlString.svelte';

	/** חוזה זהה לקומפוננטות הישנות — ראה docs/ITEM_PAGE_REDESIGN.md */
	let {
		onaddto,
		shopsi,
		is1vid = false,
		is4vid = false,
		low = false,
		shem = '',
		imga,
		imgb,
		imgc,
		imgd,
		imge = [],
		id,
		kind = '',
		url = '',
		des = '',
		price = '',
		w = 0
	} = $props();

	let slides = $derived.by(() => {
		if (low) return [];
		const out = [];
		const attrs = shopsi?.data?.attributes;
		const push = (u, isVideo, formats) => {
			if (!u) return;
			if (out.some((s) => s.url === u)) return;
			out.push({ url: u, isVideo: !!isVideo, formats });
		};
		push(imga, is1vid, attrs?.img1?.data?.attributes?.formats);
		push(imgb, false, attrs?.img2?.data?.attributes?.formats);
		push(imgc, false, attrs?.img3?.data?.attributes?.formats);
		push(imgd, is4vid, attrs?.img4?.data?.attributes?.formats);
		// imge יכול להיות מערך אובייקטי Strapi או ‎[string]‎ (ה-fallback של העמוד)
		const extra = Array.isArray(imge) ? imge : [];
		for (const im of extra) {
			if (!im) continue;
			if (typeof im === 'string') push(im, false);
			else push(im.attributes?.url, im.attributes?.mime === 'video/mp4', im.attributes?.formats);
		}
		return out;
	});

	function buy() {
		onaddto?.({ pr: id });
	}
</script>

<div class="page bg-gradient-to-b from-[#ff83a8] to-[#fb6298]" dir="rtl">
	<div class="mx-auto max-w-6xl px-4 pt-4 pb-32 lg:grid lg:grid-cols-2 lg:gap-8 lg:pb-16 lg:pt-8">
		{#if low}
			<div class="lg:self-start">
				<SkeletonLoader count={1} type="template" />
			</div>
			<div class="mt-6 lg:mt-0">
				<SkeletonLoader count={3} type="text" />
			</div>
		{:else}
			<div class="lg:sticky lg:top-24 lg:max-h-[80vh] lg:self-start">
				{#if w != 0}
					<ItemGallery {slides} {shem} />
				{/if}
			</div>
			<div class="mt-6 lg:mt-0">
				<ItemInfo {shem} {price} {kind} {url} {des} />
				<ItemBuyBar {price} onbuy={buy} {low} />
			</div>
		{/if}
	</div>

	<div class="mx-auto max-w-6xl px-4">
		<div class="flex justify-center py-2"><PearlString width="min(60%, 420px)" /></div>
		<SimilarProducts />
	</div>
</div>

<style>
	.page {
		min-height: 100dvh;
		width: 100%;
	}
</style>
