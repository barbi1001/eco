
  <script>
      
      import { scale } from 'svelte/transition'

    export let data;
    let id = 1;
    $: (id = data.data);
import { onMount } from "svelte";
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
  let shopsi = getshop()

  onMount(async () =>{
    console.log(id)
    await
    fetch(`https://strapi-7iq2.onrender.com/api/categories/${id}?populate[1]=items.img1`)
  .then(response => response.json())
  .then(data => {
		console.log(data);
    shopsi = data
  }).catch(error => {
    console.log(error);
  })
})
    import Desk from '$lib/comonents/deskcatego.svelte'
      import Mobile from '$lib/comonents/mobilecatego.svelte'
      let urlx = "https://strapi-7iq2.onrender.com/api/";
     


 
    $: w = 0
</script>


<div in:scale="{{duration: 9000}}" class="r" bind:clientWidth="{w}">
  {#if w > 650}
<Desk {shopsi}/>

{:else}
<Mobile {shopsi}/>
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