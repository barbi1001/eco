<script>
	// route בדיקה זמני לעמוד המוצר — עובד בלי Strapi, על agil1.json המקומי.
	// מדמה את מנגנון החלפת התצוגות של העמוד האמיתי (קלאסית/נוחה).
	// למחוק (או להשאיר לבדיקות) אחרי אימות. ראה docs/ITEM_PAGE_REDESIGN.md.
	import { dev } from '$app/environment';
	import ItemPage from '$lib/comonents/item/ItemPage.svelte';
	import Mobile from '$lib/comonents/mobileItem.svelte';
	import DesctoItem from '$lib/comonents/desctoItem.svelte';
	import pdata from '$lib/data/agil1.json';

	const attrs = pdata.data.attributes;
	const imga = attrs.img1?.data?.attributes?.url;
	const imgb = attrs.img2?.data?.attributes?.url || imga;
	const imgc = attrs.img3?.data?.attributes?.url || imga;
	const imgd = attrs.img4?.data?.attributes?.url || imga;
	const imge = attrs.img5?.data || [imga];
	const is1vid = attrs.img1?.data?.attributes?.mime == 'video/mp4';
	const is4vid = attrs.img4?.data?.attributes?.mime == 'video/mp4';

	let w = $state(0);
	let mobiles = $derived(w < 600 ? true : false);

	let viewMode = $state('classic');
	function toggleView() {
		viewMode = viewMode === 'easy' ? 'classic' : 'easy';
	}

	function addToCart(e) {
		console.log('dev-item-test addToCart:', e);
	}
</script>

{#if !dev}
	<p dir="rtl">עמוד בדיקה — זמין רק בסביבת פיתוח.</p>
{:else}
	<div class="viewToggle" dir="rtl">
		<button type="button" class="toggleBtn" onclick={toggleView}>
			{viewMode === 'classic' ? '✨ לתצוגה נוחה' : '🎀 לתצוגה המעוצבת'}
		</button>
	</div>

	<div class={viewMode === 'classic' ? 'classicwrap' : ''} bind:clientWidth={w}>
		{#if viewMode === 'easy'}
			<ItemPage
				onaddto={addToCart}
				shopsi={pdata}
				{is1vid}
				{is4vid}
				low={false}
				shem={attrs.name}
				{imga}
				{imgb}
				{imgc}
				{imgd}
				{imge}
				id={pdata.data.id}
				kind={attrs.kind}
				url={attrs.url}
				des={attrs.des}
				price={attrs.price}
				{w}
			/>
		{:else}
			{#key mobiles}
				{#if mobiles}
					<Mobile
						onaddto={addToCart}
						shopsi={pdata}
						{is1vid}
						{is4vid}
						low={false}
						shem={attrs.name}
						{imga}
						{imgb}
						{imgc}
						{imgd}
						{imge}
						id={pdata.data.id}
						kind={attrs.kind}
						url={attrs.url}
						des={attrs.des}
						price={attrs.price}
						{w}
					/>
				{:else}
					<DesctoItem
						onaddto={addToCart}
						shem={attrs.name}
						{is1vid}
						{is4vid}
						{imga}
						{imgb}
						{imgc}
						{imgd}
						{imge}
						id={pdata.data.id}
						kind={attrs.kind}
						url={attrs.url}
						des={attrs.des}
						price={attrs.price}
					/>
				{/if}
			{/key}
		{/if}
	</div>
{/if}

<style>
	.viewToggle {
		position: fixed;
		top: 0.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 220;
	}
	.toggleBtn {
		min-height: 44px;
		padding: 0.4rem 1.2rem;
		border-radius: 9999px;
		background: linear-gradient(180deg, #d52474 0%, #aa1f5d 100%);
		color: #fff6d5;
		border: 2px solid #fff6d5;
		font-size: 1rem;
		font-weight: 700;
		box-shadow: 0 4px 14px rgba(58, 10, 31, 0.35);
		cursor: pointer;
		white-space: nowrap;
	}
	.classicwrap {
		width: 100vw;
		overflow-y: hidden;
	}
</style>
