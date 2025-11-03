<script>
	import {cart } from "../stores/cart.js";
	import Check from './yalla.svelte';
	let {onclose} = $props()
    let check = $state(false);
	const minusItem = (product) => {
		for(let item of $cart) {
				if(item.id === product.id) {
					if(product.quantity > 1 ) {
							product.quantity -= 1
							$cart = $cart
					} else {
							$cart = $cart.filter((cartItem) => cartItem != product)
					}
					return;
				}
		}
	}
	
	const plusItem = (product) => {
			for(let item of $cart) {
							if(item.id === product.id) {
								product.quantity += 1
								$cart = $cart;
								return;
							}
					}
	}

		let total = $derived($cart.reduce((sum, item) => sum + item.price * item.quantity, 0))

 function close(event){
	console.log("yy")
  let name = event.detail.name
    onclose({name: name,phone: event.detail.phone, total:event.detail.total ,email:event.detail.email, cart:$cart.map(c=>c.name)})

}
</script>

<div class="cart-list">
	{#each $cart as item }
		{#if item.quantity > 0}
		<div class="cart-item">
			<img width="50" src={item.image} alt={item.name}/>
			<div>{item.quantity}
				<button class="p-1 bg-pink-200" onclick={() => plusItem(item)}>+</button>
				<button class="p-1 bg-pink-200" onclick={() => minusItem(item)}>-</button>
			</div>
			<p>₪{item.price * item.quantity}</p>
		</div>
		{/if}
	{/each}
	<div dir="rtl" class="total">
		<h4>סך הכל:  ₪{total}</h4>
	</div>
</div>
<div >
    {#if check == false}
    <div class="flex justify-end">
    <button class="mt-1 py-1 px-4 rounded-full bg-pink-200 hover:bg-pink-500 text-pink-900 hover:text-pink-200" onclick={()=>check = true} >ביצוע הזמנה</button>
</div>
    {:else}
    <Check onclose={close}/>
    {/if}
</div>

<style>
	.cart-item {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	
	.total {
		text-align: left;
	}
	
	.cart-list {
		border: 2px solid pink;
		padding: 10px;
	}
</style>