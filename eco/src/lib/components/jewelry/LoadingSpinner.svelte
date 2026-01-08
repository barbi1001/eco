<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string = '#BF953F';
  export let message: string = '';
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };
</script>

<div class="loading-container flex flex-col items-center justify-center gap-4">
  <div 
    class="loading-spinner {sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200"
    style="border-top-color: {color};"
  ></div>
  
  {#if message}
    <p class="loading-message text-sm text-gray-600 font-[MakabiYG] animate-pulse">
      {message}
    </p>
  {/if}
</div>

<style>
  .loading-spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-message {
    background: linear-gradient(45deg, #BF953F, #FCF6BA, #B38728);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>