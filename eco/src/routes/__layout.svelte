<script>
	import '../app.css';
	import Small from './../lib/comonents/smallcarta.svelte'
	import Carta from './../lib/comonents/carta.svelte'
	import { DialogOverlay, DialogContent } from 'svelte-accessible-dialog';
    let isOpen;
  const open = () => {
    isOpen = true;
  };

  const close = () => {
    isOpen = false;
	//get name from event timout to show goodby msg
  };
</script>
<DialogOverlay class="over" {isOpen} onDismiss={close}>
	<DialogContent aria-label="form" class="content">
		<div class="tofes" dir="rtl">
<Carta on:close={close}/>
		</div>

	</DialogContent>
	</DialogOverlay >
<div><button on:click={()=>open()}><Small/></button></div>
<slot />

<style>
	:global([data-svelte-dialog-content].content) {
    width: 66vw;
  /*  background-image: url(https://res.cloudinary.com/barb1/image/upload/v1642276506/KnittedWool_yuokzt.svg);
    background-position: center center;
    background-size: cover;
	*/
    z-index:222;
    }
	:global([data-svelte-dialog-overlay].over) {
		z-index:222;

	}

</style>