<script>
	import {cart} from "../stores/cart.js";
	import Matana from './matana.svelte';
</script>
<!--
<p><strong>{$cart.length}</strong> </p>
<p>
	<strong>{$cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
</p>-->
<Matana number={$cart.reduce((sum, item) => sum + item.quantity, 0)}/>