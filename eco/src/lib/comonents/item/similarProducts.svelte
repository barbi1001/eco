<script >
import DummyProductCard from '$lib/comonents/item/dummyProductCard.svelte'
import ProductCard from '$lib/comonents/item/productCard.svelte'
import { page } from '$app/stores'
export let similarProducts = $page?.data?.relatedP
</script>

{#if similarProducts}
	<div dir="rtl" style="background-color: #ff83a8;" class="mb-5 sm:mb-10">
		<h2 class="mb-5 text-lg font-bold capitalize sm:text-xl md:text-2xl">עוד מ
            -
            BarB </h2>

		<div
			class="mb-5 grid w-full grid-cols-2 items-start gap-3 sm:mb-10 sm:flex sm:flex-wrap sm:justify-between lg:mb-20 lg:gap-6"
		>
			{#each similarProducts as p, px}
				<ProductCard product="{p}" />
			{/each}

			{#each { length: 7 } as _}
				<div class="hidden sm:block">
					<DummyProductCard />
				</div>
			{/each}
		</div>
	</div>
{/if}
