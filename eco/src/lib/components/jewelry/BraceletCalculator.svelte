<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { 
    BraceletCalculationResult, 
    JewelryComponent,
    BraceletConfiguration 
  } from '$lib/types/jewelry.js';
  import { 
    calculateBraceletBeads, 
    calculateTotalBeadSpace,
    checkBeadsFitInSpace,
    BRACELET_VALIDATION_RULES 
  } from '$lib/utils/braceletCalculations.js';

  interface Props {
    wristCircumference: number;
    selectedBeads?: JewelryComponent[];
    customText?: string;
    onCalculationUpdate?: (result: BraceletCalculationResult) => void;
    onOverflowWarning?: (isOverflow: boolean) => void;
    showVisualFeedback?: boolean;
  }

  let { 
    wristCircumference, 
    selectedBeads = [], 
    customText = '',
    onCalculationUpdate,
    onOverflowWarning,
    showVisualFeedback = true
  }: Props = $props();

  // Reactive calculations
  let calculationResult = $derived.by(() => {
    // Calculate with average bead diameter if no specific beads selected
    const averageBeadDiameter = selectedBeads.length > 0 
      ? selectedBeads.reduce((sum, bead) => sum + (bead.diameter || 0.5), 0) / selectedBeads.length
      : 0.5; // Default 0.5cm

    const result = calculateBraceletBeads(wristCircumference, averageBeadDiameter);
    
    // Update text fit status based on custom text
    if (customText) {
      result.textFitsInSpace = customText.length <= result.recommendedBeadCount;
    }

    return result;
  });

  let totalSelectedBeadSpace = $derived(() => {
    return calculateTotalBeadSpace(selectedBeads);
  });

  let beadsFitInSpace = $derived(() => {
    return checkBeadsFitInSpace(selectedBeads, calculationResult.availableBeadSpace);
  });

  let isApproachingCapacity = $derived(() => {
    const usagePercentage = totalSelectedBeadSpace / calculationResult.availableBeadSpace;
    return usagePercentage > 0.8; // 80% threshold
  });

  let isOverCapacity = $derived(() => {
    return !beadsFitInSpace;
  });

  let capacityPercentage = $derived(() => {
    const percentage = (totalSelectedBeadSpace / calculationResult.availableBeadSpace) * 100;
    return Math.min(percentage, 100);
  });

  let remainingSpace = $derived(() => {
    return Math.max(0, calculationResult.availableBeadSpace - totalSelectedBeadSpace);
  });

  let remainingBeadCount = $derived(() => {
    const averageBeadDiameter = selectedBeads.length > 0 
      ? selectedBeads.reduce((sum, bead) => sum + (bead.diameter || 0.5), 0) / selectedBeads.length
      : 0.5;
    
    return Math.floor(remainingSpace / averageBeadDiameter);
  });

  // Effects for callbacks
  $effect(() => {
    onCalculationUpdate?.(calculationResult);
  });

  $effect(() => {
    onOverflowWarning?.(isOverCapacity);
  });

  // Helper functions for display
  function formatSpace(space: number): string {
    return `${space.toFixed(1)}cm`;
  }

  function getCapacityColor(): string {
    if (isOverCapacity) return 'text-red-600';
    if (isApproachingCapacity) return 'text-amber-600';
    return 'text-green-600';
  }

  function getCapacityBarColor(): string {
    if (isOverCapacity) return 'bg-red-500';
    if (isApproachingCapacity) return 'bg-amber-500';
    return 'bg-green-500';
  }
</script>

<div class="bracelet-calculator bg-white rounded-lg shadow-sm border border-gray-200 p-4" transition:fade>
  <div class="flex items-center gap-2 mb-4">
    <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
    <h3 class="text-lg font-semibold text-gray-800">חישוב צמיד</h3>
  </div>

  <!-- Basic Calculation Info -->
  <div class="grid grid-cols-2 gap-4 mb-4">
    <div class="bg-gray-50 rounded-lg p-3">
      <div class="text-sm text-gray-600 mb-1">היקף כולל</div>
      <div class="text-lg font-semibold text-gray-800">
        {formatSpace(calculationResult.totalCircumference)}
      </div>
      <div class="text-xs text-gray-500">
        {formatSpace(wristCircumference)} + {formatSpace(1.5)} (סגירה)
      </div>
    </div>

    <div class="bg-gray-50 rounded-lg p-3">
      <div class="text-sm text-gray-600 mb-1">מספר חרוזים מומלץ</div>
      <div class="text-lg font-semibold text-gray-800">
        {calculationResult.recommendedBeadCount}
      </div>
      <div class="text-xs text-gray-500">
        מקסימום: {calculationResult.maxBeadCount}
      </div>
    </div>
  </div>

  <!-- Capacity Visualization -->
  {#if showVisualFeedback && selectedBeads.length > 0}
    <div class="mb-4" transition:slide>
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-gray-700">תפוסת החרוזים</span>
        <span class="text-sm {getCapacityColor()} font-medium">
          {capacityPercentage.toFixed(1)}%
        </span>
      </div>
      
      <!-- Capacity Bar -->
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          class="h-full transition-all duration-300 {getCapacityBarColor()}"
          style="width: {Math.min(capacityPercentage, 100)}%"
        ></div>
      </div>
      
      <!-- Capacity Details -->
      <div class="flex justify-between text-xs text-gray-600 mt-1">
        <span>בשימוש: {formatSpace(totalSelectedBeadSpace)}</span>
        <span>זמין: {formatSpace(calculationResult.availableBeadSpace)}</span>
      </div>
    </div>
  {/if}

  <!-- Selected Beads Summary -->
  {#if selectedBeads.length > 0}
    <div class="mb-4" transition:slide>
      <div class="text-sm font-medium text-gray-700 mb-2">
        חרוזים נבחרים ({selectedBeads.length})
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">מקום תפוס:</span>
          <span class="text-sm font-medium {getCapacityColor()}">
            {formatSpace(totalSelectedBeadSpace)}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">מקום נותר:</span>
          <span class="text-sm font-medium text-gray-800">
            {formatSpace(remainingSpace)}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">חרוזים נוספים אפשריים:</span>
          <span class="text-sm font-medium text-gray-800">
            ~{remainingBeadCount}
          </span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Custom Text Validation -->
  {#if customText}
    <div class="mb-4" transition:slide>
      <div class="text-sm font-medium text-gray-700 mb-2">
        טקסט מותאם אישית
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">אורך הטקסט:</span>
          <span class="text-sm font-medium text-gray-800">
            {customText.length} תווים
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">מקום זמין לטקסט:</span>
          <span class="text-sm font-medium {calculationResult.textFitsInSpace ? 'text-green-600' : 'text-red-600'}">
            {calculationResult.recommendedBeadCount} מיקומים
          </span>
        </div>
        {#if !calculationResult.textFitsInSpace}
          <div class="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
            הטקסט ארוך מדי עבור הצמיד. קצר את הטקסט או הגדל את גודל הצמיד.
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Warning Messages -->
  {#if isOverCapacity}
    <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4" transition:slide>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-red-800">חריגה מקיבולת הצמיד</span>
      </div>
      <p class="text-sm text-red-700 mt-1">
        החרוזים הנבחרים תופסים יותר מקום מהזמין. הסר חרוזים או הגדל את גודל הצמיד.
      </p>
    </div>
  {:else if isApproachingCapacity}
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4" transition:slide>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-amber-800">מתקרב לקיבולת מלאה</span>
      </div>
      <p class="text-sm text-amber-700 mt-1">
        הצמיד מתמלא. נותרו עוד {remainingBeadCount} חרוזים בערך.
      </p>
    </div>
  {/if}

  <!-- Helpful Tips -->
  {#if selectedBeads.length === 0}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3" transition:slide>
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium text-blue-800">טיפ</span>
      </div>
      <p class="text-sm text-blue-700 mt-1">
        התחילי לבחור חרוזים כדי לראות חישוב מדויק של התפוסה.
      </p>
    </div>
  {/if}
</div>

<style>
  .bracelet-calculator {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
  }
</style>