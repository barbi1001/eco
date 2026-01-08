<script lang="ts">
  import type { JewelryDesignerError } from '$lib/types/jewelry';
  
  interface Props {
    error: JewelryDesignerError;
    showRetry?: boolean;
    showDetails?: boolean;
    onRetry?: () => void;
    onDismiss?: () => void;
  }
  
  let { error, showRetry = true, showDetails = false, onRetry, onDismiss }: Props = $props();
  
  function handleRetry() {
    onRetry?.();
  }
  
  function handleDismiss() {
    onDismiss?.();
  }
  
  function getErrorIcon(type: JewelryDesignerError['type']): string {
    switch (type) {
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      case 'state':
        return '🔄';
      case 'asset':
        return '🖼️';
      default:
        return '❌';
    }
  }
  
  function getErrorTitle(type: JewelryDesignerError['type']): string {
    switch (type) {
      case 'network':
        return 'בעיית חיבור';
      case 'validation':
        return 'שגיאת אימות';
      case 'state':
        return 'שגיאת מערכת';
      case 'asset':
        return 'שגיאת טעינה';
      default:
        return 'שגיאה';
    }
  }
</script>

<div class="error-container bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto" dir="rtl">
  <div class="error-header flex items-center gap-3 mb-4">
    <span class="error-icon text-2xl">{getErrorIcon(error.type)}</span>
    <h3 class="error-title text-lg font-bold text-red-800 font-[MakabiYG]">
      {getErrorTitle(error.type)}
    </h3>
  </div>
  
  <p class="error-message text-red-700 mb-4 font-[MakabiYG]">
    {error.message}
  </p>
  
  {#if showDetails && error.details}
    <details class="error-details mb-4">
      <summary class="text-sm text-red-600 cursor-pointer hover:text-red-800 font-[MakabiYG]">
        פרטים טכניים
      </summary>
      <pre class="text-xs text-red-500 mt-2 p-2 bg-red-100 rounded overflow-auto">
        {JSON.stringify(error.details, null, 2)}
      </pre>
    </details>
  {/if}
  
  <div class="error-actions flex gap-3 justify-center">
    {#if showRetry}
      <button
        onclick={handleRetry}
        class="retry-button bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-gray-900 font-medium rounded-lg text-sm px-4 py-2 hover:opacity-80 transition-opacity font-[MakabiYG]"
      >
        נסה שוב
      </button>
    {/if}
    
    <button
      onclick={handleDismiss}
      class="dismiss-button bg-gray-200 text-gray-700 font-medium rounded-lg text-sm px-4 py-2 hover:bg-gray-300 transition-colors font-[MakabiYG]"
    >
      סגור
    </button>
  </div>
</div>

<style>
  .error-container {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .error-icon {
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
</style>