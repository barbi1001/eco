<script lang="ts">
  export let count: number = 3;
  export let type: 'template' | 'component' | 'text' = 'template';
  export let className: string = '';
</script>

<div class="skeleton-container {className}">
  {#each Array(count) as _, i}
    <div class="skeleton-item skeleton-{type}" class:animate={true}>
      {#if type === 'template'}
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
          <div class="skeleton-price"></div>
        </div>
      {:else if type === 'component'}
        <div class="skeleton-image-small"></div>
        <div class="skeleton-text-small"></div>
      {:else if type === 'text'}
        <div class="skeleton-text"></div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .skeleton-container {
    display: grid;
    gap: 1.5rem;
  }
  
  .skeleton-item {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .skeleton-template {
    padding: 1rem;
  }
  
  .skeleton-component {
    padding: 0.75rem;
    text-align: center;
  }
  
  .skeleton-image {
    width: 100%;
    height: 200px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .skeleton-image-small {
    width: 80px;
    height: 80px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.5rem;
    margin: 0 auto 0.5rem;
  }
  
  .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .skeleton-title {
    height: 1.5rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.25rem;
    width: 70%;
  }
  
  .skeleton-subtitle {
    height: 1rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.25rem;
    width: 50%;
  }
  
  .skeleton-price {
    height: 1.25rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.25rem;
    width: 30%;
    margin-top: 0.5rem;
  }
  
  .skeleton-text {
    height: 1rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.25rem;
    width: 100%;
  }
  
  .skeleton-text-small {
    height: 0.875rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    border-radius: 0.25rem;
    width: 80%;
    margin: 0 auto;
  }
  
  .animate {
    animation: shimmer 1.5s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .skeleton-image.animate,
  .skeleton-image-small.animate,
  .skeleton-title.animate,
  .skeleton-subtitle.animate,
  .skeleton-price.animate,
  .skeleton-text.animate,
  .skeleton-text-small.animate {
    background-size: 200px 100%;
    background-repeat: no-repeat;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .skeleton-image {
      height: 150px;
    }
    
    .skeleton-image-small {
      width: 60px;
      height: 60px;
    }
  }
</style>