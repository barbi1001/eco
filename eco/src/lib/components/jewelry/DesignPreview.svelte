<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { selectedTemplate, designState, totalPrice } from '$lib/stores/jewelryDesigner';
  import type { JewelryComponent } from '$lib/types/jewelry';
  import { generatePreviewImage, downloadPreviewImage } from '$lib/utils/previewGenerator';
  import { prepareSvgForRendering } from '$lib/utils/svgSanitizer';
  import LoadingSpinner from './LoadingSpinner.svelte';
  
  interface Props {
    onProceed?: () => void;
    onBack?: () => void;
  }
  
  let { onProceed, onBack }: Props = $props();
  
  // Preview state
  let previewSvg = $state<SVGSVGElement>();
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let isDragging = $state(false);
  let dragStartX = $state(0);
  let dragStartY = $state(0);
  let viewMode = $state<'normal' | 'detailed'>('normal');
  let isGeneratingImage = $state(false);
  let generatedPreviewUrl = $state<string | null>(null);
  
  // Canvas dimensions
  const canvasWidth = 800;
  const canvasHeight = 600;
  
  // Zoom controls
  function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.25, 3);
  }
  
  function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
  }
  
  function resetView() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
  }
  
  // Pan controls
  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    panX = e.clientX - dragStartX;
    panY = e.clientY - dragStartY;
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  // Touch support for mobile
  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX - panX;
      dragStartY = e.touches[0].clientY - panY;
    }
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    panX = e.touches[0].clientX - dragStartX;
    panY = e.touches[0].clientY - dragStartY;
  }
  
  function handleTouchEnd() {
    isDragging = false;
  }
  
  // Get component for a position
  function getComponentForPosition(positionId: string): JewelryComponent | undefined {
    return $designState.selectedComponents.get(positionId);
  }
  
  // Generate preview image for download or order submission
  async function generatePreview() {
    if (!previewSvg) {
      console.error('Preview SVG not available');
      return;
    }
    
    isGeneratingImage = true;
    
    try {
      const result = await generatePreviewImage(previewSvg, {
        format: 'png',
        quality: 0.95,
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      generatedPreviewUrl = result.dataUrl;
      
      // Store in design state for order submission
      designState.update(state => ({
        ...state,
        previewImage: result.dataUrl
      }));
      
      return result;
    } catch (error) {
      console.error('Failed to generate preview image:', error);
      throw error;
    } finally {
      isGeneratingImage = false;
    }
  }
  
  // Download preview image
  async function handleDownloadPreview() {
    try {
      const result = await generatePreview();
      if (result) {
        downloadPreviewImage(result.dataUrl, `jewelry-design-${Date.now()}.png`);
      }
    } catch (error) {
      console.error('Failed to download preview:', error);
    }
  }
  
  // Handle proceed to order
  async function handleProceedToOrder() {
    // Generate preview image before proceeding
    try {
      await generatePreview();
      onProceed?.();
    } catch (error) {
      console.error('Failed to generate preview for order:', error);
      // Still proceed but without preview image
      onProceed?.();
    }
  }
  
  // Handle back to customization
  function handleBack() {
    onBack?.();
  }
  
  // Toggle view mode
  function toggleViewMode() {
    viewMode = viewMode === 'normal' ? 'detailed' : 'normal';
    if (viewMode === 'detailed') {
      zoomLevel = 1.5;
    } else {
      resetView();
    }
  }
  
  onMount(() => {
    // Add global mouse up listener
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  });
</script>

<div class="design-preview-container" in:fade={{ duration: 300 }}>
  <div class="preview-header">
    <h2>תצוגה מקדימה של התכשיט שלך</h2>
    <p class="preview-subtitle">בדקי את העיצוב לפני השלמת ההזמנה</p>
  </div>
  
  <div class="preview-content">
    <!-- Main Preview Area -->
    <div class="preview-canvas-wrapper">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="preview-canvas"
        class:dragging={isDragging}
        onmousedown={handleMouseDown}
        onmousemove={handleMouseMove}
        ontouchstart={handleTouchStart}
        ontouchmove={handleTouchMove}
        role="img"
        aria-label="תצוגה מקדימה של התכשיט המותאם אישית"
      >
        <svg
          bind:this={previewSvg}
          id="jewelry-preview-svg"
          class="preview-svg"
          viewBox="0 0 {canvasWidth} {canvasHeight}"
          xmlns="http://www.w3.org/2000/svg"
          style="transform: translate({panX}px, {panY}px) scale({zoomLevel}); transform-origin: center;"
        >
          <!-- Background -->
          <rect width="100%" height="100%" fill="#ffffff" />
          
          <!-- Template Layer -->
          {#if $selectedTemplate}
            <g class="template-layer">
              {@html prepareSvgForRendering($selectedTemplate.svgTemplate)}
            </g>
            
            <!-- Components Layer -->
            <g class="components-layer">
              {#each $selectedTemplate.positions as position}
                {@const component = getComponentForPosition(position.id)}
                {#if component && component.svgElement}
                  <g
                    transform="translate({position.x}, {position.y})"
                    class="component-element"
                  >
                    {@html prepareSvgForRendering(component.svgElement)}
                  </g>
                {/if}
              {/each}
            </g>
          {/if}
        </svg>
      </div>
      
      <!-- Zoom Controls -->
      <div class="zoom-controls">
        <button
          class="zoom-button"
          onclick={zoomIn}
          aria-label="הגדלה"
          title="הגדלה"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <button
          class="zoom-button"
          onclick={resetView}
          aria-label="איפוס תצוגה"
          title="איפוס תצוגה"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H16V16H4V4Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <button
          class="zoom-button"
          onclick={zoomOut}
          aria-label="הקטנה"
          title="הקטנה"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <!-- View Mode Toggle -->
      <div class="view-mode-toggle">
        <button
          class="view-mode-button"
          class:active={viewMode === 'normal'}
          onclick={() => { viewMode = 'normal'; resetView(); }}
        >
          רגיל
        </button>
        <button
          class="view-mode-button"
          class:active={viewMode === 'detailed'}
          onclick={toggleViewMode}
        >
          מפורט
        </button>
      </div>
      
      <!-- Instructions -->
      <div class="preview-instructions">
        <p>גררי להזזת התצוגה • השתמשי בכפתורי הזום להגדלה והקטנה</p>
      </div>
    </div>
    
    <!-- Design Summary Sidebar -->
    <div class="design-summary">
      <h3>סיכום העיצוב</h3>
      
      {#if $selectedTemplate}
        <div class="summary-section">
          <h4>תבנית</h4>
          <div class="summary-item">
            <span class="item-label">{$selectedTemplate.name}</span>
            <span class="item-value">₪{$selectedTemplate.basePrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="summary-section">
          <h4>רכיבים נבחרים</h4>
          {#if $designState.selectedComponents.size === 0}
            <p class="empty-message">לא נבחרו רכיבים</p>
          {:else}
            {#each Array.from($designState.selectedComponents.entries()) as [positionId, component]}
              <div class="summary-item" in:scale={{ duration: 200, easing: quintOut }}>
                <span class="item-label">{component.name}</span>
                <span class="item-value">₪{component.price.toFixed(2)}</span>
              </div>
            {/each}
          {/if}
        </div>
        
        <div class="summary-section total-section">
          <div class="summary-item total-item">
            <span class="item-label">סה"כ</span>
            <span class="item-value total-value">₪{$totalPrice.toFixed(2)}</span>
          </div>
        </div>
      {/if}
      
      <!-- Action Buttons -->
      <div class="action-buttons">
        <button 
          class="primary-button" 
          onclick={handleProceedToOrder}
          disabled={isGeneratingImage}
        >
          {#if isGeneratingImage}
            <LoadingSpinner size="small" />
            <span>מכין תצוגה...</span>
          {:else}
            המשך להזמנה
          {/if}
        </button>
        
        <button 
          class="download-button" 
          onclick={handleDownloadPreview}
          disabled={isGeneratingImage}
        >
          {#if isGeneratingImage}
            <LoadingSpinner size="small" />
          {:else}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8H9V4H11V8H14L10 12Z" fill="currentColor"/>
              <path d="M4 14H16V16H4V14Z" fill="currentColor"/>
            </svg>
            <span>הורדת תמונה</span>
          {/if}
        </button>
        
        <button class="secondary-button" onclick={handleBack}>
          חזרה לעריכה
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .design-preview-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .preview-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .preview-header h2 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .preview-subtitle {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .preview-content {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    align-items: start;
  }
  
  .preview-canvas-wrapper {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid #f3e8ff;
    position: relative;
  }
  
  .preview-canvas {
    width: 100%;
    height: 600px;
    overflow: hidden;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
    position: relative;
    touch-action: none;
  }
  
  .preview-canvas.dragging {
    cursor: grabbing;
  }
  
  .preview-canvas:not(.dragging) {
    cursor: grab;
  }
  
  .preview-svg {
    width: 100%;
    height: 100%;
    transition: transform 0.2s ease-out;
    /* Optimize SVG rendering performance */
    will-change: transform;
    transform: translateZ(0);
  }
  
  :global(.preview-svg .template-layer),
  :global(.preview-svg .component-element) {
    pointer-events: none;
  }
  
  .zoom-controls {
    position: absolute;
    top: 2rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: white;
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .zoom-button {
    width: 40px;
    height: 40px;
    border: none;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .zoom-button:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(191, 149, 63, 0.3);
  }
  
  .zoom-button:active {
    transform: scale(0.95);
  }
  
  .view-mode-toggle {
    position: absolute;
    top: 2rem;
    left: 2rem;
    display: flex;
    gap: 0.5rem;
    background: white;
    border-radius: 0.5rem;
    padding: 0.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .view-mode-button {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: #6b7280;
    border-radius: 0.375rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }
  
  .view-mode-button.active {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    font-weight: 600;
  }
  
  .view-mode-button:hover:not(.active) {
    background: #f3f4f6;
  }
  
  .preview-instructions {
    text-align: center;
    margin-top: 1rem;
    padding: 0.75rem;
    background: linear-gradient(to right, rgba(191, 149, 63, 0.1), rgba(252, 246, 186, 0.1));
    border-radius: 0.5rem;
    color: #6b7280;
    font-size: 0.9rem;
  }
  
  .design-summary {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid #f3e8ff;
    position: sticky;
    top: 2rem;
  }
  
  .design-summary h3 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .summary-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .summary-section:last-of-type {
    border-bottom: none;
  }
  
  .summary-section h4 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 1.1rem;
    color: #374151;
    margin-bottom: 0.75rem;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    color: #6b7280;
  }
  
  .item-label {
    font-size: 0.95rem;
  }
  
  .item-value {
    font-weight: 600;
    color: #374151;
  }
  
  .total-section {
    background: linear-gradient(to right, rgba(191, 149, 63, 0.1), rgba(252, 246, 186, 0.1));
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .total-item {
    padding: 0;
  }
  
  .total-item .item-label {
    font-size: 1.2rem;
    font-weight: 600;
    color: #374151;
  }
  
  .total-value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .empty-message {
    color: #9ca3af;
    font-size: 0.9rem;
    font-style: italic;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .primary-button,
  .secondary-button,
  .download-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-family: 'MakabiYG', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .primary-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
  }
  
  .primary-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(191, 149, 63, 0.3);
  }
  
  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .download-button {
    background: linear-gradient(to right, #3b82f6, #60a5fa, #2563eb);
    color: white;
  }
  
  .download-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .download-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .secondary-button {
    background: white;
    color: #6b7280;
    border: 2px solid #e5e7eb;
  }
  
  .secondary-button:hover {
    background: #f9fafb;
    border-color: #BF953F;
    color: #374151;
  }
  
  /* Responsive design */
  @media (max-width: 1024px) {
    .preview-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .design-summary {
      position: static;
      order: 2;
    }
    
    .preview-canvas-wrapper {
      order: 1;
    }
  }
  
  @media (max-width: 768px) {
    .design-preview-container {
      padding: 1rem 0.5rem;
    }
    
    .preview-header {
      margin-bottom: 1.5rem;
    }
    
    .preview-header h2 {
      font-size: 1.75rem;
    }
    
    .preview-subtitle {
      font-size: 1rem;
    }
    
    .preview-canvas-wrapper {
      padding: 1rem;
    }
    
    .preview-canvas {
      height: 400px;
      touch-action: pan-x pan-y pinch-zoom;
    }
    
    .zoom-controls,
    .view-mode-toggle {
      top: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .zoom-controls {
      right: 1rem;
    }
    
    .view-mode-toggle {
      left: 1rem;
    }
    
    .zoom-button {
      width: 40px;
      height: 40px;
      /* Larger touch targets for mobile */
    }
    
    .view-mode-button {
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      min-width: 60px;
    }
    
    .preview-instructions {
      font-size: 0.85rem;
      padding: 0.5rem;
    }
    
    .design-summary {
      padding: 1rem;
      border-radius: 0.75rem;
    }
    
    .design-summary h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    
    .summary-section {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
    }
    
    .summary-section h4 {
      font-size: 1rem;
    }
    
    .summary-item {
      padding: 0.4rem 0;
    }
    
    .item-label {
      font-size: 0.9rem;
    }
    
    .item-value {
      font-size: 0.9rem;
    }
    
    .total-section {
      padding: 0.75rem;
    }
    
    .total-item .item-label {
      font-size: 1.1rem;
    }
    
    .total-value {
      font-size: 1.3rem;
    }
    
    .action-buttons {
      gap: 0.5rem;
      position: sticky;
      bottom: 0;
      background: white;
      padding: 1rem;
      margin: -1rem;
      border-top: 2px solid #f3e8ff;
    }
    
    .primary-button,
    .secondary-button,
    .download-button {
      padding: 1rem 1.5rem;
      font-size: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    .preview-header h2 {
      font-size: 1.5rem;
    }
    
    .preview-subtitle {
      font-size: 0.9rem;
    }
    
    .preview-canvas {
      height: 350px;
    }
    
    .zoom-controls {
      right: 0.5rem;
    }
    
    .view-mode-toggle {
      left: 0.5rem;
    }
    
    .zoom-button {
      width: 36px;
      height: 36px;
    }
    
    .view-mode-button {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      min-width: 50px;
    }
    
    .design-summary h3 {
      font-size: 1.1rem;
    }
    
    .summary-section h4 {
      font-size: 0.95rem;
    }
    
    .item-label,
    .item-value {
      font-size: 0.85rem;
    }
    
    .total-item .item-label {
      font-size: 1rem;
    }
    
    .total-value {
      font-size: 1.2rem;
    }
  }
</style>
