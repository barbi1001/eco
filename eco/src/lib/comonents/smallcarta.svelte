<script>
	import {cart} from "../stores/cart.js";
</script>

<p><strong>{$cart.length}</strong> </p>
<p>
	<strong>{$cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
</p>