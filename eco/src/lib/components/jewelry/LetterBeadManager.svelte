<script lang="ts">
  import { 
    calculateLetterBeadPositions, 
    getLetterBeadId,
    isTextSupported 
  } from '$lib/utils/braceletCalculations.js';
  import type { 
    JewelryComponent, 
    LetterBeadPosition, 
    BraceletConfiguration 
  } from '$lib/types/jewelry.js';

  interface Props {
    customText?: string;
    totalBeadCount?: number;
    letterBeadComponents?: Map<string, JewelryComponent>;
    braceletConfig?: BraceletConfiguration;
    onLetterBeadPositionsChange?: (positions: LetterBeadPosition[]) => void;
    onMissingLetterBeads?: (missingLetters: string[]) => void;
    onTextValidation?: (isValid: boolean, errors: string[]) => void;
  }

  let { 
    customText = '',
    totalBeadCount = 0,
    letterBeadComponents = new Map(),
    braceletConfig,
    onLetterBeadPositionsChange,
    onMissingLetterBeads,
    onTextValidation
  }: Props = $props();

  // Internal state
  let letterBeadPositions = $state<LetterBeadPosition[]>([]);
  let missingLetterBeads = $state<string[]>([]);
  let textValidationErrors = $state<string[]>([]);

  // Derived values
  let hasValidText = $derived(customText.length > 0 && isTextSupported(customText));
  let hasAllLetterBeads = $derived(missingLetterBeads.length === 0);
  let canGeneratePositions = $derived(hasValidText && totalBeadCount > 0 && letterBeadComponents.size > 0);

  // Update positions when inputs change
  $effect(() => {
    if (canGeneratePositions) {
      updateLetterBeadPositions();
    } else {
      letterBeadPositions = [];
      onLetterBeadPositionsChange?.([]);
    }
  });

  // Update validation when text changes
  $effect(() => {
    validateText();
  });

  function updateLetterBeadPositions() {
    if (!customText || totalBeadCount === 0) {
      letterBeadPositions = [];
      missingLetterBeads = [];
      return;
    }

    // Generate positions using the center positioning algorithm
    const positions = calculateLetterBeadPositions(
      customText,
      totalBeadCount,
      letterBeadComponents
    );

    // Check for missing letter beads
    const missing = findMissingLetterBeads(customText, letterBeadComponents);
    
    letterBeadPositions = positions;
    missingLetterBeads = missing;

    // Notify parent components
    onLetterBeadPositionsChange?.(positions);
    onMissingLetterBeads?.(missing);
  }

  function findMissingLetterBeads(text: string, components: Map<string, JewelryComponent>): string[] {
    if (!text) return [];

    const uniqueLetters = [...new Set(text.toLowerCase().split('').filter(c => c.trim()))];
    return uniqueLetters.filter(letter => {
      const beadId = getLetterBeadId(letter, components);
      return !beadId;
    });
  }

  function validateText() {
    const errors: string[] = [];

    if (!customText) {
      textValidationErrors = errors;
      onTextValidation?.(true, errors);
      return;
    }

    // Check if text is supported (only English and Hebrew letters + spaces)
    if (!isTextSupported(customText)) {
      errors.push('הטקסט מכיל תווים לא נתמכים. רק אותיות באנגלית ובעברית מותרות.');
    }

    // Check if text fits in available space
    if (totalBeadCount > 0 && customText.length > totalBeadCount) {
      errors.push(`הטקסט ארוך מדי עבור הצמיד (מקסימום ${totalBeadCount} תווים)`);
    }

    // Check for missing letter beads
    if (missingLetterBeads.length > 0) {
      errors.push(`חסרים חרוזי אותיות עבור: ${missingLetterBeads.join(', ')}`);
    }

    textValidationErrors = errors;
    onTextValidation?.(errors.length === 0, errors);
  }

  // Public methods for parent components
  export function getLetterBeadPositions(): LetterBeadPosition[] {
    return letterBeadPositions;
  }

  export function getMissingLetterBeads(): string[] {
    return missingLetterBeads;
  }

  export function hasValidConfiguration(): boolean {
    return hasValidText && hasAllLetterBeads && letterBeadPositions.length > 0;
  }

  export function getTextValidationErrors(): string[] {
    return textValidationErrors;
  }

  // Helper function to get letter bead component by letter
  export function getLetterBeadComponent(letter: string): JewelryComponent | undefined {
    const componentId = getLetterBeadId(letter, letterBeadComponents);
    return componentId ? letterBeadComponents.get(componentId) : undefined;
  }

  // Helper function to check if a specific letter has a bead available
  export function hasLetterBead(letter: string): boolean {
    const componentId = getLetterBeadId(letter, letterBeadComponents);
    return !!componentId;
  }

  // Get text arrangement info for display
  export function getTextArrangementInfo(): {
    totalLetters: number;
    startPosition: number;
    endPosition: number;
    centerPosition: number;
    spacingInfo: string;
  } | null {
    if (!customText || totalBeadCount === 0) return null;

    const textLength = customText.length;
    const startPosition = Math.floor((totalBeadCount - textLength) / 2);
    const endPosition = startPosition + textLength - 1;
    const centerPosition = Math.floor(totalBeadCount / 2);

    let spacingInfo = '';
    if (textLength === totalBeadCount) {
      spacingInfo = 'הטקסט ממלא את כל הצמיד';
    } else if (textLength > totalBeadCount * 0.8) {
      spacingInfo = 'הטקסט תופס רוב הצמיד';
    } else if (textLength > totalBeadCount * 0.5) {
      spacingInfo = 'הטקסט תופס חצי מהצמיד';
    } else {
      spacingInfo = 'הטקסט ממוקם במרכז הצמיד';
    }

    return {
      totalLetters: textLength,
      startPosition,
      endPosition,
      centerPosition,
      spacingInfo
    };
  }

  // Language detection and mixed language handling
  function analyzeTextLanguages(text: string): {
    hasHebrew: boolean;
    hasEnglish: boolean;
    hebrewCount: number;
    englishCount: number;
    languageSegments: Array<{ text: string; language: 'hebrew' | 'english' | 'space' }>;
  } {
    const hebrewRegex = /[\u0590-\u05FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    
    const hebrewMatches = text.match(hebrewRegex) || [];
    const englishMatches = text.match(englishRegex) || [];
    
    // Segment the text by language
    const segments: Array<{ text: string; language: 'hebrew' | 'english' | 'space' }> = [];
    let currentSegment = '';
    let currentLanguage: 'hebrew' | 'english' | 'space' | null = null;

    for (const char of text) {
      let charLanguage: 'hebrew' | 'english' | 'space';
      
      if (char.match(/[\u0590-\u05FF]/)) {
        charLanguage = 'hebrew';
      } else if (char.match(/[a-zA-Z]/)) {
        charLanguage = 'english';
      } else {
        charLanguage = 'space';
      }

      if (currentLanguage === charLanguage) {
        currentSegment += char;
      } else {
        if (currentSegment) {
          segments.push({ text: currentSegment, language: currentLanguage! });
        }
        currentSegment = char;
        currentLanguage = charLanguage;
      }
    }

    if (currentSegment) {
      segments.push({ text: currentSegment, language: currentLanguage! });
    }

    return {
      hasHebrew: hebrewMatches.length > 0,
      hasEnglish: englishMatches.length > 0,
      hebrewCount: hebrewMatches.length,
      englishCount: englishMatches.length,
      languageSegments: segments
    };
  }

  export function getLanguageAnalysis() {
    return analyzeTextLanguages(customText);
  }

  // Advanced positioning for mixed language text
  function calculateMixedLanguagePositions(
    text: string,
    totalBeadCount: number,
    components: Map<string, JewelryComponent>
  ): LetterBeadPosition[] {
    const analysis = analyzeTextLanguages(text);
    
    if (!analysis.hasHebrew && !analysis.hasEnglish) {
      return [];
    }

    // For mixed language text, we still center the entire text
    // but we could potentially implement more sophisticated positioning
    // based on reading direction preferences
    return calculateLetterBeadPositions(text, totalBeadCount, components);
  }

  // Get positioning recommendations
  export function getPositioningRecommendations(): {
    recommendation: string;
    reasoning: string;
    alternatives?: string[];
  } | null {
    if (!customText || totalBeadCount === 0) return null;

    const analysis = analyzeTextLanguages(customText);
    const textLength = customText.length;
    const spaceRatio = textLength / totalBeadCount;

    let recommendation = '';
    let reasoning = '';
    const alternatives: string[] = [];

    if (analysis.hasHebrew && analysis.hasEnglish) {
      recommendation = 'מיקום מרכזי עם כיוון טקסט מעורב';
      reasoning = 'הטקסט מכיל עברית ואנגלית, מיקום מרכזי יבטיח קריאות טובה';
      alternatives.push('שקלי להפריד בין השפות ברווח');
    } else if (analysis.hasHebrew) {
      recommendation = 'מיקום מרכזי עם כיוון ימין לשמאל';
      reasoning = 'טקסט עברי נקרא מימין לשמאל';
    } else if (analysis.hasEnglish) {
      recommendation = 'מיקום מרכזי עם כיוון שמאל לימין';
      reasoning = 'טקסט אנגלי נקרא משמאל לימין';
    }

    if (spaceRatio > 0.9) {
      alternatives.push('שקלי לקצר את הטקסט לקריאות טובה יותר');
    } else if (spaceRatio < 0.3) {
      alternatives.push('ניתן להוסיף רווחים או תווים נוספים');
    }

    return {
      recommendation,
      reasoning,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    };
  }
</script>

<!-- 
  This component is primarily a logic component and doesn't render UI directly.
  It manages the letter bead positioning logic and provides methods for parent components.
  The actual visual representation is handled by other components like TextInputInterface.
-->

<div class="letter-bead-manager" style="display: none;">
  <!-- Hidden component - provides logic only -->
  <span>Letter Bead Manager - Logic Component</span>
</div>

<style>
  .letter-bead-manager {
    display: none !important;
  }
</style>