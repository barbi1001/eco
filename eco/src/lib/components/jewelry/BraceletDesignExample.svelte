<script lang="ts">
  import { BraceletCalculator, BeadOverflowPrevention } from './index.js';
  import type { JewelryComponent, BraceletCalculationResult } from '$lib/types/jewelry.js';
  import { calculateBraceletBeads } from '$lib/utils/braceletCalculations.js';

  interface Props {
    wristSize?: number;
    availableBeads?: JewelryComponent[];
  }

  let { 
    wristSize = 17, 
    availableBeads = [] 
  }: Props = $props();

  // Sample beads for demonstration
  let sampleBeads: JewelryComponent[] = $state([
    {
      id: '1',
      name: 'Gold Bead',
      type: 'bead',
      color: 'gold',
      material: 'metal',
      image: 'gold-bead.jpg',
      svgElement: '<circle r="5" fill="gold"/>',
      price: 15,
      compatibleSizes: ['small'],
      isActive: true,
      diameter: 0.6
    },
    {
      id: '2', 
      name: 'Silver Bead',
      type: 'bead',
      color: 'silver',
      material: 'metal',
      image: 'silver-bead.jpg',
      svgElement: '<circle r="4" fill="silver"/>',
      price: 12,
      compatibleSizes: ['small'],
      isActive: true,
      diameter: 0.4
    }
  ]);

  let selectedBeads = $state<JewelryComponent[]>([]);
  let calculationResult = $state<BraceletCalculationResult | null>(null);
  let isOverflow = $state(false);

  // Update calculation when wrist size or beads change
  $effect(() => {
    const avgDiameter = selectedBeads.length > 0 
      ? selectedBeads.reduce((sum, bead) => sum + (bead.diameter || 0.5), 0) / selectedBeads.length
      : 0.5;
    
    calculationResult = calculateBraceletBeads(wristSize, avgDiameter);
  });

  function addBead(bead: JewelryComponent) {
    selectedBeads = [...selectedBeads, bead];
  }

  function removeBead(index: number) {
    selectedBeads = selectedBeads.filter((_, i) => i !== index);
  }

  function handleCalculationUpdate(result: BraceletCalculationResult) {
    calculationResult = result;
  }

  function handleOverflowWarning(overflow: boolean) {
    isOverflow = overflow;
  }
</script>

<div class="bracelet-design-example p-6 max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold mb-6 text-center">Bracelet Design Example</h2>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left Column: Controls -->
    <div class="space-y-6">
      <!-- Wrist Size Input -->
      <div class="bg-white rounded-lg shadow p-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Wrist Size (cm)
        </label>
        <input 
          type="number" 
          bind:value={wristSize}
          min="12" 
          max="25" 
          step="0.5"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <!-- Available Beads -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3">Available Beads</h3>
        <div class="space-y-2">
          {#each sampleBeads as bead}
            <div class="flex items-center justify-between p-2 border rounded">
              <div>
                <span class="font-medium">{bead.name}</span>
                <span class="text-sm text-gray-500 ml-2">
                  ({bead.diameter}cm, ₪{bead.price})
                </span>
              </div>
              <button 
                onclick={() => addBead(bead)}
                class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Add
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Selected Beads -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3">Selected Beads ({selectedBeads.length})</h3>
        {#if selectedBeads.length === 0}
          <p class="text-gray-500 text-sm">No beads selected</p>
        {:else}
          <div class="space-y-2">
            {#each selectedBeads as bead, index}
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="text-sm">{bead.name}</span>
                <button 
                  onclick={() => removeBead(index)}
                  class="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Right Column: Calculator and Overflow Prevention -->
    <div class="space-y-6">
      <!-- Bracelet Calculator -->
      {#if calculationResult}
        <BraceletCalculator 
          {wristCircumference}={wristSize}
          selectedBeads={selectedBeads}
          onCalculationUpdate={handleCalculationUpdate}
          onOverflowWarning={handleOverflowWarning}
          showVisualFeedback={true}
        />
      {/if}

      <!-- Overflow Prevention -->
      {#if calculationResult}
        <BeadOverflowPrevention 
          selectedBeads={selectedBeads}
          availableComponents={sampleBeads}
          calculationResult={calculationResult}
          showSuggestions={true}
        />
      {/if}
    </div>
  </div>

  <!-- Status Summary -->
  <div class="mt-6 p-4 bg-gray-50 rounded-lg">
    <h3 class="font-semibold mb-2">Design Summary</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <span class="text-gray-600">Wrist Size:</span>
        <span class="font-medium ml-1">{wristSize}cm</span>
      </div>
      <div>
        <span class="text-gray-600">Selected Beads:</span>
        <span class="font-medium ml-1">{selectedBeads.length}</span>
      </div>
      <div>
        <span class="text-gray-600">Total Price:</span>
        <span class="font-medium ml-1">
          ₪{selectedBeads.reduce((sum, bead) => sum + bead.price, 0)}
        </span>
      </div>
      <div>
        <span class="text-gray-600">Status:</span>
        <span class="font-medium ml-1 {isOverflow ? 'text-red-600' : 'text-green-600'}">
          {isOverflow ? 'Overflow' : 'OK'}
        </span>
      </div>
    </div>
  </div>
</div>

<style>
  .bracelet-design-example {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
</style>