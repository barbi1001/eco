<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { 
    JewelryComponent,
    BraceletCalculationResult 
  } from '$lib/types/jewelry.js';
  import { 
    checkBeadsFitInSpace,
    calculateTotalBeadSpace,
    BRACELET_VALIDATION_RULES 
  } from '$lib/utils/braceletCalculations.js';

  interface Props {
    selectedBeads: JewelryComponent[];
    availableComponents: JewelryComponent[];
    calculationResult: BraceletCalculationResult;
    onBeadSelectionBlocked?: (bead: JewelryComponent, reason: string) => void;
    onSuggestionProvided?: (suggestions: BeadReductionSuggestion[]) => void;
    showSuggestions?: boolean;
  }

  interface BeadReductionSuggestion {
    type: 'remove_largest' | 'replace_with_smaller' | 'reduce_count';
    description: string;
    beadToRemove?: JewelryComponent;
    replacementBead?: JewelryComponent;
    spaceSaved: number;
  }

  let { 
    selectedBeads, 
    availableComponents,
    calculationResult,
    onBeadSelectionBlocked,
    onSuggestionProvided,
    showSuggestions = true
  }: Props = $props();

  // Reactive calculations
  let totalUsedSpace = $derived(() => {
    return calculateTotalBeadSpace(selectedBeads);
  });

  let remainingSpace = $derived(() => {
    return Math.max(0, calculationResult.availableBeadSpace - totalUsedSpace);
  });

  let isOverCapacity = $derived(() => {
    return !checkBeadsFitInSpace(selectedBeads, calculationResult.availableBeadSpace);
  });

  let isNearCapacity = $derived(() => {
    const usagePercentage = totalUsedSpace / calculationResult.availableBeadSpace;
    return usagePercentage > 0.85; // 85% threshold
  });

  let capacityWarningLevel = $derived(() => {
    const usagePercentage = totalUsedSpace / calculationResult.availableBeadSpace;
    if (usagePercentage > 1.0) return 'critical';
    if (usagePercentage > 0.9) return 'high';
    if (usagePercentage > 0.8) return 'medium';
    return 'low';
  });

  // Generate suggestions for reducing bead count
  let reductionSuggestions = $derived.by(() => {
    if (!isOverCapacity && !isNearCapacity) return [];

    const suggestions: BeadReductionSuggestion[] = [];
    const excessSpace = Math.max(0, totalUsedSpace - calculationResult.availableBeadSpace);

    // Sort beads by diameter (largest first)
    const sortedBeads = [...selectedBeads].sort((a, b) => 
      (b.diameter || 0.5) - (a.diameter || 0.5)
    );

    // Suggestion 1: Remove largest beads
    if (sortedBeads.length > 0) {
      const largestBead = sortedBeads[0];
      const spaceSaved = largestBead.diameter || 0.5;
      
      if (spaceSaved >= excessSpace * 0.5) { // If removing largest saves at least 50% of excess
        suggestions.push({
          type: 'remove_largest',
          description: `הסר את החרוז הגדול ביותר (${largestBead.name}) לחיסכון של ${spaceSaved.toFixed(1)}ס"מ`,
          beadToRemove: largestBead,
          spaceSaved
        });
      }
    }

    // Suggestion 2: Replace large beads with smaller ones
    for (const largeBead of sortedBeads.slice(0, 3)) { // Check top 3 largest
      const smallerAlternatives = availableComponents.filter(comp => 
        comp.type === 'bead' && 
        comp.id !== largeBead.id &&
        (comp.diameter || 0.5) < (largeBead.diameter || 0.5) &&
        comp.color === largeBead.color // Same color family
      );

      if (smallerAlternatives.length > 0) {
        const bestAlternative = smallerAlternatives.reduce((best, current) => 
          (current.diameter || 0.5) > (best.diameter || 0.5) ? current : best
        );

        const spaceSaved = (largeBead.diameter || 0.5) - (bestAlternative.diameter || 0.5);
        
        if (spaceSaved > 0.1) { // At least 1mm difference
          suggestions.push({
            type: 'replace_with_smaller',
            description: `החלף את ${largeBead.name} ב-${bestAlternative.name} לחיסכון של ${spaceSaved.toFixed(1)}ס"מ`,
            beadToRemove: largeBead,
            replacementBead: bestAlternative,
            spaceSaved
          });
        }
      }
    }

    // Suggestion 3: Reduce overall bead count
    if (selectedBeads.length > 5) {
      const averageBeadSize = totalUsedSpace / selectedBeads.length;
      const beadsToRemove = Math.ceil(excessSpace / averageBeadSize);
      
      suggestions.push({
        type: 'reduce_count',
        description: `הסר ${beadsToRemove} חרוזים כדי להתאים לגודל הצמיד`,
        spaceSaved: beadsToRemove * averageBeadSize
      });
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  });

  // Check if a new bead can be added
  function canAddBead(newBead: JewelryComponent): { canAdd: boolean; reason?: string } {
    const newBeadSpace = newBead.diameter || 0.5;
    const totalSpaceWithNewBead = totalUsedSpace + newBeadSpace;
    
    if (totalSpaceWithNewBead > calculationResult.availableBeadSpace) {
      const excessSpace = totalSpaceWithNewBead - calculationResult.availableBeadSpace;
      return {
        canAdd: false,
        reason: `החרוז הזה יחרוג מהמקום הזמין ב-${excessSpace.toFixed(1)}ס"מ`
      };
    }

    // Warning if approaching capacity
    const usagePercentage = totalSpaceWithNewBead / calculationResult.availableBeadSpace;
    if (usagePercentage > 0.9) {
      return {
        canAdd: true,
        reason: `אזהרה: הוספת החרוז הזה תמלא ${(usagePercentage * 100).toFixed(1)}% מהצמיד`
      };
    }

    return { canAdd: true };
  }

  // Public method to validate bead selection
  export function validateBeadSelection(bead: JewelryComponent): boolean {
    const validation = canAddBead(bead);
    
    if (!validation.canAdd) {
      onBeadSelectionBlocked?.(bead, validation.reason || 'לא ניתן להוסיף חרוז זה');
      return false;
    }

    return true;
  }

  // Effect to provide suggestions when needed
  $effect(() => {
    if (reductionSuggestions.length > 0) {
      onSuggestionProvided?.(reductionSuggestions);
    }
  });

  function getWarningColor(level: string): string {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  }

  function getWarningIcon(level: string): string {
    switch (level) {
      case 'critical': 
        return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z';
      case 'high':
      case 'medium':
        return 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z';
      default:
        return 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z';
    }
  }

  function getWarningTitle(level: string): string {
    switch (level) {
      case 'critical': return 'חריגה מקיבולת הצמיד';
      case 'high': return 'צמיד כמעט מלא';
      case 'medium': return 'מתקרב לקיבולת מלאה';
      default: return 'מידע';
    }
  }
</script>

<div class="bead-overflow-prevention" transition:fade>
  <!-- Capacity Warning -->
  {#if capacityWarningLevel !== 'low'}
    <div class="border rounded-lg p-4 mb-4 {getWarningColor(capacityWarningLevel)}" transition:slide>
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="{getWarningIcon(capacityWarningLevel)}" clip-rule="evenodd" />
        </svg>
        <span class="font-medium">{getWarningTitle(capacityWarningLevel)}</span>
      </div>
      
      <div class="text-sm mb-3">
        {#if isOverCapacity}
          החרוזים הנבחרים תופסים {totalUsedSpace.toFixed(1)}ס"מ, אך יש רק {calculationResult.availableBeadSpace.toFixed(1)}ס"מ זמינים.
        {:else if capacityWarningLevel === 'high'}
          נותרו רק {remainingSpace.toFixed(1)}ס"מ זמינים בצמיד.
        {:else}
          הצמיד מתמלא - נותרו {remainingSpace.toFixed(1)}ס"מ זמינים.
        {/if}
      </div>

      <!-- Capacity Bar -->
      <div class="w-full bg-white bg-opacity-50 rounded-full h-2 mb-3">
        <div 
          class="h-full rounded-full transition-all duration-300 {
            capacityWarningLevel === 'critical' ? 'bg-red-500' :
            capacityWarningLevel === 'high' ? 'bg-orange-500' :
            'bg-amber-500'
          }"
          style="width: {Math.min((totalUsedSpace / calculationResult.availableBeadSpace) * 100, 100)}%"
        ></div>
      </div>

      <div class="text-xs opacity-75">
        {totalUsedSpace.toFixed(1)}ס"מ מתוך {calculationResult.availableBeadSpace.toFixed(1)}ס"מ 
        ({((totalUsedSpace / calculationResult.availableBeadSpace) * 100).toFixed(1)}%)
      </div>
    </div>
  {/if}

  <!-- Reduction Suggestions -->
  {#if showSuggestions && reductionSuggestions.length > 0}
    <div class="bg-white border border-gray-200 rounded-lg p-4" transition:slide>
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="font-medium text-gray-800">הצעות לחיסכון במקום</span>
      </div>

      <div class="space-y-3">
        {#each reductionSuggestions as suggestion, index}
          <div class="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-800 mb-1">{suggestion.description}</p>
                <div class="text-xs text-gray-600">
                  חיסכון: {suggestion.spaceSaved.toFixed(1)}ס"מ
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-3 text-xs text-gray-500">
        בחר באחת מהאפשרויות למעלה כדי להתאים את הצמיד לגודל הנדרש.
      </div>
    </div>
  {/if}

  <!-- Prevention Guidelines -->
  {#if !isOverCapacity && !isNearCapacity && selectedBeads.length > 0}
    <div class="bg-green-50 border border-green-200 rounded-lg p-4" transition:slide>
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium text-green-800">הצמיד במצב טוב</span>
      </div>
      <p class="text-sm text-green-700">
        נותרו {remainingSpace.toFixed(1)}ס"מ זמינים. ניתן להוסיף עוד חרוזים בבטחה.
      </p>
    </div>
  {/if}
</div>

<style>
  .bead-overflow-prevention {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
  }
</style>