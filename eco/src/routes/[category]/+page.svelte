
  <script>

      import { fade } from 'svelte/transition'

    export let data;
    let id = 1;
    $: (id = data.data);
  import datax from '$lib/data/tachshi.json'
  function getshop (){
    console.log(data)
    let shopsi
  if (id == 1){
    shopsi = datax
    console.log(shopsi)
    }
    return shopsi
}

 
  
    import Desk from '$lib/comonents/deskcatego.svelte'
      import Mobile from '$lib/comonents/mobilecatego.svelte'
      let urlx = "https://strapi-7iq2.onrender.com/api/";




    $: w = 0
    $: h = 0

</script>


<div class="r" bind:clientWidth="{w}" bind:clientHeight="{h}">
  {#if data.fulfild}
  {#if w > 650}
  <div in:fade|global="{{ duration: 9000}}"  bind:clientHeight="{h}">

<Desk shopsi={data.shopsi}/>
  </div>
{:else if w <= 650 && w>0}
<Mobile shopsi={data.shopsi}/>
{/if}
{/if}

</div>

   <!--{#key shopsi}
    <ul>
    {#each shopsi.data.attributes.items.data as ite}
        <li> <h1>{ite.attributes.name}</h1></li>

    {/each}
    </ul>
    {/key}-->
<style>
    .r{
        height: 100vh;
        width: 100vw;
        display: grid;
        justify-content: center;
        align-items: center;
        background-color: #ff83a8;
    }

</style>
