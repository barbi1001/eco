<script>
	import { circOut } from 'svelte/easing';
	import data1 from '$lib/data/agil1.json';
	import data3 from '$lib/data/item3.json';
	import data2 from '$lib/data/item2.json';
	import data4 from '$lib/data/item4.json';
	import data5 from '$lib/data/item5.json';



	export let data;
	console.log(data);
	let id = data.id;
	let relatedP = data.relatedP;
	$: id = data.id;
	let kind, url, des, price;

let imga, imgb, imgc, imgd, imge, shem,is1vid, is4vid

			$: if(data.loading == false){
				console.log(data.pdata.data.attributes.img5.data)

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
				is1vid  = data.pdata?.data.attributes.img1.data?.attributes.mime == 'video/mp4' ? true : false
      	is4vid  = data.pdata?.data.attributes.img4.data?.attributes.mime == 'video/mp4' ? true : false
			}
			$: if(data.loading == false){
        	$products.push({
					name: data.pdata.data.attributes.name,
					image: is1vid	? data.pdata.data.attributes.img1.data?.attributes.url	: data.pdata.data.attributes.img1.data?.attributes.formats.small.url,
					id: data.pdata.data.id,
					price: data.pdata.data.attributes.price,
					quantity: 1
				})
        	prod = {
					name: data.pdata.data.attributes.name,
					image: is1vid ? data.pdata.data.attributes.img1.data?.attributes.url : data.pdata.data.attributes.img1.data?.attributes.formats.small.url,
					id: data.pdata.data.id,
					price: data.pdata.data.attributes.price,
					quantity: 1
        }
      }
	  import DesctoItem from '$lib/comonents/desctoItem.svelte';

	import Mobile from '$lib/comonents/mobileItem.svelte';
	let urlx = 'https://strapi-7iq2.onrender.com/api/';

	import { onMount } from 'svelte';

	import { products, cart } from '$lib/stores/cart.js';
	let prod = {};
	$: mobiles = w < 600 ? true : false;


	import Buy from '$lib/svg/buy.svelte';
	import { fly } from 'svelte/transition';
	function addToCart(event) {
		const product = event.detail.pr;
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
	$: h = 0;
	$: w = 0;
	
	import Carta from '$lib/comonents/carta.svelte';
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
	import WhatsappButton from '$lib/comonents/whatsappButton.svelte';
	let isOpen;
	const open = () => {
		isOpen = true;
	};
	async function closed(event) {
		let name = event.detail.name;
		console.log('y');
		let datar = { name: `${name}`, phone: event.detail.phone, total: event.detail.total ,email:event.detail.email,cart:event.detail.cart};
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
</script>

<DialogOverlay class="over" {isOpen} onDismiss={close}>
	<DialogContent aria-label="form" class="content">
		<div class="tofes" dir="rtl">
			<Carta on:close={closed} />
		</div>
	</DialogContent>
</DialogOverlay>
<div class="fullwidth" bind:clientWidth={w} bind:clientHeight={h}>

<div class="fixed bottom-2 left-2 z-[9999]"><WhatsappButton text={data?.pdata?.data?.attributes?.name}/></div>

	{#if data.loading == true}
		<div>
			{#key mobiles}

			{#if mobiles}
				<Mobile low={true} />
			{:else if mobiles == false}
				<DesctoItem low={true} />
			{/if}
			{/key}
		</div>
	{:else}
		<div >
			{#key mobiles}
			{#if mobiles == true}
				<Mobile
					on:addto={addToCart}
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
			{:else if mobiles == false}
				<DesctoItem
					on:addto={addToCart}
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
		</div>
	{/if}
</div>

<style>
	.slide {
		max-height: 200px;
		width: auto;
		height: 100%;
		box-sizing: border-box;
		vertical-align: middle;
		object-fit: cover;
		position: relative;
		z-index: 1;
		border-radius: 1rem;
		box-shadow: 0 14px 25px rgba(0, 0, 0, 0.16);
	}
	.fullwidth {
		width: 100vw;
		overflow-y: hidden;
	}
	:global([data-svelte-dialog-content].content) {
		width: 66vw;
		/*  background-image: url(https://res.cloudinary.com/barb1/image/upload/v1642276506/KnittedWool_yuokzt.svg);
    background-position: center center;
    background-size: cover;
	*/
		z-index: 222;
	}
	:global([data-svelte-dialog-overlay].over) {
		z-index: 222;
	}
</style>
