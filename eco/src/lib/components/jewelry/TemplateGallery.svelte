<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  // Import stores and types
  import { 
    availableTemplates, 
    isLoadingTemplates,
    jewelryDesignerActions 
  } from '$lib/stores/jewelryDesigner';
  import type { JewelryTemplate, JewelryDesignerError } from '$lib/types/jewelry';
  
  // Import API and components
  import { templatesApi } from '$lib/api/strapiClient';
  import { parseRichText } from '$lib/utils/jewelryHelpers';
  import SkeletonLoader from './SkeletonLoader.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  
  // Component props
  interface Props {
    onTemplateSelect?: (template: JewelryTemplate) => void;
    onError?: (error: JewelryDesignerError) => void;
  }
  
  let { onTemplateSelect, onError }: Props = $props();
  
  // Component state
  let loadingError = $state<JewelryDesignerError | null>(null);
  let retryCount = $state(0);
  let maxRetries = 3;
  let selectedCategory = $state<string>('all');
  
  // Filtered templates based on category selection
  let filteredTemplates = $derived(
    selectedCategory === 'all' 
      ? $availableTemplates 
      : $availableTemplates.filter(template => template.category === selectedCategory)
  );
  $effect(()=>{
    console.log($availableTemplates)
  })
  // Load templates on mount
  onMount(() => {
    loadTemplates();
  });
  
  /**
   * Load templates from Strapi with error handling
   */
  async function loadTemplates() {
    loadingError = null;
    isLoadingTemplates.set(true);
    
    try {
      const templates = await templatesApi.getAll();
      
      if (templates.length === 0) {
        throw new Error('לא נמצאו תבניות זמינות כרגע');
      }
      
      availableTemplates.set(templates);
      retryCount = 0; // Reset retry count on success
      
    } catch (error) {
      console.error('Failed to load templates:', error);
      
      const jewelryError: JewelryDesignerError = {
        type: 'network',
        message: getErrorMessage(error),
        details: {
          originalError: error,
          retryCount,
          timestamp: new Date().toISOString()
        }
      };
      
      loadingError = jewelryError;
      onError?.(jewelryError);
      
    } finally {
      isLoadingTemplates.set(false);
    }
  }
  
  /**
   * Get user-friendly error message
   */
  function getErrorMessage(error: any): string {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'בעיית חיבור לאינטרנט. אנא בדקי את החיבור ונסי שוב.';
    }
    
    if (error.message?.includes('404')) {
      return 'השירות אינו זמין כרגע. אנא נסי שוב מאוחר יותר.';
    }
    
    if (error.message?.includes('500')) {
      return 'שגיאת שרת. אנא נסי שוב בעוד כמה רגעים.';
    }
    
    if (typeof error.message === 'string') {
      return error.message;
    }
    
    return 'אירעה שגיאה בטעינת התבניות. אנא נסי שוב.';
  }
  
  /**
   * Handle template selection
   */
  function handleTemplateSelect(template: JewelryTemplate) {
    jewelryDesignerActions.selectTemplate(template);
    onTemplateSelect?.(template);
  }
  
  /**
   * Handle retry button click
   */
  function handleRetry() {
    if (retryCount < maxRetries) {
      retryCount++;
      loadTemplates();
    } else {
      const maxRetriesError: JewelryDesignerError = {
        type: 'network',
        message: 'מספר הניסיונות המקסימלי הושג. אנא רענני את הדף ונסי שוב.',
        details: { maxRetries, retryCount }
      };
      
      loadingError = maxRetriesError;
      onError?.(maxRetriesError);
    }
  }
  
  /**
   * Format price for display
   */
  function formatPrice(price: number): string {
    return `₪${price.toLocaleString('he-IL')}`;
  }
  
  /**
   * Get category display name in Hebrew
   */
  function getCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      'necklace': 'שרשרת',
      'earrings': 'עגילים',
      'bracelet': 'צמיד',
      'ring': 'טבעת'
    };
    
    return categoryNames[category] || category;
  }
  
  /**
   * Get available categories from templates
   */
  function getAvailableCategories(): Array<{value: string, label: string, count: number}> {
    const categories = [
      { value: 'all', label: 'הכל', count: $availableTemplates.length }
    ];
    
    const categoryCounts: Record<string, number> = {};
    $availableTemplates.forEach(template => {
      categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categories.push({
        value: category,
        label: getCategoryName(category),
        count
      });
    });
    
    return categories;
  }
  
  /**
   * Check if template is a bracelet
   */
  function isBraceletTemplate(template: JewelryTemplate): boolean {
    return template.isBracelet === true || template.category === 'bracelet';
  }
  
  /**
   * Get bracelet-specific preview information
   */
  function getBraceletInfo(template: JewelryTemplate): string | null {
    if (!isBraceletTemplate(template)) return null;
    
    // Count bead positions for bracelet preview
    const beadPositions = template.positions.filter(pos => pos.type === 'bead').length;
    if (beadPositions > 0) {
      return `מתאים עד ${beadPositions} חרוזים`;
    }
    
    return 'צמיד מותאם אישית';
  }
</script>

<div class="template-gallery-container" dir="rtl">
  <div class="gallery-header">
    <h2 class="gallery-title">בחירת תבנית</h2>
    <p class="gallery-subtitle">בחרי תבנית בסיס לתכשיט שלך</p>
  </div>
  
  <!-- Category Filter -->
  {#if $availableTemplates.length > 0}
    <div class="category-filter" in:fly={{ y: -20, duration: 400, easing: quintOut }}>
      <div class="filter-buttons">
        {#each getAvailableCategories() as category}
          <button 
            class="filter-button {selectedCategory === category.value ? 'active' : ''}"
            onclick={() => selectedCategory = category.value}
          >
            {category.label}
            <span class="category-count">({category.count})</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <div class="gallery-content">
    {#if $isLoadingTemplates}
      <!-- Loading State with Skeleton Loaders -->
      <div 
        class="loading-state"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 300 }}
      >
        <div class="templates-grid">
          <SkeletonLoader count={6} type="template" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
        </div>
        <div class="loading-text">
          <div class="loading-spinner"></div>
          <p>טוען תבניות...</p>
        </div>
      </div>
      
    {:else if loadingError}
      <!-- Error State -->
      <div 
        class="error-state"
        in:fly={{ y: 20, duration: 400, easing: quintOut }}
        out:fade={{ duration: 300 }}
      >
        <ErrorMessage 
          error={loadingError}
          showRetry={retryCount < maxRetries}
          showDetails={false}
          onRetry={handleRetry}
          onDismiss={() => loadingError = null}
        />
        
        {#if retryCount >= maxRetries}
          <div class="max-retries-message">
            <p>נסי לרענן את הדף או לחזור מאוחר יותר</p>
            <button 
              class="refresh-button"
              onclick={() => window.location.reload()}
            >
              רענן דף
            </button>
          </div>
        {/if}
      </div>
      
    {:else if $availableTemplates.length === 0}
      <!-- Empty State -->
      <div 
        class="empty-state"
        in:fly={{ y: 20, duration: 400, easing: quintOut }}
      >
        <div class="empty-icon">🎨</div>
        <h3>אין תבניות זמינות</h3>
        <p>כרגע אין תבניות זמינות. אנא נסי שוב מאוחר יותר.</p>
        <button 
          class="retry-button"
          onclick={() => loadTemplates()}
        >
          נסה שוב
        </button>
      </div>
      
    {:else}
      <!-- Templates Grid -->
      <div 
        class="templates-grid"
        in:fly={{ y: 20, duration: 600, easing: quintOut }}
      >
        {#each filteredTemplates as template, index}
          <div 
            class="template-card {isBraceletTemplate(template) ? 'bracelet-template' : ''}"
            in:fly={{ 
              y: 30, 
              duration: 400, 
              delay: index * 100,
              easing: quintOut 
            }}
            out:fade={{ duration: 200 }}
          >
            <div class="template-image-container">
              {#if isBraceletTemplate(template)}
                <div class="bracelet-badge">
                  <span class="bracelet-icon">📿</span>
                  <span class="bracelet-text">צמיד</span>
                </div>
              {/if}
              
              <img 
                src={template.previewImage} 
                alt={template.name}
                class="template-image"
                loading="lazy"
                decoding="async"
                onerror={(e) => {
                  // Handle image loading errors
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/images/placeholder-jewelry.svg';
                }}
              />
              <div class="template-overlay">
                <button 
                  class="select-button"
                  onclick={() => handleTemplateSelect(template)}
                >
                  בחר תבנית זו
                </button>
              </div>
            </div>
            
            <div class="template-info">
              <h3 class="template-name">{template.name}</h3>
              <p class="template-category">{getCategoryName(template.category)}</p>
              
              {#if isBraceletTemplate(template)}
                <div class="bracelet-info">
                  <span class="bracelet-info-icon">ℹ️</span>
                  <span class="bracelet-info-text">{getBraceletInfo(template)}</span>
                </div>
              {/if}
              
              <div class="template-price">
                <span class="price-label">מחיר בסיס:</span>
                <span class="price-value">{formatPrice(template.basePrice)}</span>
              </div>
              
              {#if template.description}
                <p class="template-description">{parseRichText(template.description)}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .template-gallery-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .gallery-header {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .gallery-title {
    font-family: 'MakabiYG', sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  .gallery-subtitle {
    font-size: 1.2rem;
    color: #6b7280;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .gallery-content {
    width: 100%;
  }
  
  /* Category Filter */
  .category-filter {
    margin-bottom: 2rem;
    display: flex;
    justify-content: center;
  }
  
  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .filter-button {
    background: white;
    border: 2px solid #e5e7eb;
    color: #6b7280;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .filter-button:hover {
    border-color: #BF953F;
    color: #BF953F;
  }
  
  .filter-button.active {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    border-color: #BF953F;
    color: #374151;
    font-weight: 600;
  }
  
  .category-count {
    font-size: 0.75rem;
    opacity: 0.8;
  }
  
  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .loading-text {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #6b7280;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #BF953F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  
  .max-retries-message {
    text-align: center;
    padding: 1.5rem;
    background: #fef3cd;
    border: 1px solid #f59e0b;
    border-radius: 0.5rem;
    color: #92400e;
  }
  
  .max-retries-message p {
    margin-bottom: 1rem;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .refresh-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    font-weight: 600;
    padding: 0.5rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    transition: all 0.3s ease;
  }
  
  .refresh-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(191, 149, 63, 0.3);
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;
  }
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .empty-state p {
    font-size: 1rem;
    margin-bottom: 2rem;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .retry-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    font-weight: 600;
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    transition: all 0.3s ease;
  }
  
  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(191, 149, 63, 0.3);
  }
  
  /* Templates Grid */
  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    width: 100%;
  }
  
  .template-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .template-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    border-color: #BF953F;
  }
  
  /* Bracelet-specific styling */
  .template-card.bracelet-template {
    border-color: #8B5CF6;
  }
  
  .template-card.bracelet-template:hover {
    border-color: #7C3AED;
    box-shadow: 0 12px 24px rgba(139, 92, 246, 0.15);
  }
  
  .bracelet-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: linear-gradient(135deg, #8B5CF6, #A855F7);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: 'MakabiYG', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  }
  
  .bracelet-icon {
    font-size: 0.875rem;
  }
  
  .bracelet-text {
    font-size: 0.75rem;
  }
  
  .template-image-container {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
  }
  
  .template-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    /* Optimize image rendering */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
  
  /* Progressive loading shimmer effect */
  .template-image[loading="lazy"] {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: imageShimmer 1.5s infinite;
  }
  
  @keyframes imageShimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .template-card:hover .template-image {
    transform: scale(1.05);
  }
  
  .template-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .template-card:hover .template-overlay {
    opacity: 1;
  }
  
  .select-button {
    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728);
    color: #374151;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'MakabiYG', sans-serif;
    transform: translateY(10px);
    transition: transform 0.3s ease;
  }
  
  .template-card:hover .select-button {
    transform: translateY(0);
  }
  
  .template-info {
    padding: 1.5rem;
  }
  
  .template-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .template-category {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .bracelet-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: linear-gradient(135deg, #F3E8FF, #EDE9FE);
    border-radius: 0.375rem;
    border: 1px solid #C4B5FD;
  }
  
  .bracelet-info-icon {
    font-size: 0.875rem;
  }
  
  .bracelet-info-text {
    font-size: 0.875rem;
    color: #7C3AED;
    font-weight: 500;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .template-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }
  
  .price-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .price-value {
    font-size: 1rem;
    font-weight: 600;
    color: #BF953F;
    font-family: 'MakabiYG', sans-serif;
  }
  
  .template-description {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.4;
    font-family: 'MakabiYG', sans-serif;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .template-gallery-container {
      padding: 1rem;
    }
    
    .gallery-title {
      font-size: 2rem;
    }
    
    .gallery-subtitle {
      font-size: 1rem;
    }
    
    .category-filter {
      margin-bottom: 1.5rem;
    }
    
    .filter-buttons {
      gap: 0.25rem;
    }
    
    .filter-button {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
    
    .templates-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .template-image-container {
      height: 180px;
    }
    
    .template-info {
      padding: 1rem;
    }
    
    .template-overlay {
      opacity: 1;
      background: rgba(0, 0, 0, 0.4);
    }
    
    .select-button {
      transform: translateY(0);
    }
    
    .bracelet-badge {
      top: 0.25rem;
      right: 0.25rem;
      padding: 0.125rem 0.375rem;
      font-size: 0.625rem;
    }
    
    .bracelet-icon {
      font-size: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    .gallery-header {
      margin-bottom: 2rem;
    }
    
    .gallery-title {
      font-size: 1.75rem;
    }
    
    .template-image-container {
      height: 160px;
    }
  }
</style>