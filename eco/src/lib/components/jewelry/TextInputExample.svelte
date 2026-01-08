<script lang="ts">
  import { onMount } from 'svelte';
  import TextInputInterface from './TextInputInterface.svelte';
  import LetterBeadManager from './LetterBeadManager.svelte';
  import TextValidationDisplay from './TextValidationDisplay.svelte';
  import type { JewelryComponent, BraceletConfiguration, LetterBeadPosition } from '$lib/types/jewelry.js';

  // Example data for demonstration
  let customText = $state('');
  let braceletConfig = $state<BraceletConfiguration>({
    wristCircumference: 17,
    customText: '',
    calculatedBeadCount: 34,
    letterBeadPositions: []
  });

  // Mock letter bead components (in real app, these would come from Strapi)
  let letterBeadComponents = $state(new Map<string, JewelryComponent>());
  let selectedBeads = $state<JewelryComponent[]>([]);
  let letterBeadManager = $state<LetterBeadManager>();

  onMount(() => {
    // Initialize mock letter bead components
    const mockLetterBeads: JewelryComponent[] = [
      {
        id: '1',
        name: 'a-letter',
        type: 'bead',
        color: 'gold',
        material: 'metal',
        image: '/placeholder-bead.svg',
        svgElement: '<circle cx="50" cy="50" r="8" fill="#FFD700" stroke="#B8860B" stroke-width="1"/><text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#8B4513">A</text>',
        price: 15,
        compatibleSizes: ['small', 'medium'],
        isActive: true,
        diameter: 1.0,
        isLetterBead: true,
        letterValue: 'a'
      },
      {
        id: '2',
        name: 'ב-letter',
        type: 'bead',
        color: 'gold',
        material: 'metal',
        image: '/placeholder-bead.svg',
        svgElement: '<circle cx="50" cy="50" r="8" fill="#FFD700" stroke="#B8860B" stroke-width="1"/><text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#8B4513">ב</text>',
        price: 15,
        compatibleSizes: ['small', 'medium'],
        isActive: true,
        diameter: 1.0,
        isLetterBead: true,
        letterValue: 'ב'
      }
      // Add more letters as needed...
    ];

    // Populate the map
    const componentsMap = new Map();
    mockLetterBeads.forEach(component => {
      componentsMap.set(component.id, component);
    });
    letterBeadComponents = componentsMap;
  });

  function handleTextChange(text: string) {
    customText = text;
    braceletConfig = {
      ...braceletConfig,
      customText: text
    };
  }

  function handleLetterBeadPreview(positions: LetterBeadPosition[]) {
    braceletConfig = {
      ...braceletConfig,
      letterBeadPositions: positions
    };
  }

  function handleValidationChange(isValid: boolean, errors: string[]) {
    console.log('Validation changed:', { isValid, errors });
  }
</script>

<div class="text-input-example">
  <h2>Text Input and Letter Bead System Example</h2>
  
  <div class="example-content">
    <!-- Text Input Interface -->
    <TextInputInterface
      {customText}
      maxLength={20}
      availableSpace={braceletConfig.calculatedBeadCount}
      {letterBeadComponents}
      onTextChange={handleTextChange}
      onLetterBeadPreview={handleLetterBeadPreview}
      onValidationChange={handleValidationChange}
    />

    <!-- Letter Bead Manager (hidden logic component) -->
    <LetterBeadManager
      bind:this={letterBeadManager}
      {customText}
      totalBeadCount={braceletConfig.calculatedBeadCount}
      {letterBeadComponents}
      {braceletConfig}
    />

    <!-- Text Validation Display -->
    <TextValidationDisplay
      {customText}
      {braceletConfig}
      {selectedBeads}
      {letterBeadComponents}
      showRecommendations={true}
      showSpaceAnalysis={true}
      onValidationChange={handleValidationChange}
    />

    <!-- Debug Information -->
    <div class="debug-info">
      <h3>Debug Information</h3>
      <pre>{JSON.stringify({
        customText,
        braceletConfig,
        letterBeadComponentsCount: letterBeadComponents.size
      }, null, 2)}</pre>
    </div>
  </div>
</div>

<style>
  .text-input-example {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .text-input-example h2 {
    text-align: center;
    color: #374151;
    margin-bottom: 30px;
  }

  .example-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .debug-info {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
  }

  .debug-info h3 {
    margin: 0 0 12px 0;
    color: #4b5563;
    font-size: 0.95rem;
  }

  .debug-info pre {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 12px;
    font-size: 0.8rem;
    overflow-x: auto;
    margin: 0;
  }
</style>