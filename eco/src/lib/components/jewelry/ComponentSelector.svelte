<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import type { JewelryComponent, TemplatePosition, ComponentType, SizeCategory } from '$lib/types/jewelry';
  import { availableComponents, isLoadingComponents, componentLoadError } from '$lib/stores/jewelryDesigner';
  import { componentsApi } from '$lib/api/strapiClient';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  
  interface Props {
    position: TemplatePosition;
    isOpen?: boolean;
    currentComponent?: JewelryComponent;
    onComponentSelected?: (data: { component: JewelryComponent; position: TemplatePosition }) => void;
    onComponentRemoved?: (position: TemplatePosition) => void;
    onClose?: () => void;
  }
  
  let { position, isOpen = false, currentComponent, onComponentSelected, onComponentRemoved, onClose }: Props = $props();
  
  // Filter and search state
  let searchQuery = $state('');
  let selectedType = $state<ComponentType | 'all'>(position.type);
  let filteredComponents = $state<JewelryComponent[]>([]);
  let searchInput = $state<HTMLInputElement>();
  let showLetterBeadsOnly = $state(false);
  
  // Component types for filtering (including letter beads)
  const componentTypes: Array<{ value: ComponentType | 'all' | 'letter'; label: string }> = [
    { value: 'all', label: 'הכל' },
    { value: 'bead', label: 'חרוזים' },
    { value: 'letter', label: 'חרוזי אותיות' },
    { value: 'charm', label: 'תליונים קטנים' },
    { value: 'pendant', label: 'תליונים' },
    { value: 'chain', label: 'שרשראות' }
  ];
  
  // Load components on mount
  onMount(async () => {
    if ($availableComponents.length === 0) {
      await loadComponents();
    }
    
    // Focus search input when modal opens
    if (isOpen && searchInput) {
      setTimeout(() => searchInput?.focus(), 100);
    }
  });
  
  // Load components from API
  async function loadComponents() {
    isLoadingComponents.set(true);
    componentLoadError.set(null);
    
    try {
      const components = await componentsApi.getAll();
      availableComponents.set(components);
    } catch (error) {
      console.error('Failed to load components:', error);
      componentLoadError.set({
        type: 'network',
        message: 'שגיאה בטעינת רכיבים. אנא נסי שוב.',
        details: error
      });
    } finally {
      isLoadingComponents.set(false);
    }
  }
  
  // Filter components based on position compatibility, search, and type
  $effect(() => {
    filteredComponents = $availableComponents.filter(component => {
      // Special case: pendant_center can accept letter beads (beads) when text is being used
      const isCenterPendant = position.id === 'pendant_center';
      const isLetterBead = component.isLetterBead || 
                          (component.name && (component.name.endsWith('-letter') || component.name.includes('-letter')));
      
      // If it's the center pendant, allow both pendant and bead (letter bead) types
      if (isCenterPendant) {
        if (!isLetterBead && component.type !== 'pendant') {
          return false;
        }
        // Allow letter beads (beads) or pendants for center position
        if (isLetterBead && component.type !== 'bead') {
          return false;
        }
      } else {
        // Normal filtering: component type must match position type
        if (component.type !== position.type) {
          return false;
        }
      }
      
      // Filter by size compatibility
      if (!component.compatibleSizes.includes(position.size)) {
        return false;
      }
      
      // Filter by selected type
      if (selectedType === 'letter') {
        // Show only letter beads
        return component.isLetterBead === true;
      } else if (selectedType !== 'all' && component.type !== selectedType) {
        return false;
      }
      
      // If showLetterBeadsOnly is true, only show letter beads
      if (showLetterBeadsOnly && !component.isLetterBead) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          component.name.toLowerCase().includes(query) ||
          component.material.toLowerCase().includes(query) ||
          component.color.toLowerCase().includes(query) ||
          (component.letterValue && component.letterValue.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  });
  
  // Handle component selection
  function selectComponent(component: JewelryComponent) {
    onComponentSelected?.({ component, position });
    closeModal();
  }
  
  // Handle component removal
  function removeComponent() {
    onComponentRemoved?.(position);
    closeModal();
  }
  
  // Close modal
  function closeModal() {
    onClose?.();
  }
  
  // Handle backdrop click
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
  
  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
  
  // Get position type label
  function getPositionTypeLabel(type: ComponentType): string {
    switch (type) {
      case 'bead': return 'חרוז';
      case 'charm': return 'תליון קטן';
      case 'pendant': return 'תליון';
      case 'chain': return 'שרשרת';
      default: return type;
    }
  }
  
  // Check if component is a letter bead
  function isLetterBead(component: JewelryComponent): boolean {
    return component.isLetterBead === true;
  }
  
  // Get letter bead display character
  function getLetterDisplay(component: JewelryComponent): string {
    if (!isLetterBead(component) || !component.letterValue) {
      return '';
    }
    return component.letterValue.toUpperCase();
  }
  
  // Toggle letter beads only filter
  function toggleLetterBeadsOnly() {
    showLetterBeadsOnly = !showLetterBeadsOnly;
    if (showLetterBeadsOnly) {
      selectedType = 'letter';
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="modal-content"
      transition:fly={{ y: 50, duration: 300, easing: quintOut }}
    >
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 id="modal-title">
          בחרי {getPositionTypeLabel(position.type)} למיקום
        </h3>
        <button
          class="close-button"
          onclick={closeModal}
          aria-label="סגור"
        >
          ✕
        </button>
      </div>
      
      <!-- Current Selection -->
      {#if currentComponent}
        <div class="current-selection">
          <div class="current-component">
            <img 
              src={currentComponent.image} 
              alt={currentComponent.name}
              loading="eager"
              decoding="async"
            />
            <div class="current-info">
              <p class="current-name">{currentComponent.name}</p>
              <p class="current-details">{currentComponent.material} • {currentComponent.color}</p>
            </div>
          </div>
          <button
            class="remove-button"
            onclick={removeComponent}
          >
            הסר רכיב
          </button>
        </div>
      {/if}
      
      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-box">
          <input
            bind:this={searchInput}
            bind:value={searchQuery}
            type="text"
            placeholder="חפשי לפי שם, חומר או צבע..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="type-filters">
          {#each componentTypes as type}
            <button
              class="type-filter"
              class:active={selectedType === type.value}
              onclick={() => selectedType = type.value}
            >
              {type.label}
            </button>
          {/each}
        </div>
        
        <!-- Letter beads toggle for bead positions -->
        {#if position.type === 'bead'}
          <div class="letter-beads-toggle">
            <label class="toggle-label">
              <input
                type="checkbox"
                bind:checked={showLetterBeadsOnly}
                onchange={toggleLetterBeadsOnly}
                class="toggle-checkbox"
              />
              <span class="toggle-text">הצג רק חרוזי אותיות</span>
            </label>
          </div>
        {/if}
      </div>
      
      <!-- Components Grid -->
      <div class="modal-body">
        {#if $isLoadingComponents}
          <div class="loading-state">
            <LoadingSpinner />
            <p>טוען רכיבים...</p>
          </div>
        {:else if $componentLoadError}
          <div class="error-state">
            <ErrorMessage
              error={$componentLoadError}
              onDismiss={() => componentLoadError.set(null)}
            />
            <button class="retry-button" onclick={loadComponents}>
              נסי שוב
            </button>
          </div>
        {:else if filteredComponents.length === 0}
          <div class="empty-state">
            <p>לא נמצאו רכיבים מתאימים</p>
            {#if searchQuery}
              <button
                class="clear-search-button"
                onclick={() => searchQuery = ''}
              >
                נקה חיפוש
              </button>
            {/if}
          </div>
        {:else}
          <div class="components-grid">
            {#each filteredComponents as component (component.id)}
              <button
                class="component-card"
                class:selected={currentComponent?.id === component.id}
                class:letter-bead={isLetterBead(component)}
                onclick={() => selectComponent(component)}
                transition:scale={{ duration: 200 }}
              >
                <div class="component-image-wrapper">
                  <img
                    src={component.image}
                    alt={component.name}
                    class="component-image"
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {#if isLetterBead(component)}
                    <div class="letter-overlay">
                      <span class="letter-character">{getLetterDisplay(component)}</span>
                    </div>
                  {/if}
                </div>
                <div class="component-info">
                  <p class="component-name">{component.name}</p>
                  <p class="component-details">
                    {component.material} • {component.color}
                  </p>
                  {#if isLetterBead(component)}
                    <p class="letter-info">אות: {getLetterDisplay(component)}</p>
                  {/if}
                  <p class="component-price">₪{component.price}</p>
                </div>
                {#if currentComponent?.id === component.id}
                  <div class="selected-badge">✓</div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <!-- Modal Footer -->
      <div class="modal-footer">
        <p class="results-count">
          {filteredComponents.length} רכיבים זמינים
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .modal-content {
    background: white;
    border-radius: 1rem;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 2px solid #f3e8ff;
  }
  
  .modal-header h3 {
    font-family: 'MakabiYG', sans-serif;
    font-size: 1.5rem;
    margin: 0;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.5rem;
    line-height: 1;
    transition: color 0.2s;
  }
  
  .close-button:hover {
    color: #374151;
  }
  
  .current-selection {
    padding: 1rem 1.5rem;
    background: linear-gradient(to right, rgba(191, 149, 63, 0.1), rgba(252, 246, 186, 0.1));
    border-bottom: 1px solid #f3e8ff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .current-component {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .current-component img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 0.5rem;
    background: white;
    padding: 0.25rem;
  }
  
  .current-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .current-name {
    font-weight: 600;
    color: #374151;
    margin: 0;
  }
  
  .current-details {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
  
  .remove-button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    transition: background 0.2s;
  }
  
  .remove-button:hover {
    background: #dc2626;
  }
  
  .filters-section {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f3e8ff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .search-box {
    position: relative;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #BF953F;
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  
  .type-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .type-filter {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    transition: all 0.2s;
  }
  
  .type-filter:hover {
    border-color: #BF953F;
  }
  
  .type-filter.active {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    border-color: #BF953F;
    color: #374151;
    font-weight: 600;
  }
  
  /* Letter beads toggle */
  .letter-beads-toggle {
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .toggle-checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: #8B5CF6;
  }
  
  .toggle-text {
    user-select: none;
  }
  
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }
  
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #6b7280;
  }
  
  .retry-button,
  .clear-search-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    font-weight: 600;
    transition: transform 0.2s;
  }
  
  .retry-button:hover,
  .clear-search-button:hover {
    transform: translateY(-2px);
  }
  
  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .component-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .component-card:hover {
    border-color: #BF953F;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(191, 149, 63, 0.2);
  }
  
  .component-card.selected {
    border-color: #10b981;
    background: linear-gradient(to bottom, rgba(16, 185, 129, 0.05), white);
  }
  
  /* Letter bead specific styling */
  .component-card.letter-bead {
    border-color: #8B5CF6;
  }
  
  .component-card.letter-bead:hover {
    border-color: #7C3AED;
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
  }
  
  .component-card.letter-bead.selected {
    border-color: #7C3AED;
    background: linear-gradient(to bottom, rgba(139, 92, 246, 0.05), white);
  }
  
  .component-image-wrapper {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
    border-radius: 0.5rem;
    padding: 0.5rem;
    position: relative;
  }
  
  .component-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    /* Optimize image rendering */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* Letter overlay for letter beads */
  .letter-overlay {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background: linear-gradient(135deg, #8B5CF6, #A855F7);
    color: white;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.75rem;
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
    z-index: 10;
  }
  
  .letter-character {
    font-family: 'MakabiYG', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
  }
  
  /* Loading state for images */
  .component-image[loading="lazy"] {
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
  
  .component-info {
    width: 100%;
  }
  
  .component-name {
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
  }
  
  .component-details {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0 0 0.5rem 0;
  }
  
  .letter-info {
    font-size: 0.8rem;
    color: #8B5CF6;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .component-price {
    font-weight: 700;
    color: #BF953F;
    margin: 0;
    font-size: 1rem;
  }
  
  .selected-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #10b981;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: bold;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 2px solid #f3e8ff;
    text-align: center;
  }
  
  .results-count {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .modal-backdrop {
      padding: 0;
      align-items: flex-end;
    }
    
    .modal-content {
      max-height: 90vh;
      border-radius: 1rem 1rem 0 0;
      max-width: 100%;
    }
    
    .modal-header {
      padding: 1rem;
      position: sticky;
      top: 0;
      background: white;
      z-index: 10;
    }
    
    .modal-header h3 {
      font-size: 1.25rem;
    }
    
    .filters-section {
      padding: 1rem;
      position: sticky;
      top: 60px;
      background: white;
      z-index: 9;
    }
    
    .letter-beads-toggle {
      margin-top: 0.5rem;
    }
    
    .toggle-label {
      font-size: 0.8rem;
    }
    
    .search-input {
      font-size: 16px; /* Prevents zoom on iOS */
    }
    
    .modal-body {
      padding: 1rem;
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .components-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }
    
    .component-card {
      padding: 0.75rem;
      min-height: 180px;
    }
    
    .letter-overlay {
      width: 1.25rem;
      height: 1.25rem;
      top: 0.125rem;
      right: 0.125rem;
    }
    
    .letter-character {
      font-size: 0.625rem;
    }
    
    .component-card:active {
      transform: scale(0.98);
    }
    
    .type-filters {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    
    .type-filters::-webkit-scrollbar {
      display: none;
    }
    
    .type-filter {
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .current-selection {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .remove-button {
      width: 100%;
    }
  }
  
  @media (max-width: 480px) {
    .components-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .component-name {
      font-size: 0.85rem;
    }
    
    .component-details {
      font-size: 0.75rem;
    }
    
    .letter-info {
      font-size: 0.7rem;
    }
  }
</style>
