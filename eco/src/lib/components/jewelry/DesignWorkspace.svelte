<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { TemplatePosition, JewelryComponent } from '$lib/types/jewelry';
  import { 
    selectedTemplate, 
    designState, 
    jewelryDesignerActions,
    totalPrice,
    isDesignComplete,
    canProceedToNextStep
  } from '$lib/stores/jewelryDesigner';
  import { availableComponents, isLoadingComponents } from '$lib/stores/jewelryDesigner';
  import { componentsApi } from '$lib/api/strapiClient';
  import DesignCanvas from './DesignCanvas.svelte';
  import ComponentSelector from './ComponentSelector.svelte';
  
  interface Props {
    onProceed?: () => void;
    onBack?: () => void;
  }
  
  let { onProceed, onBack }: Props = $props();
  
  // Component state
  let isComponentSelectorOpen = $state(false);
  let selectedPosition = $state<TemplatePosition | null>(null);
  let currentComponentForPosition = $state<JewelryComponent | undefined>(undefined);
  
  // Load components on mount
  onMount(async () => {
    if ($availableComponents.length === 0) {
      await loadComponents();
    }
  });
  
  // Load components from API
  async function loadComponents() {
    isLoadingComponents.set(true);
    
    try {
      const components = await componentsApi.getAll();
      availableComponents.set(components);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      isLoadingComponents.set(false);
    }
  }
  
  // Handle position selection from canvas
  function handlePositionSelected(position: TemplatePosition) {
    selectedPosition = position;
    
    // Get current component for this position if any
    currentComponentForPosition = $designState.selectedComponents.get(position.id);
    
    // Open component selector
    isComponentSelectorOpen = true;
  }
  
  // Handle component selection from modal
  function handleComponentSelected(data: { component: JewelryComponent; position: TemplatePosition }) {
    const { component, position } = data;
    
    // Add component to position with real-time update
    jewelryDesignerActions.addComponentToPosition(position.id, component);
    
    // Close modal
    isComponentSelectorOpen = false;
    selectedPosition = null;
    currentComponentForPosition = undefined;
  }
  
  // Handle component removal
  function handleComponentRemoved(position: TemplatePosition) {
    
    // Remove component from position with real-time update
    jewelryDesignerActions.removeComponentFromPosition(position.id);
    
    // Close modal
    isComponentSelectorOpen = false;
    selectedPosition = null;
    currentComponentForPosition = undefined;
  }
  
  // Handle modal close
  function handleModalClose() {
    isComponentSelectorOpen = false;
    selectedPosition = null;
    currentComponentForPosition = undefined;
  }
  
  // Handle proceed to next step
  function handleProceed() {
    onProceed?.();
  }
  
  // Handle go back
  function handleBack() {
    onBack?.();
  }
  
  // Get completion status text
  function getCompletionStatus(): string {
    if (!$selectedTemplate) return '';
    
    const requiredPositions = $selectedTemplate.positions.filter(pos => pos.required);
    const filledRequiredPositions = requiredPositions.filter(pos => 
      $designState.selectedComponents.has(pos.id)
    );
    
    if (requiredPositions.length === 0) {
      return 'כל המיקומים אופציונליים';
    }
    
    return `${filledRequiredPositions.length} מתוך ${requiredPositions.length} מיקומים נדרשים ממולאים`;
  }
</script>

<div class="design-workspace">
  {#if $selectedTemplate}
    <!-- Design Canvas -->
    <div class="canvas-section">
      <DesignCanvas
        template={$selectedTemplate}
        onPositionSelected={handlePositionSelected}
      />
    </div>
    
    <!-- Design Summary Panel -->
    <div class="summary-panel">
      <div class="summary-content">
        <h3>סיכום עיצוב</h3>
        
        <!-- Progress -->
        <div class="progress-section">
          <div class="progress-label">
            <span>התקדמות</span>
            <span class="progress-status" class:complete={$isDesignComplete}>
              {getCompletionStatus()}
            </span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              style="width: {($selectedTemplate.positions.filter(p => p.required).length > 0) 
                ? ($selectedTemplate.positions.filter(p => p.required && $designState.selectedComponents.has(p.id)).length / 
                   $selectedTemplate.positions.filter(p => p.required).length * 100) 
                : 100}%"
            ></div>
          </div>
        </div>
        
        <!-- Selected Components List -->
        <div class="selected-components">
          <h4>רכיבים נבחרים</h4>
          {#if $designState.selectedComponents.size === 0}
            <p class="empty-message">עדיין לא נבחרו רכיבים</p>
          {:else}
            <ul class="components-list">
              {#each Array.from($designState.selectedComponents.entries()) as [positionId, component]}
                {@const position = $selectedTemplate.positions.find(p => p.id === positionId)}
                <li class="component-item" transition:fade={{ duration: 200 }}>
                  <img 
                    src={component.image} 
                    alt={component.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="component-item-info">
                    <p class="component-item-name">{component.name}</p>
                    <p class="component-item-details">{component.material}</p>
                  </div>
                  <p class="component-item-price">₪{component.price}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        
        <!-- Price Summary -->
        <div class="price-summary">
          <div class="price-row">
            <span>מחיר בסיס</span>
            <span>₪{$selectedTemplate.basePrice}</span>
          </div>
          <div class="price-row">
            <span>רכיבים ({$designState.selectedComponents.size})</span>
            <span>₪{$totalPrice - $selectedTemplate.basePrice}</span>
          </div>
          <div class="price-row total">
            <span>סה"כ</span>
            <span>₪{$totalPrice}</span>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            class="back-button"
            onclick={handleBack}
          >
            חזרה
          </button>
          <button
            class="proceed-button"
            disabled={!$canProceedToNextStep}
            onclick={handleProceed}
          >
            המשך לתצוגה מקדימה
          </button>
        </div>
      </div>
    </div>
    
    <!-- Component Selector Modal -->
    {#if selectedPosition}
      <ComponentSelector
        position={selectedPosition}
        currentComponent={currentComponentForPosition}
        isOpen={isComponentSelectorOpen}
        onComponentSelected={handleComponentSelected}
        onComponentRemoved={handleComponentRemoved}
        onClose={handleModalClose}
      />
    {/if}
  {:else}
    <div class="no-template">
      <p>לא נבחרה תבנית</p>
      <button class="back-button" onclick={handleBack}>
        חזרה לבחירת תבנית
      </button>
    </div>
  {/if}
</div>

<style>
  .design-workspace {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    padding: 1rem;
    min-height: 100vh;
    align-items: start;
  }
  
  .canvas-section {
    position: sticky;
    top: 1rem;
  }
  
  .summary-panel {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid #f3e8ff;
    position: sticky;
    top: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
  
  .summary-content h3 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 1.5rem;
    margin: 0 0 1.5rem 0;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .progress-section {
    margin-bottom: 1.5rem;
  }
  
  .progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .progress-status {
    color: #6b7280;
    font-weight: 600;
  }
  
  .progress-status.complete {
    color: #10b981;
  }
  
  .progress-bar {
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    transition: width 0.3s ease;
  }
  
  .selected-components {
    margin-bottom: 1.5rem;
  }
  
  .selected-components h4 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
    color: #374151;
  }
  
  .empty-message {
    color: #6b7280;
    font-size: 0.875rem;
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }
  
  .components-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .component-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: linear-gradient(to right, rgba(191, 149, 63, 0.05), rgba(252, 246, 186, 0.05));
    border-radius: 0.5rem;
    border: 1px solid #f3e8ff;
  }
  
  .component-item img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 0.25rem;
    background: white;
    padding: 0.25rem;
    /* Optimize image rendering */
    image-rendering: -webkit-optimize-contrast;
  }
  
  .component-item-info {
    flex: 1;
    min-width: 0;
  }
  
  .component-item-name {
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .component-item-details {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }
  
  .component-item-price {
    font-weight: 700;
    color: #BF953F;
    margin: 0;
    font-size: 0.875rem;
  }
  
  .price-summary {
    padding: 1rem;
    background: linear-gradient(to bottom, rgba(191, 149, 63, 0.05), rgba(252, 246, 186, 0.05));
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }
  
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
  
  .price-row.total {
    border-top: 2px solid #e5e7eb;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #374151;
  }
  
  .price-row.total span:last-child {
    color: #BF953F;
    font-size: 1.25rem;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }
  
  .back-button,
  .proceed-button {
    flex: 1;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s;
  }
  
  .back-button {
    background: #f3f4f6;
    color: #374151;
  }
  
  .back-button:hover {
    background: #e5e7eb;
  }
  
  .proceed-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
  }
  
  .proceed-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(191, 149, 63, 0.3);
  }
  
  .proceed-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .no-template {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .no-template p {
    font-size: 1.2rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
  
  /* Responsive design */
  @media (max-width: 1024px) {
    .design-workspace {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .canvas-section,
    .summary-panel {
      position: static;
    }
    
    .summary-panel {
      max-height: none;
      order: 2;
    }
    
    .canvas-section {
      order: 1;
    }
  }
  
  @media (max-width: 768px) {
    .design-workspace {
      padding: 0.5rem;
      gap: 0.75rem;
    }
    
    .summary-panel {
      padding: 1rem;
      border-radius: 0.75rem;
    }
    
    .summary-content h3 {
      font-size: 1.25rem;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 0.5rem;
      position: sticky;
      bottom: 0;
      background: white;
      padding: 1rem;
      margin: -1rem;
      border-top: 2px solid #f3e8ff;
    }
    
    .back-button,
    .proceed-button {
      padding: 1rem;
      font-size: 1rem;
    }
    
    .components-list {
      max-height: 300px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .component-item {
      padding: 0.5rem;
    }
    
    .component-item img {
      width: 35px;
      height: 35px;
    }
    
    .price-summary {
      padding: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .price-row {
      font-size: 0.9rem;
    }
    
    .price-row.total {
      font-size: 1rem;
    }
    
    .price-row.total span:last-child {
      font-size: 1.15rem;
    }
  }
  
  @media (max-width: 480px) {
    .summary-content h3 {
      font-size: 1.1rem;
    }
    
    .selected-components h4 {
      font-size: 1rem;
    }
    
    .component-item-name {
      font-size: 0.8rem;
    }
    
    .component-item-details {
      font-size: 0.7rem;
    }
    
    .component-item-price {
      font-size: 0.8rem;
    }
  }
</style>
