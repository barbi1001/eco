<script lang="ts">
  import { validateCustomText, isTextSupported } from '$lib/utils/braceletCalculations.js';
  import type { ValidationResult, JewelryComponent, LetterBeadPosition } from '$lib/types/jewelry.js';

  interface Props {
    customText?: string;
    maxLength?: number;
    availableSpace?: number;
    letterBeadComponents?: Map<string, JewelryComponent>;
    onTextChange?: (text: string) => void;
    onApply?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onValidationChange?: (isValid: boolean, errors: string[]) => void;
    onLetterBeadPreview?: (positions: LetterBeadPosition[]) => void;
    disabled?: boolean;
  }

  let { 
    customText = '',
    maxLength = 20,
    availableSpace = 0,
    letterBeadComponents = new Map(),
    onTextChange,
    onApply,
    onFocus,
    onBlur,
    onValidationChange,
    onLetterBeadPreview,
    disabled = false
  }: Props = $props();

  // Internal state
  let inputText = $state(customText);
  let validationResult = $state<ValidationResult>({ isValid: true, errors: [] });
  let letterBeadPreview = $state<LetterBeadPosition[]>([]);
  let showPreview = $state(false);
  let inputElement = $state<HTMLInputElement>();
  
  // Sync with prop changes (only when not focused)
  let isInputFocused = $state(false);
  
  $effect(() => {
    // Only sync from prop if input is not focused
    if (!isInputFocused && customText !== inputText) {
      inputText = customText;
    }
  });

  // Character count and validation
  let characterCount = $derived(inputText.length);
  let remainingChars = $derived(maxLength - characterCount);
  let isValid = $derived(validationResult.isValid && characterCount <= maxLength);

  $effect(() => {
    // Validate text
    validationResult = validateCustomText(inputText);
    
    // Additional validation for available space
    if (availableSpace > 0 && inputText.length > availableSpace) {
      validationResult = {
        isValid: false,
        errors: [...validationResult.errors, `הטקסט ארוך מדי עבור הצמיד (מקסימום ${availableSpace} תווים)`]
      };
    }

    // Generate letter bead preview
    if (inputText && letterBeadComponents.size > 0) {
      letterBeadPreview = generateLetterBeadPreview(inputText, letterBeadComponents);
      onLetterBeadPreview?.(letterBeadPreview);
    } else {
      letterBeadPreview = [];
      onLetterBeadPreview?.([]);
    }

    // Notify parent of validation changes
    onValidationChange?.(validationResult.isValid, validationResult.errors);
  });

  function generateLetterBeadPreview(text: string, components: Map<string, JewelryComponent>): LetterBeadPosition[] {
    if (!text) return [];

    return text.split('').map((letter, index) => ({
      letter,
      componentId: getLetterBeadId(letter, components),
      positionIndex: index
    }));
  }

  function getLetterBeadId(letter: string, components: Map<string, JewelryComponent>): string {
    const letterLower = letter.toLowerCase();
    const letterBeadName = `${letterLower}-letter`;
    
    // Try to find by exact letter name first (with or without isLetterBead flag)
    const exactMatch = Array.from(components.values()).find(c => 
      c.name === letterBeadName || c.name === `${letter}-letter`
    );
    
    if (exactMatch) return exactMatch.id;

    // Try to find by letter value
    const letterMatch = Array.from(components.values()).find(c => 
      c.isLetterBead && c.letterValue === letterLower
    );
    
    if (letterMatch) return letterMatch.id;
    
    // Fallback: try to find by name pattern (for cases where isLetterBead is not set)
    const patternMatch = Array.from(components.values()).find(c => {
      if (!c.name) return false;
      // Check if name matches pattern like "t-letter" or "א-letter"
      const nameLower = c.name.toLowerCase();
      return nameLower === letterBeadName || 
             nameLower === `${letter}-letter` ||
             (nameLower.includes('-letter') && nameLower.startsWith(letterLower));
    });
    
    return patternMatch?.id || '';
  }

  function handleTextInput(event: Event) {
    if (disabled) return;
    
    const target = event.target as HTMLInputElement;
    const newText = target.value;
    
    // Filter out unsupported characters in real-time
    const filteredText = filterSupportedCharacters(newText);
    
    if (filteredText !== newText) {
      target.value = filteredText;
    }
    
    inputText = filteredText;
    // Only notify parent of text change (for preview), not apply to store
    onTextChange?.(filteredText);
  }
  
  function handleApply() {
    if (disabled) return;
    onApply?.();
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleApply();
    }
  }

  function filterSupportedCharacters(text: string): string {
    // Allow English letters (a-z, A-Z), Hebrew letters (א-ת), and spaces
    return text.replace(/[^a-zA-Z\u0590-\u05FF\s]/g, '');
  }

  function handleTextPaste(event: ClipboardEvent) {
    if (disabled) return;
    
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const filteredText = filterSupportedCharacters(pastedText);
    const truncatedText = filteredText.slice(0, maxLength);
    
    inputText = truncatedText;
    onTextChange?.(truncatedText);
    
    if (inputElement) {
      inputElement.value = truncatedText;
    }
  }

  function clearText() {
    if (disabled) return;
    
    inputText = '';
    onTextChange?.('');
    inputElement?.focus();
  }

  function togglePreview() {
    showPreview = !showPreview;
  }

  // Get missing letter beads for display
  function getMissingLetterBeads(): string[] {
    if (!inputText) return [];
    
    const uniqueLetters = [...new Set(inputText.toLowerCase().split('').filter(c => c.trim()))];
    return uniqueLetters.filter(letter => {
      const beadId = getLetterBeadId(letter, letterBeadComponents);
      return !beadId;
    });
  }

  let missingLetterBeads = $derived(getMissingLetterBeads());
  let hasAllLetterBeads = $derived(missingLetterBeads.length === 0);

  // Language detection
  function detectLanguage(text: string): 'hebrew' | 'english' | 'mixed' {
    const hebrewChars = text.match(/[\u0590-\u05FF]/g)?.length || 0;
    const englishChars = text.match(/[a-zA-Z]/g)?.length || 0;
    
    if (hebrewChars > 0 && englishChars > 0) return 'mixed';
    if (hebrewChars > 0) return 'hebrew';
    if (englishChars > 0) return 'english';
    return 'english';
  }

  let detectedLanguage = $derived(detectLanguage(inputText));
</script>

<div class="text-input-interface">
  <div class="input-header">
    <h3 class="input-title">הוסיפי טקסט אישי לצמיד</h3>
    <p class="input-subtitle">הזיני טקסט באנגלית או בעברית עד {maxLength} תווים</p>
  </div>

  <!-- Text input field -->
  <div class="input-container">
    <div class="input-wrapper" class:error={!isValid}>
      <input
        bind:this={inputElement}
        type="text"
        class="text-input"
        class:error={!isValid}
        class:hebrew={detectedLanguage === 'hebrew'}
        class:mixed={detectedLanguage === 'mixed'}
        value={inputText}
        oninput={handleTextInput}
        onpaste={handleTextPaste}
        onkeydown={handleKeyDown}
        onfocus={() => {
          isInputFocused = true;
          onFocus?.();
        }}
        onblur={() => {
          setTimeout(() => {
            isInputFocused = false;
            onBlur?.();
          }, 200);
        }}
        placeholder="הזיני את הטקסט שלך כאן..."
        maxlength={maxLength}
        {disabled}
        dir="auto"
      />
      
      {#if inputText}
        <button
          class="clear-button"
          onclick={clearText}
          {disabled}
          type="button"
          aria-label="נקה טקסט"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      {/if}
      
      <button
        class="apply-button"
        onclick={handleApply}
        {disabled}
        type="button"
        aria-label="החל טקסט"
        title="החל טקסט ויצור חרוזי אותיות"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        החל
      </button>
    </div>

    <!-- Character counter -->
    <div class="character-counter">
      <span class="counter-text" class:warning={remainingChars <= 5} class:error={remainingChars < 0}>
        {characterCount}/{maxLength}
      </span>
      {#if remainingChars <= 5 && remainingChars >= 0}
        <span class="counter-warning">נותרו {remainingChars} תווים</span>
      {:else if remainingChars < 0}
        <span class="counter-error">חריגה של {Math.abs(remainingChars)} תווים</span>
      {/if}
    </div>
  </div>

  <!-- Language indicator -->
  {#if inputText}
    <div class="language-indicator">
      <span class="language-label">שפה מזוהה:</span>
      <span class="language-value" class:mixed={detectedLanguage === 'mixed'}>
        {#if detectedLanguage === 'hebrew'}
          עברית
        {:else if detectedLanguage === 'english'}
          אנגלית
        {:else}
          מעורבת (עברית ואנגלית)
        {/if}
      </span>
    </div>
  {/if}

  <!-- Validation errors -->
  {#if !validationResult.isValid && validationResult.errors.length > 0}
    <div class="error-messages">
      {#each validationResult.errors as error}
        <div class="error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          {error}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Missing letter beads warning -->
  {#if inputText && !hasAllLetterBeads}
    <div class="missing-beads-warning">
      <div class="warning-header">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <span>חסרים חרוזי אותיות</span>
      </div>
      <p class="warning-text">
        האותיות הבאות לא זמינות כחרוזים: 
        <strong>{missingLetterBeads.join(', ')}</strong>
      </p>
      <p class="warning-suggestion">
        אנא בחרי טקסט אחר או פני למנהל המערכת להוספת החרוזים החסרים.
      </p>
    </div>
  {/if}

  <!-- Letter bead preview -->
  {#if inputText && hasAllLetterBeads}
    <div class="preview-section">
      <div class="preview-header">
        <button
          class="preview-toggle"
          onclick={togglePreview}
          type="button"
          aria-expanded={showPreview}
        >
          <span class="preview-icon" class:rotated={showPreview}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </span>
          תצוגה מקדימה של חרוזי האותיות
        </button>
      </div>

      {#if showPreview}
        <div class="preview-content">
          <div class="letter-beads-preview">
            {#each letterBeadPreview as position, index (position.positionIndex)}
              {@const component = letterBeadComponents.get(position.componentId)}
              <div class="letter-bead-item" class:missing={!component}>
                {#if component}
                  <div class="bead-visual">
                    {@html component.svgElement}
                  </div>
                  <span class="bead-letter">{position.letter}</span>
                {:else}
                  <div class="bead-visual missing">
                    <div class="missing-bead">?</div>
                  </div>
                  <span class="bead-letter missing">{position.letter}</span>
                {/if}
              </div>
            {/each}
          </div>
          
          <div class="preview-info">
            <p class="preview-stats">
              <strong>{letterBeadPreview.length}</strong> חרוזי אותיות
              {#if availableSpace > 0}
                • <strong>{availableSpace - letterBeadPreview.length}</strong> מקומות פנויים
              {/if}
            </p>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Text input tips -->
  <div class="input-tips">
    <details class="tips-details">
      <summary class="tips-summary">
        <span class="tips-icon">💡</span>
        טיפים לטקסט אישי
      </summary>
      <div class="tips-content">
        <ul class="tips-list">
          <li>ניתן להשתמש באותיות עבריות ואנגליות</li>
          <li>רווחים מותרים בין מילים</li>
          <li>אותיות מיוחדות ומספרים לא נתמכים</li>
          <li>הטקסט יוצב במרכז הצמיד</li>
          <li>אורך מקסימלי: {maxLength} תווים</li>
        </ul>
      </div>
    </details>
  </div>
</div>

<style>
  .text-input-interface {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .input-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .input-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    font-family: inherit;
  }

  .input-subtitle {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
    font-family: inherit;
  }

  .input-container {
    margin-bottom: 20px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-wrapper.error {
    animation: shake 0.3s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .text-input {
    width: 100%;
    padding: 16px 120px 16px 16px;
    border: 2px solid #e5e5e5;
    border-radius: 12px;
    font-size: 1.125rem;
    font-family: inherit;
    transition: all 0.2s ease;
    background: white;
    line-height: 1.4;
  }

  .text-input:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }

  .text-input.error {
    border-color: #ef4444;
  }

  .text-input.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .text-input.hebrew {
    direction: rtl;
    text-align: right;
  }

  .text-input.mixed {
    direction: ltr;
    text-align: left;
  }

  .text-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f9fafb;
  }

  .clear-button {
    position: absolute;
    right: 60px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-button:hover:not(:disabled) {
    color: #374151;
    background: #f3f4f6;
  }

  .clear-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .apply-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
    border: none;
    color: white;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: inherit;
    box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
  }

  .apply-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #c9a030 0%, #e6d495 100%);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.4);
    transform: translateY(-50%) scale(1.05);
  }

  .apply-button:active:not(:disabled) {
    transform: translateY(-50%) scale(0.98);
  }

  .apply-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translateY(-50%);
  }

  .character-counter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    font-size: 0.875rem;
  }

  .counter-text {
    color: #6b7280;
    font-weight: 500;
  }

  .counter-text.warning {
    color: #f59e0b;
  }

  .counter-text.error {
    color: #ef4444;
  }

  .counter-warning {
    color: #f59e0b;
    font-size: 0.75rem;
  }

  .counter-error {
    color: #ef4444;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .language-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 8px 12px;
    background: #f0f9ff;
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .language-label {
    color: #0369a1;
    font-weight: 500;
  }

  .language-value {
    color: #0c4a6e;
    font-weight: 600;
  }

  .language-value.mixed {
    color: #7c2d12;
  }

  .error-messages {
    margin-bottom: 16px;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }

  .error-message:last-child {
    margin-bottom: 0;
  }

  .missing-beads-warning {
    margin-bottom: 20px;
    padding: 16px;
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 12px;
  }

  .warning-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #92400e;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .warning-text {
    color: #92400e;
    font-size: 0.875rem;
    margin: 0 0 8px 0;
  }

  .warning-suggestion {
    color: #78350f;
    font-size: 0.8rem;
    margin: 0;
    font-style: italic;
  }

  .preview-section {
    margin-bottom: 20px;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
  }

  .preview-header {
    background: #f9fafb;
    border-bottom: 1px solid #e5e5e5;
  }

  .preview-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    font-family: inherit;
    transition: background 0.2s ease;
  }

  .preview-toggle:hover {
    background: #f3f4f6;
  }

  .preview-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  }

  .preview-icon.rotated {
    transform: rotate(180deg);
  }

  .preview-content {
    padding: 16px;
    background: white;
  }

  .letter-beads-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-bottom: 16px;
    padding: 16px;
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%);
    border-radius: 8px;
  }

  .letter-bead-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .bead-visual {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
  }

  .bead-visual.missing {
    background: #f3f4f6;
    border: 2px dashed #d1d5db;
  }

  .missing-bead {
    color: #9ca3af;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .bead-letter {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
  }

  .bead-letter.missing {
    color: #9ca3af;
  }

  .preview-info {
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
  }

  .preview-stats {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
  }

  .input-tips {
    margin-top: 20px;
  }

  .tips-details {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    overflow: hidden;
  }

  .tips-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    font-family: inherit;
    list-style: none;
  }

  .tips-summary::-webkit-details-marker {
    display: none;
  }

  .tips-summary::marker {
    display: none;
  }

  .tips-icon {
    font-size: 1rem;
  }

  .tips-content {
    padding: 16px;
    background: white;
    border-top: 1px solid #e5e5e5;
  }

  .tips-list {
    margin: 0;
    padding-right: 20px;
    color: #4b5563;
    font-size: 0.875rem;
    font-family: inherit;
  }

  .tips-list li {
    margin-bottom: 4px;
  }

  /* RTL support */
  [dir="rtl"] .clear-button {
    right: auto;
    left: 60px;
  }

  [dir="rtl"] .apply-button {
    right: auto;
    left: 12px;
  }

  [dir="rtl"] .text-input {
    padding: 16px 16px 16px 120px;
  }

  [dir="rtl"] .tips-list {
    padding-right: 0;
    padding-left: 20px;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .text-input-interface {
      padding: 20px;
    }

    .text-input {
      font-size: 1rem;
      padding: 14px 44px 14px 14px;
    }

    .input-title {
      font-size: 1.125rem;
    }

    .letter-beads-preview {
      gap: 6px;
      padding: 12px;
    }

    .bead-visual {
      width: 28px;
      height: 28px;
    }

    .character-counter {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }

  @media (max-width: 480px) {
    .text-input {
      font-size: 16px; /* Prevents zoom on iOS */
    }

    .letter-beads-preview {
      gap: 4px;
      padding: 8px;
    }

    .bead-visual {
      width: 24px;
      height: 24px;
    }

    .bead-letter {
      font-size: 0.7rem;
    }
  }
</style>