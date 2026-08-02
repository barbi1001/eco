<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { resolveMediaUrl } from '$lib/utils/jewelryHelpers';

  interface OptimizedImageProps {
    src: string;
    alt: string;
    class?: string;
    loading?: 'lazy' | 'eager';
    aspectRatio?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    /** Rendered width in CSS px — used to request a right-sized variant. */
    width?: number;
    /** Shown when the image fails to load. */
    fallbackSrc?: string;
  }

  let {
    src,
    alt,
    class: className = '',
    loading = 'lazy',
    aspectRatio = '1',
    objectFit = 'contain',
    width,
    fallbackSrc = '/images/placeholder-jewelry.svg'
  }: OptimizedImageProps = $props();

  // Ask the CDN for roughly twice the layout width so it still looks sharp on
  // retina screens, instead of downloading the full-size upload.
  let resolvedSrc = $derived(resolveMediaUrl(src, width ? width * 2 : undefined));
  
  let isLoaded = $state(false);
  let hasError = $state(false);
  let imgElement: HTMLImageElement;
  
  onMount(() => {
    if (imgElement?.complete) {
      isLoaded = true;
    }
  });
  
  function handleLoad() {
    isLoaded = true;
  }
  
  function handleError() {
    if (!hasError && fallbackSrc && imgElement && imgElement.src !== fallbackSrc) {
      hasError = true;
      imgElement.src = fallbackSrc;
      return;
    }
    hasError = true;
    isLoaded = true;
  }
</script>

<div 
  class="optimized-image-wrapper {className}"
  style="aspect-ratio: {aspectRatio};"
>
  {#if !isLoaded}
    <div class="image-skeleton" transition:fade={{ duration: 200 }}>
      <div class="skeleton-shimmer"></div>
    </div>
  {/if}
  
  <img
    bind:this={imgElement}
    src={resolvedSrc}
    {alt}
    {loading}
    decoding="async"
    class="optimized-image"
    class:loaded={isLoaded}
    class:error={hasError}
    style="object-fit: {objectFit};"
    onload={handleLoad}
    onerror={handleError}
  />
</div>

<style>
  .optimized-image-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
    border-radius: 0.5rem;
  }
  
  .image-skeleton {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .optimized-image {
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    /* Optimize rendering */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  .optimized-image.loaded {
    opacity: 1;
  }
  
  .optimized-image.error {
    opacity: 0.5;
    filter: grayscale(100%);
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .optimized-image {
      /* Use GPU acceleration on mobile */
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
  }
</style>
