<script>
	import { run } from 'svelte/legacy';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	import ItemPage from '$lib/comonents/item/ItemPage.svelte';
	import Mobile from '$lib/comonents/mobileItem.svelte';
	import DesctoItem from '$lib/comonents/desctoItem.svelte';
	import Carta from '$lib/comonents/carta.svelte';
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
	import WhatsappButton from '$lib/comonents/whatsappButton.svelte';
	import { products, cart } from '$lib/stores/cart.js';

	/** @type {{data: any}} */
	let { data } = $props();

	// 'classic' — העיצוב המקורי הכבד (ברירת מחדל), 'easy' — התצוגה הנוחה החדשה.
	// ממפה ערכי ?view= בכתובת לאחד משני המצבים (עובד גם ב-SSR).
	function normView(v) {
		if (!v) return null;
		v = v.toLowerCase();
		if (['easy', 'simple', 'soft', 'clean', 'נוח'].includes(v)) return 'easy';
		if (['classic', 'full', 'regular', 'design', 'heavy', 'מעוצב'].includes(v)) return 'classic';
		return null;
	}
	// קדימות: פרמטר ה-URL (שיתופי, זהה בשרת ובדפדפן) > העדפה שמורה ב-localStorage > ברירת מחדל.
	function initialView() {
		const q = normView($page.url.searchParams.get('view'));
		if (q) return q;
		if (browser && localStorage.getItem('barb-item-view') === 'easy') return 'easy';
		return 'classic';
	}
	let viewMode = $state(initialView());
	function toggleView() {
		viewMode = viewMode === 'easy' ? 'classic' : 'easy';
		if (browser) {
			localStorage.setItem('barb-item-view', viewMode);
			// משקף את הבחירה בכתובת כדי שהקישור יהיה שיתופי, בלי ניווט/טעינה מחדש.
			const url = new URL(window.location.href);
			url.searchParams.set('view', viewMode === 'easy' ? 'simple' : 'design');
			history.replaceState(history.state, '', url);
		}
	}

	let id = $state(data.id);
	let kind = $state(), url = $state(), des = $state(), price = $state();

	let imga = $state(), imgb = $state(), imgc = $state(), imgd = $state(), imge = $state(), shem = $state(), is1vid = $state(), is4vid = $state();

	let prod = $state({});

	function addToCart(event) {
		const product = event.pr;
		for (let item of $cart) {
			if (item.id === product) {
				prod.quantity += 1;
				$cart = $cart;
				return;
			}
		}
		$cart = [...$cart, prod];

		console.log($cart, prod);
		open();
	}

	let isOpen = $state();
	const open = () => {
		isOpen = true;
	};
	async function closed(event) {
		// carta.svelte קורא onclose עם אובייקט שטוח: {name, phone, total, email, cart}
		let name = event.name;
		let datar = { name: `${name}`, phone: event.phone, total: event.total, email: event.email, cart: event.cart };
		fetch(`/api/teleg`, {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(datar)
		})
			.then((response) => response)
			.then((data) => {
				console.log('Success:', data);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
		fetch(`/api/mail`, {
			method: 'POST', // or 'PUT'
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(datar)
		})
			.then((response) => response)
			.then((data) => {
				console.log('Success:', data);
				isOpen = false;
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	}
	const close = () => {
		isOpen = false;
		//get name from event timout to show goodby msg
	};
	run(() => {
		id = data.id;
	});
	run(() => {
		if (data.loading == false) {
			imga = data.pdata?.data?.attributes.img1.data?.attributes.url;
			imgb = data.pdata?.data?.attributes.img2.data?.attributes.url || imga;
			imgc = data.pdata?.data?.attributes.img3.data?.attributes.url || imga;
			imgd = data.pdata?.data?.attributes.img4.data?.attributes.url || imga;
			imge = data.pdata?.data.attributes.img5.data || new Array(imga);
			shem = data.pdata?.data.attributes.name;
			kind = data.pdata?.data.attributes.kind;
			url = data.pdata?.data.attributes.url;
			des = data.pdata?.data.attributes.des;
			price = data.pdata?.data.attributes.price;
			is1vid = data.pdata?.data.attributes.img1.data?.attributes.mime == 'video/mp4' ? true : false;
			is4vid = data.pdata?.data.attributes.img4.data?.attributes.mime == 'video/mp4' ? true : false;
		}
	});
	run(() => {
		if (data.loading == false) {
			$products.push({
				name: data.pdata.data.attributes.name,
				image: is1vid ? data.pdata.data.attributes.img1.data?.attributes.url : data.pdata.data.attributes.img1.data?.attributes.formats.small.url,
				id: data.pdata.data.id,
				price: data.pdata.data.attributes.price,
				quantity: 1
			});
			prod = {
				name: data.pdata.data.attributes.name,
				image: is1vid ? data.pdata.data.attributes.img1.data?.attributes.url : data.pdata.data.attributes.img1.data?.attributes.formats.small.url,
				id: data.pdata.data.id,
				price: data.pdata.data.attributes.price,
				quantity: 1
			};
		}
	});
	let w = $state(0);
	let mobiles = $derived(w < 600 ? true : false);
</script>

<DialogOverlay class="over" {isOpen} onDismiss={close}>
	<DialogContent aria-label="form" class="content">
		<div class="tofes" dir="rtl">
			<Carta onclose={closed} />
		</div>
	</DialogContent>
</DialogOverlay>

<div class="viewToggle" dir="rtl">
	<button type="button" class="toggleBtn" onclick={toggleView}>
		{viewMode === 'classic' ? '✨ לתצוגה נוחה' : '🎀 לתצוגה המעוצבת'}
	</button>
</div>

<div class={viewMode === 'classic' ? 'classicwrap' : 'fullwidth'} bind:clientWidth={w}>
	<!-- bottom-20 בתצוגה הנוחה במובייל כדי לא להתנגש בבר הקנייה הדביק -->
	<div class={viewMode === 'easy' ? 'fixed bottom-20 left-2 z-[9999] lg:bottom-2' : 'fixed bottom-2 left-2 z-[9999]'}>
		<WhatsappButton text={data?.pdata?.data?.attributes?.name} />
	</div>

	{#if viewMode === 'easy'}
		{#if data.loading == true}
			<ItemPage low={true} {w} />
		{:else}
			<ItemPage
				onaddto={addToCart}
				shopsi={data.pdata}
				{is4vid}
				{is1vid}
				low={false}
				{shem}
				{imga}
				{imgb}
				{imgc}
				{imgd}
				{imge}
				{id}
				{kind}
				{url}
				{des}
				{price}
				{w}
			/>
		{/if}
	{:else}
		{#if data.loading == true}
			{#key mobiles}
				{#if mobiles}
					<Mobile low={true} />
				{:else}
					<DesctoItem low={true} />
				{/if}
			{/key}
		{:else}
			{#key mobiles}
				{#if mobiles == true}
					<Mobile
						onaddto={addToCart}
						shopsi={data.pdata}
						{is4vid}
						{is1vid}
						low={false}
						{shem}
						{imga}
						{imgb}
						{imgc}
						{imgd}
						{imge}
						{id}
						{kind}
						{url}
						{des}
						{price}
						{w}
					/>
				{:else}
					<DesctoItem
						onaddto={addToCart}
						{shem}
						{is4vid}
						{is1vid}
						{imga}
						{imgb}
						{imgc}
						{imgd}
						{imge}
						{id}
						{kind}
						{url}
						{des}
						{price}
					/>
				{/if}
			{/key}
		{/if}
	{/if}
</div>

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
	.toggleBtn:focus-visible {
		outline: 3px solid #fff6d5;
		outline-offset: 2px;
	}
	.fullwidth {
		width: 100%;
	}
	/* התצוגה הקלאסית (SVG) מצפה לרוחב מסך מלא עם חיתוך גלישה כמו בעמוד המקורי */
	.classicwrap {
		width: 100vw;
		overflow-y: hidden;
	}
	:global([data-svelte-dialog-content].content) {
		width: min(92vw, 480px);
		max-height: 85dvh;
		overflow-y: auto;
		border-radius: 1rem;
		z-index: 222;
	}
	:global([data-svelte-dialog-overlay].over) {
		z-index: 222;
	}
</style>
