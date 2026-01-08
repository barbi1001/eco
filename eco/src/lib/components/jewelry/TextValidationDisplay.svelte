<script lang="ts">
  import { 
    validateTextFitRealTime,
    getTextInputRecommendations,
    validateTextAgainstBraceletSpace 
  } from '$lib/utils/braceletCalculations.js';
  import type { 
    JewelryComponent, 
    BraceletConfiguration 
  } from '$lib/types/jewelry.js';

  interface Props {
    customText?: string;
    braceletConfig?: BraceletConfiguration;
    selectedBeads?: JewelryComponent[];
    letterBeadComponents?: Map<string, JewelryComponent>;
    showRecommendations?: boolean;
    showSpaceAnalysis?: boolean;
    onValidationChange?: (isValid: boolean, errors: string[]) => void;
  }

  let { 
    customText = '',
    braceletConfig,
    selectedBeads = [],
    letterBeadComponents = new Map(),
    showRecommendations = true,
    showSpaceAnalysis = true,
    onValidationChange
  }: Props = $props();

  // Validation state
  let validationResult = $state<ReturnType<typeof validateTextFitRealTime> | null>(null);
  let recommendations = $state<ReturnType<typeof getTextInputRecommendations> | null>(null);

  // Update validation when inputs change
  $effect(() => {
    if (braceletConfig && letterBeadComponents.size > 0) {
      validationResult = validateTextFitRealTime(
        customText,
        braceletConfig,
        selectedBeads,
        letterBeadComponents
      );

      recommendations = getTextInputRecommendations(
        braceletConfig,
        selectedBeads,
        letterBeadComponents
      );

      // Notify parent of validation changes
      onValidationChange?.(validationResult.isValid, validationResult.errors);
    } else {
      validationResult = null;
      recommendations = null;
      onValidationChange?.(true, []);
    }
  });

  // Helper functions for display
  function getSpaceStatusColor(percentageUsed: number): string {
    if (percentageUsed > 90) return '#ef4444'; // Red
    if (percentageUsed > 70) return '#f59e0b'; // Orange
    if (percentageUsed > 50) return '#10b981'; // Green
    return '#6b7280'; // Gray
  }

  function getSpaceStatusText(percentageUsed: number): string {
    if (percentageUsed > 90) return 'מלא כמעט';
    if (percentageUsed > 70) return 'מתמלא';
    if (percentageUsed > 50) return 'חצי מלא';
    if (percentageUsed > 20) return 'יש מקום';
    return 'הרבה מקום';
  }
</script>

{#if validationResult}
  <div class="text-validation-display">
    <!-- Validation Status -->
    <div class="validation-status" class:valid={validationResult.isValid} class:invalid={!validationResult.isValid}>
      <div class="status-header">
        <div class="status-icon">
          {#if validationResult.isValid}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          {:else}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          {/if}
        </div>
        <span class="status-text">
          {#if validationResult.isValid}
            הטקסט תקין ומתאים לצמיד
          {:else}
            יש בעיות עם הטקסט
          {/if}
        </span>
      </div>
    </div>

    <!-- Space Analysis -->
    {#if showSpaceAnalysis && validationResult.spaceInfo}
      <div class="space-analysis">
        <h4 class="analysis-title">ניתוח מקום בצמיד</h4>
        
        <div class="space-bar-container">
          <div class="space-bar">
            <div 
              class="space-used" 
              style="width: {Math.min(100, validationResult.spaceInfo.percentageUsed)}%; background-color: {getSpaceStatusColor(validationResult.spaceInfo.percentageUsed)}"
            ></div>
          </div>
          <div class="space-labels">
            <span class="space-label">0</span>
            <span class="space-label">{validationResult.spaceInfo.availableSpace}</span>
          </div>
        </div>

        <div class="space-stats">
          <div class="stat-item">
            <span class="stat-label">אורך הטקסט:</span>
            <span class="stat-value">{validationResult.spaceInfo.textLength}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">מקום זמין:</span>
            <span class="stat-value">{validationResult.spaceInfo.availableSpace}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">נותר:</span>
            <span class="stat-value">{validationResult.spaceInfo.remainingSpace}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">סטטוס:</span>
            <span class="stat-value" style="color: {getSpaceStatusColor(validationResult.spaceInfo.percentageUsed)}">
              {getSpaceStatusText(validationResult.spaceInfo.percentageUsed)}
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Errors -->
    {#if validationResult.errors.length > 0}
      <div class="validation-errors">
        <h4 class="errors-title">שגיאות</h4>
        <ul class="errors-list">
          {#each validationResult.errors as error}
            <li class="error-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              {error}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Warnings -->
    {#if validationResult.warnings.length > 0}
      <div class="validation-warnings">
        <h4 class="warnings-title">אזהרות</h4>
        <ul class="warnings-list">
          {#each validationResult.warnings as warning}
            <li class="warning-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              {warning}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Suggestions -->
    {#if validationResult.suggestions.length > 0}
      <div class="validation-suggestions">
        <h4 class="suggestions-title">הצעות</h4>
        <ul class="suggestions-list">
          {#each validationResult.suggestions as suggestion}
            <li class="suggestion-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {suggestion}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Missing Letter Beads -->
    {#if validationResult.missingLetterBeads.length > 0}
      <div class="missing-beads">
        <h4 class="missing-title">חרוזי אותיות חסרים</h4>
        <div class="missing-letters">
          {#each validationResult.missingLetterBeads as letter}
            <span class="missing-letter">{letter}</span>
          {/each}
        </div>
        <p class="missing-note">
          האותיות הללו לא זמינות כחרוזים. אנא בחרי טקסט אחר או פני למנהל המערכת.
        </p>
      </div>
    {/if}

    <!-- Recommendations -->
    {#if showRecommendations && recommendations}
      <div class="text-recommendations">
        <h4 class="recommendations-title">המלצות לטקסט</h4>
        
        <div class="recommendation-section">
          <h5 class="section-title">מידע כללי</h5>
          <ul class="recommendation-list">
            {#each recommendations.tips as tip}
              <li class="recommendation-item">{tip}</li>
            {/each}
          </ul>
        </div>

        {#if recommendations.availableLetters.length > 0}
          <div class="recommendation-section">
            <h5 class="section-title">אותיות זמינות</h5>
            <div class="available-letters">
              {#each recommendations.availableLetters as letter}
                <span class="available-letter">{letter}</span>
              {/each}
            </div>
          </div>
        {/if}

        {#if recommendations.popularCombinations.length > 0}
          <div class="recommendation-section">
            <h5 class="section-title">צירופים פופולריים</h5>
            <div class="popular-combinations">
              {#each recommendations.popularCombinations as combo}
                <button class="combo-button" type="button">
                  {combo}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .text-validation-display {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
    margin-top: 16px;
  }

  .validation-status {
    margin-bottom: 20px;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid;
  }

  .validation-status.valid {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
  }

  .validation-status.invalid {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
  }

  .status-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-text {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .space-analysis {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .analysis-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
  }

  .space-bar-container {
    margin-bottom: 12px;
  }

  .space-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .space-used {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 4px;
  }

  .space-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .space-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .stat-label {
    color: #6b7280;
  }

  .stat-value {
    font-weight: 600;
    color: #374151;
  }

  .validation-errors,
  .validation-warnings,
  .validation-suggestions {
    margin-bottom: 16px;
  }

  .errors-title,
  .warnings-title,
  .suggestions-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .errors-title {
    color: #dc2626;
  }

  .warnings-title {
    color: #d97706;
  }

  .suggestions-title {
    color: #059669;
  }

  .errors-list,
  .warnings-list,
  .suggestions-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .error-item,
  .warning-item,
  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .error-item {
    background: #fef2f2;
    color: #dc2626;
  }

  .warning-item {
    background: #fffbeb;
    color: #d97706;
  }

  .suggestion-item {
    background: #ecfdf5;
    color: #059669;
  }

  .missing-beads {
    margin-bottom: 20px;
    padding: 16px;
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 8px;
  }

  .missing-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 12px 0;
  }

  .missing-letters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .missing-letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #fed7aa;
    color: #92400e;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .missing-note {
    font-size: 0.8rem;
    color: #78350f;
    margin: 0;
    font-style: italic;
  }

  .text-recommendations {
    border-top: 1px solid #e5e7eb;
    padding-top: 20px;
  }

  .recommendations-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
  }

  .recommendation-section {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 8px 0;
  }

  .recommendation-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .recommendation-item {
    padding: 4px 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .recommendation-item::before {
    content: '•';
    color: #d4af37;
    margin-left: 8px;
  }

  .available-letters {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .available-letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #f3f4f6;
    color: #374151;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.8rem;
    border: 1px solid #d1d5db;
  }

  .popular-combinations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .combo-button {
    padding: 6px 12px;
    background: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .combo-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .text-validation-display {
      padding: 16px;
    }

    .space-stats {
      grid-template-columns: 1fr;
    }

    .stat-item {
      padding: 4px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .available-letters,
    .missing-letters {
      justify-content: center;
    }

    .popular-combinations {
      justify-content: center;
    }
  }
</style>