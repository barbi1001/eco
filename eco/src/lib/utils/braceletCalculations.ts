import type {
  BraceletConfiguration,
  BraceletCalculationResult,
  BraceletValidationRules,
  ValidationResult,
  LetterBeadPosition,
  JewelryComponent
} from '../types/jewelry.js';

// Bracelet validation rules
export const BRACELET_VALIDATION_RULES: BraceletValidationRules = {
  minWristSize: 12, // cm
  maxWristSize: 25, // cm
  minBeadDiameter: 0.3, // cm
  maxBeadDiameter: 2.0, // cm
  maxTextLength: 20, // characters
  supportedLanguages: ['en', 'he'] // English and Hebrew
};

/**
 * Calculate bracelet bead fitting based on wrist circumference and bead diameter
 * @param wristCircumference - Wrist size in centimeters
 * @param beadDiameter - Average bead diameter in centimeters
 * @returns BraceletCalculationResult with fitting calculations
 */
export function calculateBraceletBeads(
  wristCircumference: number,
  beadDiameter: number
): BraceletCalculationResult {
  const claspSpace = 1.5; // cm - space reserved for clasp
  const totalCircumference = wristCircumference + claspSpace;
  const availableBeadSpace = totalCircumference;
  const maxBeadCount = Math.floor(availableBeadSpace / beadDiameter);
  const recommendedBeadCount = Math.floor(maxBeadCount * 0.9); // 90% for comfort

  return {
    totalCircumference,
    availableBeadSpace,
    maxBeadCount,
    recommendedBeadCount,
    textFitsInSpace: true // Will be calculated based on text length in other functions
  };
}

/**
 * Detect if text is primarily Hebrew or English
 */
function detectTextLanguage(text: string): 'hebrew' | 'english' {
  const hebrewChars = text.match(/[\u0590-\u05FF]/g)?.length || 0;
  const englishChars = text.match(/[a-zA-Z]/g)?.length || 0;
  
  return hebrewChars > englishChars ? 'hebrew' : 'english';
}

/**
 * Calculate letter bead positions for custom text on bracelet
 * @param text - Custom text to be arranged
 * @param totalBeadCount - Total number of beads on the bracelet (for calculation)
 * @param letterBeadComponents - Map of available letter bead components
 * @param availablePositions - Number of available positions in template (optional, defaults to totalBeadCount)
 * @returns Array of LetterBeadPosition objects
 */
export function calculateLetterBeadPositions(
  text: string,
  totalBeadCount: number,
  letterBeadComponents: Map<string, JewelryComponent>,
  availablePositions?: number
): LetterBeadPosition[] {
  if (!text || text.length === 0) {
    return [];
  }

  const textLength = text.length;
  const actualPositions = availablePositions ?? totalBeadCount;
  
  // Detect language
  const language = detectTextLanguage(text);
  
  // Calculate center position (0-based index)
  // For 21 positions (0-20), center is at index 10
  // For 18 positions (0-17), center is at index 9
  const centerIndex = Math.floor((actualPositions - 1) / 2);
  
  // Calculate starting position to center the text
  // For Hebrew: start from left, text flows right (e.g., 21 beads, 3 letters -> 9, 10, 11)
  // For English: same start, but text is reversed (e.g., 21 beads, 3 letters -> 11, 10, 9)
  const startPosition = Math.floor((actualPositions - textLength) / 2);
  
  // Ensure startPosition is within bounds
  const safeStartPosition = Math.max(0, Math.min(startPosition, actualPositions - textLength));

  if (language === 'hebrew') {
    // Hebrew: left to right (normal order)
    // Example: "שלום" with 18 positions -> indices 6, 7, 8, 9
    return text.split('').map((letter, index) => ({
      letter,
      componentId: getLetterBeadId(letter, letterBeadComponents),
      positionIndex: safeStartPosition + index
    }));
  } else {
    // English: right to left (reverse order for display)
    // Example: "barbie" with 18 positions -> indices 11, 10, 9, 8, 7, 6 (reversed)
    // We place letters in reverse order but at consecutive positions
    const letters = text.split('');
    return letters.map((letter, index) => {
      // Reverse the index: last letter goes to first position
      const reverseIndex = letters.length - 1 - index;
      return {
        letter,
        componentId: getLetterBeadId(letter, letterBeadComponents),
        positionIndex: safeStartPosition + reverseIndex
      };
    });
  }
}

/**
 * Get the component ID for a specific letter bead
 * @param letter - The letter to find a bead for
 * @param components - Map of available components
 * @returns Component ID or empty string if not found
 */
export function getLetterBeadId(
  letter: string,
  components: Map<string, JewelryComponent>
): string {
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

/**
 * Validate bracelet configuration
 * @param config - Bracelet configuration to validate
 * @returns ValidationResult with validation status and errors
 */
export function validateBraceletConfiguration(config: BraceletConfiguration): ValidationResult {
  const errors: string[] = [];

  // Validate wrist circumference
  if (config.wristCircumference < BRACELET_VALIDATION_RULES.minWristSize) {
    errors.push(`Wrist circumference must be at least ${BRACELET_VALIDATION_RULES.minWristSize}cm`);
  }
  
  if (config.wristCircumference > BRACELET_VALIDATION_RULES.maxWristSize) {
    errors.push(`Wrist circumference cannot exceed ${BRACELET_VALIDATION_RULES.maxWristSize}cm`);
  }

  // Validate custom text length
  if (config.customText && config.customText.length > BRACELET_VALIDATION_RULES.maxTextLength) {
    errors.push(`Custom text cannot exceed ${BRACELET_VALIDATION_RULES.maxTextLength} characters`);
  }

  // Validate text contains only supported characters
  if (config.customText) {
    const hasUnsupportedChars = !isTextSupported(config.customText);
    if (hasUnsupportedChars) {
      errors.push('Custom text contains unsupported characters. Only English and Hebrew letters are supported.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate wrist size input
 * @param wristSize - Wrist circumference in centimeters
 * @returns ValidationResult with validation status and errors
 */
export function validateWristSize(wristSize: number): ValidationResult {
  const errors: string[] = [];

  if (isNaN(wristSize) || wristSize <= 0) {
    errors.push('Wrist size must be a positive number');
  } else if (wristSize < BRACELET_VALIDATION_RULES.minWristSize) {
    errors.push(`Wrist size must be at least ${BRACELET_VALIDATION_RULES.minWristSize}cm`);
  } else if (wristSize > BRACELET_VALIDATION_RULES.maxWristSize) {
    errors.push(`Wrist size cannot exceed ${BRACELET_VALIDATION_RULES.maxWristSize}cm`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate custom text length and characters
 * @param text - Text to validate
 * @returns ValidationResult with validation status and errors
 */
export function validateCustomText(text: string): ValidationResult {
  const errors: string[] = [];

  if (text.length > BRACELET_VALIDATION_RULES.maxTextLength) {
    errors.push(`Text cannot exceed ${BRACELET_VALIDATION_RULES.maxTextLength} characters`);
  }

  if (!isTextSupported(text)) {
    errors.push('Text contains unsupported characters. Only English and Hebrew letters are supported.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if text contains only supported characters
 * @param text - Text to check
 * @returns True if all characters are supported
 */
export function isTextSupported(text: string): boolean {
  // Regular expression for English letters (a-z, A-Z) and Hebrew letters (א-ת)
  const supportedCharsRegex = /^[a-zA-Z\u0590-\u05FF\s]*$/;
  return supportedCharsRegex.test(text);
}

/**
 * Check if selected beads fit within bracelet space
 * @param selectedBeads - Array of selected bead components
 * @param availableSpace - Available space in centimeters
 * @returns True if beads fit, false otherwise
 */
export function checkBeadsFitInSpace(
  selectedBeads: JewelryComponent[],
  availableSpace: number
): boolean {
  const totalBeadSpace = selectedBeads.reduce((total, bead) => {
    return total + (bead.diameter || 0.5); // Default to 0.5cm if diameter not specified
  }, 0);

  return totalBeadSpace <= availableSpace;
}

/**
 * Calculate total space required for selected beads
 * @param selectedBeads - Array of selected bead components
 * @returns Total space required in centimeters
 */
export function calculateTotalBeadSpace(selectedBeads: JewelryComponent[]): number {
  return selectedBeads.reduce((total, bead) => {
    return total + (bead.diameter || 0.5); // Default to 0.5cm if diameter not specified
  }, 0);
}

/**
 * Get recommended bead count for a given wrist size
 * @param wristCircumference - Wrist size in centimeters
 * @param averageBeadDiameter - Average diameter of beads in centimeters
 * @returns Recommended number of beads
 */
export function getRecommendedBeadCount(
  wristCircumference: number,
  averageBeadDiameter: number = 0.5
): number {
  const calculation = calculateBraceletBeads(wristCircumference, averageBeadDiameter);
  return calculation.recommendedBeadCount;
}

/**
 * Check if custom text fits within available bracelet space
 * @param text - Custom text
 * @param availablePositions - Number of available positions for letter beads
 * @returns True if text fits, false otherwise
 */
export function doesTextFitInBracelet(text: string, availablePositions: number): boolean {
  return text.length <= availablePositions;
}

/**
 * Validate if a new bead can be added without exceeding capacity
 * @param currentBeads - Currently selected beads
 * @param newBead - Bead to be added
 * @param availableSpace - Available space in centimeters
 * @returns Validation result with details
 */
export function validateBeadAddition(
  currentBeads: JewelryComponent[],
  newBead: JewelryComponent,
  availableSpace: number
): ValidationResult & { warningLevel?: 'low' | 'medium' | 'high' | 'critical' } {
  const currentSpace = calculateTotalBeadSpace(currentBeads);
  const newBeadSpace = newBead.diameter || 0.5;
  const totalSpaceWithNewBead = currentSpace + newBeadSpace;

  if (totalSpaceWithNewBead > availableSpace) {
    const excessSpace = totalSpaceWithNewBead - availableSpace;
    return {
      isValid: false,
      errors: [`Adding this bead would exceed capacity by ${excessSpace.toFixed(1)}cm`],
      warningLevel: 'critical'
    };
  }

  const usagePercentage = totalSpaceWithNewBead / availableSpace;
  let warningLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const warnings: string[] = [];

  if (usagePercentage > 0.9) {
    warningLevel = 'high';
    warnings.push(`Adding this bead will fill ${(usagePercentage * 100).toFixed(1)}% of the bracelet`);
  } else if (usagePercentage > 0.8) {
    warningLevel = 'medium';
    warnings.push(`Bracelet will be ${(usagePercentage * 100).toFixed(1)}% full after adding this bead`);
  }

  return {
    isValid: true,
    errors: warnings,
    warningLevel
  };
}

/**
 * Generate suggestions for reducing bead count when over capacity
 * @param selectedBeads - Currently selected beads
 * @param availableComponents - All available bead components
 * @param excessSpace - Amount of space that needs to be freed
 * @returns Array of reduction suggestions
 */
export function generateBeadReductionSuggestions(
  selectedBeads: JewelryComponent[],
  availableComponents: JewelryComponent[],
  excessSpace: number
): Array<{
  type: 'remove_largest' | 'replace_with_smaller' | 'reduce_count';
  description: string;
  beadToRemove?: JewelryComponent;
  replacementBead?: JewelryComponent;
  spaceSaved: number;
}> {
  const suggestions = [];

  // Sort beads by diameter (largest first)
  const sortedBeads = [...selectedBeads].sort((a, b) => 
    (b.diameter || 0.5) - (a.diameter || 0.5)
  );

  // Suggestion 1: Remove largest beads
  if (sortedBeads.length > 0) {
    const largestBead = sortedBeads[0];
    const spaceSaved = largestBead.diameter || 0.5;
    
    if (spaceSaved >= excessSpace * 0.5) {
      suggestions.push({
        type: 'remove_largest' as const,
        description: `Remove largest bead (${largestBead.name}) to save ${spaceSaved.toFixed(1)}cm`,
        beadToRemove: largestBead,
        spaceSaved
      });
    }
  }

  // Suggestion 2: Replace large beads with smaller ones
  for (const largeBead of sortedBeads.slice(0, 3)) {
    const smallerAlternatives = availableComponents.filter(comp => 
      comp.type === 'bead' && 
      comp.id !== largeBead.id &&
      (comp.diameter || 0.5) < (largeBead.diameter || 0.5) &&
      comp.color === largeBead.color
    );

    if (smallerAlternatives.length > 0) {
      const bestAlternative = smallerAlternatives.reduce((best, current) => 
        (current.diameter || 0.5) > (best.diameter || 0.5) ? current : best
      );

      const spaceSaved = (largeBead.diameter || 0.5) - (bestAlternative.diameter || 0.5);
      
      if (spaceSaved > 0.1) {
        suggestions.push({
          type: 'replace_with_smaller' as const,
          description: `Replace ${largeBead.name} with ${bestAlternative.name} to save ${spaceSaved.toFixed(1)}cm`,
          beadToRemove: largeBead,
          replacementBead: bestAlternative,
          spaceSaved
        });
      }
    }
  }

  // Suggestion 3: Reduce overall bead count
  if (selectedBeads.length > 5) {
    const averageBeadSize = calculateTotalBeadSpace(selectedBeads) / selectedBeads.length;
    const beadsToRemove = Math.ceil(excessSpace / averageBeadSize);
    
    suggestions.push({
      type: 'reduce_count' as const,
      description: `Remove ${beadsToRemove} beads to fit bracelet size`,
      spaceSaved: beadsToRemove * averageBeadSize
    });
  }

  return suggestions.slice(0, 3);
}

/**
 * Check if bracelet is approaching capacity limits
 * @param selectedBeads - Currently selected beads
 * @param availableSpace - Available space in centimeters
 * @returns Capacity status information
 */
export function getBraceletCapacityStatus(
  selectedBeads: JewelryComponent[],
  availableSpace: number
): {
  usagePercentage: number;
  warningLevel: 'low' | 'medium' | 'high' | 'critical';
  remainingSpace: number;
  canAddMoreBeads: boolean;
  message: string;
} {
  const usedSpace = calculateTotalBeadSpace(selectedBeads);
  const usagePercentage = (usedSpace / availableSpace) * 100;
  const remainingSpace = Math.max(0, availableSpace - usedSpace);

  let warningLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let message = '';
  let canAddMoreBeads = true;

  if (usagePercentage > 100) {
    warningLevel = 'critical';
    message = 'Bracelet is over capacity';
    canAddMoreBeads = false;
  } else if (usagePercentage > 90) {
    warningLevel = 'high';
    message = 'Bracelet is nearly full';
    canAddMoreBeads = remainingSpace > 0.3; // Can add if more than 3mm left
  } else if (usagePercentage > 80) {
    warningLevel = 'medium';
    message = 'Bracelet is filling up';
    canAddMoreBeads = true;
  } else {
    warningLevel = 'low';
    message = 'Bracelet has plenty of space';
    canAddMoreBeads = true;
  }

  return {
    usagePercentage,
    warningLevel,
    remainingSpace,
    canAddMoreBeads,
    message
  };
}

/**
 * Validate text length against available bracelet space with letter beads
 * @param text - Custom text to validate
 * @param availableBeadPositions - Number of available positions for letter beads
 * @param letterBeadComponents - Available letter bead components
 * @returns Detailed validation result with space analysis
 */
export function validateTextAgainstBraceletSpace(
  text: string,
  availableBeadPositions: number,
  letterBeadComponents: Map<string, JewelryComponent>
): ValidationResult & {
  spaceAnalysis: {
    textLength: number;
    availablePositions: number;
    remainingPositions: number;
    usagePercentage: number;
    fitsInSpace: boolean;
  };
  missingLetterBeads: string[];
  recommendations: string[];
} {
  const errors: string[] = [];
  const recommendations: string[] = [];

  // Basic text validation
  if (!isTextSupported(text)) {
    errors.push('הטקסט מכיל תווים לא נתמכים. רק אותיות באנגלית ובעברית מותרות.');
  }

  // Space analysis
  const textLength = text.length;
  const remainingPositions = availableBeadPositions - textLength;
  const usagePercentage = (textLength / availableBeadPositions) * 100;
  const fitsInSpace = textLength <= availableBeadPositions;

  if (!fitsInSpace) {
    const excessChars = textLength - availableBeadPositions;
    errors.push(`הטקסט ארוך מדי ב-${excessChars} תווים. מקסימום ${availableBeadPositions} תווים.`);
    recommendations.push(`קצרי את הטקסט ב-${excessChars} תווים`);
  } else if (usagePercentage > 90) {
    recommendations.push('הטקסט תופס כמעט את כל הצמיד - שקלי לקצר מעט');
  } else if (usagePercentage < 30) {
    recommendations.push('יש הרבה מקום פנוי - ניתן להוסיף תווים נוספים');
  }

  // Check for missing letter beads
  const missingLetterBeads = findMissingLetterBeadsForText(text, letterBeadComponents);
  if (missingLetterBeads.length > 0) {
    errors.push(`חסרים חרוזי אותיות עבור: ${missingLetterBeads.join(', ')}`);
    recommendations.push('בחרי טקסט עם אותיות זמינות או פני למנהל המערכת');
  }

  return {
    isValid: errors.length === 0,
    errors,
    spaceAnalysis: {
      textLength,
      availablePositions: availableBeadPositions,
      remainingPositions,
      usagePercentage,
      fitsInSpace
    },
    missingLetterBeads,
    recommendations
  };
}

/**
 * Find missing letter beads for a given text
 * @param text - Text to check
 * @param letterBeadComponents - Available letter bead components
 * @returns Array of missing letters
 */
export function findMissingLetterBeadsForText(
  text: string,
  letterBeadComponents: Map<string, JewelryComponent>
): string[] {
  if (!text) return [];

  const uniqueLetters = [...new Set(text.toLowerCase().split('').filter(c => c.trim()))];
  return uniqueLetters.filter(letter => {
    const beadId = getLetterBeadId(letter, letterBeadComponents);
    return !beadId;
  });
}

/**
 * Calculate optimal text positioning with space constraints
 * @param text - Text to position
 * @param totalBeadCount - Total beads on bracelet
 * @param reservedPositions - Positions already taken by other beads
 * @returns Positioning analysis and recommendations
 */
export function calculateOptimalTextPositioning(
  text: string,
  totalBeadCount: number,
  reservedPositions: number[] = []
): {
  canFit: boolean;
  optimalStartPosition: number;
  optimalEndPosition: number;
  alternativePositions: Array<{ start: number; end: number; reason: string }>;
  warnings: string[];
  recommendations: string[];
} {
  const textLength = text.length;
  const availablePositions = totalBeadCount - reservedPositions.length;
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const alternativePositions: Array<{ start: number; end: number; reason: string }> = [];

  // Check if text can fit at all
  if (textLength > availablePositions) {
    return {
      canFit: false,
      optimalStartPosition: -1,
      optimalEndPosition: -1,
      alternativePositions: [],
      warnings: [`הטקסט ארוך מדי - נדרשים ${textLength} מקומות אך זמינים רק ${availablePositions}`],
      recommendations: [`קצרי את הטקסט ב-${textLength - availablePositions} תווים`]
    };
  }

  // Calculate optimal center position avoiding reserved positions
  const idealCenterPosition = Math.floor(totalBeadCount / 2);
  const idealStartPosition = Math.floor(idealCenterPosition - textLength / 2);
  const idealEndPosition = idealStartPosition + textLength - 1;

  // Check if ideal position conflicts with reserved positions
  const hasConflict = reservedPositions.some(pos => 
    pos >= idealStartPosition && pos <= idealEndPosition
  );

  if (!hasConflict) {
    // Ideal position is available
    if (textLength > totalBeadCount * 0.8) {
      warnings.push('הטקסט תופס רוב הצמיד');
    }
    
    return {
      canFit: true,
      optimalStartPosition: idealStartPosition,
      optimalEndPosition: idealEndPosition,
      alternativePositions: [],
      warnings,
      recommendations
    };
  }

  // Find alternative positions
  for (let start = 0; start <= totalBeadCount - textLength; start++) {
    const end = start + textLength - 1;
    const hasConflictInRange = reservedPositions.some(pos => pos >= start && pos <= end);
    
    if (!hasConflictInRange) {
      let reason = '';
      if (start < totalBeadCount * 0.25) {
        reason = 'מיקום בתחילת הצמיד';
      } else if (end > totalBeadCount * 0.75) {
        reason = 'מיקום בסוף הצמיד';
      } else {
        reason = 'מיקום חלופי במרכז';
      }
      
      alternativePositions.push({ start, end, reason });
    }
  }

  const bestAlternative = alternativePositions[0];
  
  if (bestAlternative) {
    recommendations.push('נמצא מיקום חלופי עקב התנגשות עם חרוזים אחרים');
    
    return {
      canFit: true,
      optimalStartPosition: bestAlternative.start,
      optimalEndPosition: bestAlternative.end,
      alternativePositions: alternativePositions.slice(1),
      warnings,
      recommendations
    };
  }

  // No position found
  return {
    canFit: false,
    optimalStartPosition: -1,
    optimalEndPosition: -1,
    alternativePositions: [],
    warnings: ['לא ניתן למקם את הטקסט עקב התנגשות עם חרוזים קיימים'],
    recommendations: ['הסירי חרוזים אחרים או קצרי את הטקסט']
  };
}

/**
 * Validate text fit with real-time feedback
 * @param text - Current text input
 * @param braceletConfig - Current bracelet configuration
 * @param selectedBeads - Currently selected non-letter beads
 * @param letterBeadComponents - Available letter bead components
 * @returns Real-time validation with detailed feedback
 */
export function validateTextFitRealTime(
  text: string,
  braceletConfig: BraceletConfiguration,
  selectedBeads: JewelryComponent[],
  letterBeadComponents: Map<string, JewelryComponent>
): {
  isValid: boolean;
  canFit: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  spaceInfo: {
    textLength: number;
    availableSpace: number;
    usedByOtherBeads: number;
    remainingSpace: number;
    percentageUsed: number;
  };
  missingLetterBeads: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Calculate available space
  const calculation = calculateBraceletBeads(braceletConfig.wristCircumference, 0.5);
  const spaceUsedByOtherBeads = selectedBeads.filter(b => !b.isLetterBead).length;
  const availableSpaceForText = calculation.recommendedBeadCount - spaceUsedByOtherBeads;
  const textLength = text.length;
  const remainingSpace = availableSpaceForText - textLength;
  const percentageUsed = (textLength / availableSpaceForText) * 100;

  // Basic validation
  if (!isTextSupported(text)) {
    errors.push('תווים לא נתמכים בטקסט');
  }

  // Space validation
  const canFit = textLength <= availableSpaceForText;
  if (!canFit) {
    const excess = textLength - availableSpaceForText;
    errors.push(`הטקסט ארוך מדי ב-${excess} תווים`);
    suggestions.push(`קצרי את הטקסט ב-${excess} תווים`);
  } else if (percentageUsed > 90) {
    warnings.push('הטקסט תופס כמעט את כל המקום הפנוי');
    suggestions.push('שקלי לקצר מעט את הטקסט');
  } else if (percentageUsed > 70) {
    warnings.push('הטקסט תופס רוב המקום הפנוי');
  }

  // Letter bead availability
  const missingLetterBeads = findMissingLetterBeadsForText(text, letterBeadComponents);
  if (missingLetterBeads.length > 0) {
    errors.push(`חסרים חרוזי אותיות: ${missingLetterBeads.join(', ')}`);
    suggestions.push('בחרי טקסט עם אותיות זמינות');
  }

  // Additional suggestions
  if (canFit && missingLetterBeads.length === 0) {
    if (remainingSpace > 5) {
      suggestions.push('יש הרבה מקום פנוי - ניתן להוסיף תווים');
    } else if (remainingSpace > 0) {
      suggestions.push(`נותרו ${remainingSpace} מקומות פנויים`);
    }
  }

  return {
    isValid: errors.length === 0,
    canFit,
    errors,
    warnings,
    suggestions,
    spaceInfo: {
      textLength,
      availableSpace: availableSpaceForText,
      usedByOtherBeads: spaceUsedByOtherBeads,
      remainingSpace,
      percentageUsed
    },
    missingLetterBeads
  };
}

/**
 * Get text input recommendations based on current bracelet state
 * @param braceletConfig - Current bracelet configuration
 * @param selectedBeads - Currently selected beads
 * @param letterBeadComponents - Available letter bead components
 * @returns Recommendations for text input
 */
export function getTextInputRecommendations(
  braceletConfig: BraceletConfiguration,
  selectedBeads: JewelryComponent[],
  letterBeadComponents: Map<string, JewelryComponent>
): {
  maxRecommendedLength: number;
  availableLetters: string[];
  popularCombinations: string[];
  tips: string[];
} {
  const calculation = calculateBraceletBeads(braceletConfig.wristCircumference, 0.5);
  const spaceUsedByOtherBeads = selectedBeads.filter(b => !b.isLetterBead).length;
  const availableSpaceForText = calculation.recommendedBeadCount - spaceUsedByOtherBeads;
  
  // Get available letters
  const availableLetters = Array.from(letterBeadComponents.values())
    .filter(c => c.isLetterBead && c.letterValue)
    .map(c => c.letterValue!)
    .sort();

  // Popular combinations (could be enhanced with actual usage data)
  const popularCombinations = [
    'אהבה', 'שלום', 'חיים', 'אמא', 'אבא',
    'LOVE', 'HOPE', 'JOY', 'LIFE', 'MOM', 'DAD'
  ].filter(combo => combo.length <= availableSpaceForText);

  const tips = [
    `מקסימום ${availableSpaceForText} תווים זמינים`,
    'ניתן לשלב עברית ואנגלית',
    'רווחים נספרים כתווים',
    'הטקסט יוצב במרכז הצמיד'
  ];

  if (availableSpaceForText < 5) {
    tips.push('מקום מוגבל - שקלי שמות קצרים או ראשי תיבות');
  } else if (availableSpaceForText > 15) {
    tips.push('יש הרבה מקום - ניתן להוסיף ביטויים ארוכים');
  }

  return {
    maxRecommendedLength: Math.max(0, availableSpaceForText - 2), // Leave some buffer
    availableLetters,
    popularCombinations,
    tips
  };
}