<script>
  import { onMount } from 'svelte';
  
  /** @type {{children?: import('svelte').Snippet}} */
  let { children } = $props();
  
  let mounted = $state(false);
  
  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  {@render children?.()}
{/if}