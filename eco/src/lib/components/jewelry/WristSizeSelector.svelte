<script lang="ts">
  import { validateWristSize } from '$lib/utils/braceletCalculations.js';
  import type { ValidationResult } from '$lib/types/jewelry.js';

  interface Props {
    selectedSize?: number;
    onSizeChange?: (size: number) => void;
    onValidationChange?: (isValid: boolean, errors: string[]) => void;
    disabled?: boolean;
  }

  let { 
    selectedSize = 17, 
    onSizeChange, 
    onValidationChange,
    disabled = false 
  }: Props = $props();

  // Popular wrist sizes in centimeters
  const popularSizes = [16, 17, 18, 19, 20];
  
  // State for custom size input
  let customSize = $state('');
  let showCustomInput = $state(false);
  let validationResult = $state<ValidationResult>({ isValid: true, errors: [] });
  let isCustomSizeSelected = $state(false);

  // Derived validation state
  let currentSize = $derived(isCustomSizeSelected ? parseFloat(customSize) || 0 : selectedSize);
  let isValid = $derived(validationResult.isValid && currentSize > 0);

  // Update validation when size changes
  $effect(() => {
    if (currentSize > 0) {
      validationResult = validateWristSize(currentSize);
      onValidationChange?.(validationResult.isValid, validationResult.errors);
    }
  });

  function handlePopularSizeClick(size: number) {
    if (disabled) return;
    
    isCustomSizeSelected = false;
    showCustomInput = false;
    customSize = '';
    onSizeChange?.(size);
  }

  function handleCustomSizeToggle() {
    if (disabled) return;
    
    showCustomInput = !showCustomInput;
    if (showCustomInput) {
      customSize = selectedSize.toString();
      isCustomSizeSelected = true;
    } else {
      isCustomSizeSelected = false;
      customSize = '';
    }
  }

  function handleCustomSizeInput(event: Event) {
    if (disabled) return;
    
    const target = event.target as HTMLInputElement;
    customSize = target.value;
    
    const numericSize = parseFloat(customSize);
    if (!isNaN(numericSize) && numericSize > 0) {
      isCustomSizeSelected = true;
      onSizeChange?.(numericSize);
    }
  }

  function handleCustomSizeBlur() {
    const numericSize = parseFloat(customSize);
    if (isNaN(numericSize) || numericSize <= 0) {
      // Reset to last valid size if invalid input
      customSize = selectedSize.toString();
      isCustomSizeSelected = false;
      showCustomInput = false;
    }
  }
</script>

<div class="wrist-size-selector">
  <div class="selector-header">
    <h3 class="selector-title">בחרי את היקף הפרק שלך</h3>
    <p class="selector-subtitle">גדלים פופולריים או הזיני גודל מותאם אישית</p>
  </div>

  <!-- Popular sizes -->
  <div class="popular-sizes">
    {#each popularSizes as size}
      <button
        class="size-button"
        class:selected={!isCustomSizeSelected && selectedSize === size}
        class:disabled
        onclick={() => handlePopularSizeClick(size)}
        {disabled}
        type="button"
      >
        <span class="size-value">{size}</span>
        <span class="size-unit">ס"מ</span>
      </button>
    {/each}
  </div>

  <!-- Custom size toggle -->
  <div class="custom-size-section">
    <button
      class="custom-toggle"
      class:active={showCustomInput}
      class:disabled
      onclick={handleCustomSizeToggle}
      {disabled}
      type="button"
    >
      <span class="toggle-icon">
        {#if showCustomInput}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" transform="rotate(45 8 8)"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
        {/if}
      </span>
      גודל מותאם אישית
    </button>

    {#if showCustomInput}
      <div class="custom-input-container">
        <div class="input-wrapper">
          <input
            type="number"
            class="custom-input"
            class:error={!validationResult.isValid}
            bind:value={customSize}
            oninput={handleCustomSizeInput}
            onblur={handleCustomSizeBlur}
            placeholder="הזיני גודל"
            min="12"
            max="25"
            step="0.1"
            {disabled}
          />
          <span class="input-unit">ס"מ</span>
        </div>
        
        {#if !validationResult.isValid && validationResult.errors.length > 0}
          <div class="error-messages">
            {#each validationResult.errors as error}
              <p class="error-message">{error}</p>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Size guide -->
  <div class="size-guide">
    <details class="guide-details">
      <summary class="guide-summary">
        <span class="guide-icon">📏</span>
        איך למדוד את היקף הפרק?
      </summary>
      <div class="guide-content">
        <ol class="guide-steps">
          <li>השתמשי בסרט מדידה או חוט</li>
          <li>כרכי סביב הפרק במקום הצר ביותר</li>
          <li>ודאי שהמדידה לא חזקה מדי או רפויה מדי</li>
          <li>רשמי את המדידה בסנטימטרים</li>
        </ol>
        <div class="guide-tip">
          <strong>טיפ:</strong> הגדלים הפופולריים ביותר הם 17-18 ס"מ
        </div>
      </div>
    </details>
  </div>

  <!-- Current selection display -->
  {#if isValid}
    <div class="selection-display">
      <span class="selection-label">גודל נבחר:</span>
      <span class="selection-value">{currentSize.toFixed(1)} ס"מ</span>
    </div>
  {/if}
</div>

<style>
  .wrist-size-selector {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .selector-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .selector-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #831843;
    margin: 0 0 8px 0;
    font-family: 'Heebo', sans-serif;
  }

  .selector-subtitle {
    font-size: 0.9rem;
    color: #9d174d;
    font-weight: 500;
    margin: 0;
    font-family: 'Heebo', sans-serif;
  }

  .popular-sizes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .size-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 12px;
    border: 2px solid #fbcfe8;
    border-radius: 12px;
    background: white;
    color: #9d174d;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Heebo', sans-serif;
    font-weight: 700;
    min-height: 70px;
  }

  .size-button:hover:not(.disabled) {
    border-color: #ec4899;
    background: #fdf2f8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
  }

  .size-button.selected {
    border-color: #ec4899;
    background: linear-gradient(135deg, #ec4899 0%, #f9a8d4 45%, #fcf6ba 100%);
    color: #831843;
    font-weight: 800;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35);
  }

  .size-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .size-value {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1;
  }

  .size-unit {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 2px;
  }

  .custom-size-section {
    margin-bottom: 24px;
  }

  .custom-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 16px;
    border: 2px dashed #f9a8d4;
    border-radius: 12px;
    background: transparent;
    color: #9d174d;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Heebo', sans-serif;
    font-size: 0.9rem;
  }

  .custom-toggle:hover:not(.disabled) {
    border-color: #ec4899;
    color: #be185d;
    background: #fdf2f8;
  }

  .custom-toggle.active {
    border-color: #ec4899;
    color: #831843;
    background: #fdf2f8;
    border-style: solid;
  }

  .custom-toggle.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .custom-toggle.active .toggle-icon {
    transform: rotate(45deg);
  }

  .custom-input-container {
    margin-top: 16px;
    padding-left: 24px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .custom-input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 2px solid #fbcfe8;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Heebo', sans-serif;
    font-weight: 600;
    color: #831843;
    transition: border-color 0.2s ease;
    background: white;
  }

  .custom-input:focus {
    outline: none;
    border-color: #ec4899;
    box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.15);
  }

  .custom-input.error {
    border-color: #ef4444;
  }

  .custom-input.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .input-unit {
    position: absolute;
    right: 16px;
    color: #6b7280;
    font-size: 0.875rem;
    pointer-events: none;
  }

  .error-messages {
    margin-top: 8px;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.75rem;
    margin: 0;
    font-family: inherit;
  }

  .size-guide {
    margin-bottom: 20px;
  }

  .guide-details {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  }

  .guide-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fdf2f8;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 700;
    color: #9d174d;
    font-family: 'Heebo', sans-serif;
    list-style: none;
  }

  .guide-summary::-webkit-details-marker {
    display: none;
  }

  .guide-summary::marker {
    display: none;
  }

  .guide-icon {
    font-size: 1rem;
  }

  .guide-content {
    padding: 16px;
    background: white;
    border-top: 1px solid #e5e5e5;
  }

  .guide-steps {
    margin: 0 0 12px 0;
    padding-right: 20px;
    color: #831843;
    font-size: 0.9rem;
    font-family: 'Heebo', sans-serif;
  }

  .guide-steps li {
    margin-bottom: 4px;
  }

  .guide-tip {
    padding: 8px 12px;
    background: linear-gradient(90deg, #fce7f3 0%, #fef3c7 100%);
    border-radius: 6px;
    font-size: 0.8rem;
    color: #9d174d;
    font-weight: 600;
    font-family: 'Heebo', sans-serif;
  }

  .selection-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(135deg, #fdf2f8 0%, #fcf6ba 100%);
    border: 1px solid #fbcfe8;
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: 'Heebo', sans-serif;
  }

  .selection-label {
    color: #9d174d;
    font-weight: 600;
  }

  .selection-value {
    color: #831843;
    font-weight: 800;
  }

  /* RTL support */
  [dir="rtl"] .popular-sizes {
    direction: rtl;
  }

  [dir="rtl"] .custom-input {
    padding: 12px 16px 12px 40px;
  }

  [dir="rtl"] .input-unit {
    right: auto;
    left: 16px;
  }

  [dir="rtl"] .guide-steps {
    padding-right: 0;
    padding-left: 20px;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .wrist-size-selector {
      padding: 20px;
    }

    .popular-sizes {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .size-button {
      padding: 12px 8px;
      min-height: 60px;
    }

    .size-value {
      font-size: 1rem;
    }

    .selector-title {
      font-size: 1.125rem;
    }

    .custom-input-container {
      padding-left: 16px;
    }
  }

  @media (max-width: 480px) {
    .popular-sizes {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>