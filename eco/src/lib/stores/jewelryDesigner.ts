import { writable, derived, get } from 'svelte/store';
import {
  DesignStep,
  type JewelryTemplate,
  type JewelryComponent,
  type DesignState,
  type ComponentPlacement,
  type DesignConfiguration,
  type JewelryDesignerError,
  type BraceletConfiguration,
  type BraceletCalculationResult
} from '$lib/types/jewelry';
import { 
  calculateBraceletBeads, 
  validateBraceletConfiguration, 
  validateBeadAddition,
  getBraceletCapacityStatus,
  generateBeadReductionSuggestions,
  calculateTotalBeadSpace,
  calculateLetterBeadPositions,
  getLetterBeadId
} from '$lib/utils/braceletCalculations.js';

// Current step in the design process
export const currentStep = writable<DesignStep>(DesignStep.WELCOME);

// Available templates from Strapi
export const availableTemplates = writable<JewelryTemplate[]>([]);

// Available components from Strapi
export const availableComponents = writable<JewelryComponent[]>([]);

// Currently selected template
export const selectedTemplate = writable<JewelryTemplate | null>(null);

// Current design state
export const designState = writable<DesignState>({
  templateId: '',
  selectedComponents: new Map(),
  totalPrice: 0,
  designData: {
    templateId: '',
    components: [],
    timestamp: new Date()
  }
});

// Bracelet-specific state
export const braceletConfiguration = writable<BraceletConfiguration | null>(null);
export const braceletCalculationResult = writable<BraceletCalculationResult | null>(null);

// Loading states
export const isLoadingTemplates = writable<boolean>(false);
export const isLoadingComponents = writable<boolean>(false);
export const isSubmittingOrder = writable<boolean>(false);

// Error handling
export const designerError = writable<JewelryDesignerError | null>(null);
export const templateLoadError = writable<JewelryDesignerError | null>(null);
export const componentLoadError = writable<JewelryDesignerError | null>(null);

// Session recovery notification
export const hasRecoveredSession = writable<boolean>(false);
export const recoveryTimestamp = writable<Date | null>(null);

// Derived stores for computed values
export const totalPrice = derived(
  [selectedTemplate, designState],
  ([$selectedTemplate, $designState]) => {
    if (!$selectedTemplate) return 0;
    
    let total = $selectedTemplate.basePrice;
    $designState.selectedComponents.forEach((component) => {
      total += component.price;
    });
    
    return total;
  }
);

export const isDesignComplete = derived(
  [selectedTemplate, designState],
  ([$selectedTemplate, $designState]) => {
    if (!$selectedTemplate) return false;
    
    // Check if all required positions have components
    const requiredPositions = $selectedTemplate.positions.filter(pos => pos.required);
    const filledPositions = $designState.designData.components.map(c => c.positionId);
    
    return requiredPositions.every(pos => filledPositions.includes(pos.id));
  }
);

export const canProceedToNextStep = derived(
  [currentStep, selectedTemplate, isDesignComplete, braceletConfiguration],
  ([$currentStep, $selectedTemplate, $isDesignComplete, $braceletConfiguration]) => {
    switch ($currentStep) {
      case DesignStep.WELCOME:
        return true;
      case DesignStep.TEMPLATE_SELECTION:
        return $selectedTemplate !== null;
      case DesignStep.CUSTOMIZATION:
        // For bracelets, also check that bracelet configuration is valid
        if ($selectedTemplate?.isBracelet) {
          if (!$braceletConfiguration) return false;
          const validation = validateBraceletConfiguration($braceletConfiguration);
          return $isDesignComplete && validation.isValid;
        }
        return $isDesignComplete;
      case DesignStep.PREVIEW:
        return true;
      case DesignStep.ORDER:
        return false; // Order step doesn't proceed automatically
      default:
        return false;
    }
  }
);

// Derived store for current bracelet calculation
export const currentBraceletCalculation = derived(
  [braceletConfiguration, availableComponents],
  ([$braceletConfiguration, $availableComponents]) => {
    if (!$braceletConfiguration) return null;
    
    // Calculate with average bead diameter if no specific beads selected
    const averageBeadDiameter = 0.5; // Default 0.5cm
    
    // If we have selected components, use their actual diameters
    const selectedBeads = Array.from($availableComponents.values()).filter(c => c.type === 'bead');
    const actualBeadDiameter = selectedBeads.length > 0 
      ? selectedBeads.reduce((sum, bead) => sum + (bead.diameter || 0.5), 0) / selectedBeads.length
      : averageBeadDiameter;
    
    return calculateBraceletBeads($braceletConfiguration.wristCircumference, actualBeadDiameter);
  }
);

// Derived store to check if current template is a bracelet
export const isBraceletTemplate = derived(
  selectedTemplate,
  ($selectedTemplate) => $selectedTemplate?.isBracelet || false
);

// Actions for managing the design process
export const jewelryDesignerActions = {
  // Navigation actions
  setStep: (step: DesignStep) => {
    currentStep.set(step);
  },

  nextStep: () => {
    const current = get(currentStep);
    const canProceed = get(canProceedToNextStep);
    
    if (!canProceed) return;
    
    switch (current) {
      case DesignStep.WELCOME:
        currentStep.set(DesignStep.TEMPLATE_SELECTION);
        break;
      case DesignStep.TEMPLATE_SELECTION:
        currentStep.set(DesignStep.CUSTOMIZATION);
        break;
      case DesignStep.CUSTOMIZATION:
        currentStep.set(DesignStep.PREVIEW);
        break;
      case DesignStep.PREVIEW:
        currentStep.set(DesignStep.ORDER);
        break;
    }
  },

  previousStep: () => {
    const current = get(currentStep);
    
    switch (current) {
      case DesignStep.TEMPLATE_SELECTION:
        currentStep.set(DesignStep.WELCOME);
        break;
      case DesignStep.CUSTOMIZATION:
        currentStep.set(DesignStep.TEMPLATE_SELECTION);
        break;
      case DesignStep.PREVIEW:
        currentStep.set(DesignStep.CUSTOMIZATION);
        break;
      case DesignStep.ORDER:
        currentStep.set(DesignStep.PREVIEW);
        break;
    }
  },

  // Template actions
  selectTemplate: (template: JewelryTemplate) => {
    selectedTemplate.set(template);
    designState.update(state => ({
      ...state,
      templateId: template.id,
      designData: {
        ...state.designData,
        templateId: template.id,
        timestamp: new Date()
      }
    }));

    // Initialize bracelet configuration if template is a bracelet
    if (template.isBracelet) {
      braceletConfiguration.set({
        wristCircumference: 17, // Default size
        customText: '',
        calculatedBeadCount: 0,
        letterBeadPositions: []
      });
    } else {
      braceletConfiguration.set(null);
    }
  },

  // Component actions
  addComponentToPosition: (positionId: string, component: JewelryComponent) => {
    // For bracelet templates, validate bead addition first
    const template = get(selectedTemplate);
    if (template?.isBracelet && component.type === 'bead') {
      const currentState = get(designState);
      const currentBeads = Array.from(currentState.selectedComponents.values()).filter(c => c.type === 'bead');
      const braceletConfig = get(braceletConfiguration);
      
      if (braceletConfig) {
        const calculation = calculateBraceletBeads(braceletConfig.wristCircumference, 0.5);
        const validation = validateBeadAddition(currentBeads, component, calculation.availableBeadSpace);
        
        if (!validation.isValid) {
          // Set error for blocked bead selection
          jewelryDesignerActions.setError({
            type: 'validation',
            message: validation.errors[0] || 'Cannot add this bead',
            details: { component, validation }
          });
          return;
        }
        
        // Show warning if approaching capacity
        if (validation.warningLevel && validation.warningLevel !== 'low') {
          console.warn('Bracelet capacity warning:', validation.errors[0]);
        }
      }
    }

    designState.update(state => {
      const newSelectedComponents = new Map(state.selectedComponents);
      newSelectedComponents.set(positionId, component);
      
      const newComponents = state.designData.components.filter(c => c.positionId !== positionId);
      newComponents.push({
        positionId,
        componentId: component.id
      });
      
      return {
        ...state,
        selectedComponents: newSelectedComponents,
        designData: {
          ...state.designData,
          components: newComponents,
          timestamp: new Date()
        }
      };
    });
  },

  removeComponentFromPosition: (positionId: string) => {
    designState.update(state => {
      const newSelectedComponents = new Map(state.selectedComponents);
      newSelectedComponents.delete(positionId);
      
      const newComponents = state.designData.components.filter(c => c.positionId !== positionId);
      
      return {
        ...state,
        selectedComponents: newSelectedComponents,
        designData: {
          ...state.designData,
          components: newComponents,
          timestamp: new Date()
        }
      };
    });
  },

  // Bracelet-specific actions
  updateWristSize: (wristCircumference: number) => {
    braceletConfiguration.update(config => {
      if (!config) {
        return {
          wristCircumference,
          customText: '',
          calculatedBeadCount: 0,
          letterBeadPositions: []
        };
      }
      
      const updatedConfig = {
        ...config,
        wristCircumference
      };

      // Recalculate bead count with new wrist size
      const calculation = calculateBraceletBeads(wristCircumference, 0.5); // Default bead diameter
      updatedConfig.calculatedBeadCount = calculation.recommendedBeadCount;

      return updatedConfig;
    });

    // Update design state with bracelet data
    designState.update(state => ({
      ...state,
      braceletConfig: get(braceletConfiguration),
      designData: {
        ...state.designData,
        braceletData: get(braceletConfiguration),
        timestamp: new Date()
      }
    }));
  },

  updateCustomText: (customText: string) => {
    braceletConfiguration.update(config => {
      if (!config) return config;
      
      return {
        ...config,
        customText,
        letterBeadPositions: [] // Will be calculated when components are available
      };
    });

    // Update design state with bracelet data
    designState.update(state => ({
      ...state,
      braceletConfig: get(braceletConfiguration),
      designData: {
        ...state.designData,
        braceletData: get(braceletConfiguration),
        timestamp: new Date()
      }
    }));
  },

  // Create letter beads from text and add them to positions
  createLetterBeadsFromText: (customText: string) => {
    if (!customText || customText.trim().length === 0) {
      // Clear letter beads if text is empty
      designState.update(state => {
        const newSelectedComponents = new Map(state.selectedComponents);
        const newComponents = [...state.designData.components];
        
        // Remove all letter beads
        Array.from(newSelectedComponents.entries()).forEach(([positionId, component]) => {
          const isLetterBead = component.isLetterBead || 
                              (component.name && (component.name.endsWith('-letter') || component.name.includes('-letter')));
          if (isLetterBead) {
            newSelectedComponents.delete(positionId);
          }
        });
        
        const filteredComponents = newComponents.filter(comp => {
          const component = newSelectedComponents.get(comp.positionId);
          const isLetterBead = component?.isLetterBead || 
                              (component?.name && (component.name.endsWith('-letter') || component.name.includes('-letter')));
          return !isLetterBead;
        });
        
        return {
          ...state,
          selectedComponents: newSelectedComponents,
          designData: {
            ...state.designData,
            components: filteredComponents,
            timestamp: new Date()
          }
        };
      });
      return;
    }

    const config = get(braceletConfiguration);
    const template = get(selectedTemplate);
    const components = get(availableComponents);
    
    if (!config || !template || !template.isBracelet) {
      console.warn('Cannot create letter beads: missing config or template');
      return;
    }

    // Get letter bead components (check both isLetterBead flag and name pattern)
    const letterBeadComponents = new Map<string, JewelryComponent>();
    components.forEach(comp => {
      const isLetterBead = comp.isLetterBead || 
                          (comp.name && (comp.name.endsWith('-letter') || comp.name.includes('-letter')));
      if (isLetterBead) {
        letterBeadComponents.set(comp.id, comp);
      }
    });

    if (letterBeadComponents.size === 0) {
      console.warn('No letter bead components available');
      return;
    }

    console.log('Creating letter beads for text:', customText);
    console.log('Available letter beads:', Array.from(letterBeadComponents.keys()));

    // Get bead positions from template (filter by type 'bead')
    const templateBeadPositions = template.positions.filter(p => p.type === 'bead');
    const availableBeadPositions = templateBeadPositions.length;
    
    // Calculate total bead count (for reference, but we use actual positions)
    const calculation = calculateBraceletBeads(config.wristCircumference, 0.5);
    const totalBeadCount = calculation.recommendedBeadCount;

    console.log('Total bead count (calculated):', totalBeadCount);
    console.log('Available bead positions in template:', availableBeadPositions);

    // Calculate letter bead positions using actual available positions
    const letterPositions = calculateLetterBeadPositions(
      customText,
      totalBeadCount,
      letterBeadComponents,
      availableBeadPositions
    );

    console.log('Letter positions calculated:', letterPositions);

    // Update bracelet configuration with positions
    braceletConfiguration.update(cfg => {
      if (!cfg) return cfg;
      return {
        ...cfg,
        customText,
        letterBeadPositions: letterPositions
      };
    });

    // Add letter beads to design state positions
    // Use template positions that match the letter bead positions
    designState.update(state => {
      const newSelectedComponents = new Map(state.selectedComponents);
      const newComponents = [...state.designData.components];

      // Get bead positions from template (filter by type 'bead')
      // Include pendant_center as a position for text (it can be used for letter beads)
      const templateBeadPositions = template.positions.filter(p => 
        p.type === 'bead' || p.id === 'pendant_center'
      );
      
      console.log('Template bead positions (including pendant_center for text):', templateBeadPositions.length);
      
      // Remove existing letter beads first
      templateBeadPositions.forEach((templatePos) => {
        const existingComponent = newSelectedComponents.get(templatePos.id);
        if (existingComponent) {
          const isLetterBead = existingComponent.isLetterBead || 
                              (existingComponent.name && (existingComponent.name.endsWith('-letter') || existingComponent.name.includes('-letter')));
          if (isLetterBead) {
            newSelectedComponents.delete(templatePos.id);
          }
        }
      });

      // Filter out existing letter bead components
      const filteredComponents = newComponents.filter(comp => {
        const component = newSelectedComponents.get(comp.positionId);
        if (!component) return true;
        const isLetterBead = component.isLetterBead || 
                            (component.name && (component.name.endsWith('-letter') || component.name.includes('-letter')));
        return !isLetterBead;
      });

      // Add new letter beads to matching template positions
      // Ensure positionIndex is within bounds
      let addedCount = 0;
      
      letterPositions.forEach((letterPos) => {
        const letterBead = letterBeadComponents.get(letterPos.componentId);
        if (!letterBead) {
          console.warn('Letter bead not found for componentId:', letterPos.componentId, 'letter:', letterPos.letter);
          return;
        }
        
        // Ensure positionIndex is within bounds
        if (letterPos.positionIndex < 0 || letterPos.positionIndex >= templateBeadPositions.length) {
          console.warn(`Position index ${letterPos.positionIndex} out of range (0-${templateBeadPositions.length - 1}) for letter "${letterPos.letter}"`);
          return;
        }
        
        const templatePosition = templateBeadPositions[letterPos.positionIndex];
        
        if (templatePosition) {
          // Check if position is already taken by a non-letter bead
          const existingComponent = newSelectedComponents.get(templatePosition.id);
          if (existingComponent && !existingComponent.isLetterBead && 
              !(existingComponent.name && (existingComponent.name.endsWith('-letter') || existingComponent.name.includes('-letter')))) {
            console.warn(`Position ${templatePosition.id} already has a non-letter bead, skipping`);
            return;
          }
          
          newSelectedComponents.set(templatePosition.id, letterBead);
          filteredComponents.push({
            positionId: templatePosition.id,
            componentId: letterBead.id
          });
          addedCount++;
          console.log(`Added letter bead "${letterPos.letter}" to position ${templatePosition.id} (index ${letterPos.positionIndex})`);
        } else {
          console.warn('Template position not found for index:', letterPos.positionIndex);
        }
      });
      
      if (letterPositions.length > templateBeadPositions.length) {
        console.warn(`Text has ${letterPositions.length} letters but only ${templateBeadPositions.length} positions available. Some letters may not be placed.`);
      }

      console.log(`Added ${addedCount} letter beads to design`);

      return {
        ...state,
        selectedComponents: newSelectedComponents,
        designData: {
          ...state.designData,
          components: filteredComponents,
          braceletData: get(braceletConfiguration),
          timestamp: new Date()
        }
      };
    });
  },

  updateBraceletConfiguration: (config: Partial<BraceletConfiguration>) => {
    braceletConfiguration.update(current => {
      if (!current) {
        return {
          wristCircumference: 17,
          customText: '',
          calculatedBeadCount: 0,
          letterBeadPositions: [],
          ...config
        };
      }
      
      return {
        ...current,
        ...config
      };
    });

    // Update design state with bracelet data
    designState.update(state => ({
      ...state,
      braceletConfig: get(braceletConfiguration),
      designData: {
        ...state.designData,
        braceletData: get(braceletConfiguration),
        timestamp: new Date()
      }
    }));
  },

  getBraceletCalculation: (): BraceletCalculationResult | null => {
    const config = get(braceletConfiguration);
    if (!config) return null;
    
    return calculateBraceletBeads(config.wristCircumference, 0.5); // Default bead diameter
  },

  // Get bracelet capacity status and overflow prevention info
  getBraceletCapacityInfo: () => {
    const config = get(braceletConfiguration);
    const state = get(designState);
    
    if (!config) return null;
    
    const selectedBeads = Array.from(state.selectedComponents.values()).filter(c => c.type === 'bead');
    const calculation = calculateBraceletBeads(config.wristCircumference, 0.5);
    const components = get(availableComponents);
    
    return {
      calculation,
      selectedBeads,
      capacityStatus: getBraceletCapacityStatus(selectedBeads, calculation.availableBeadSpace),
      suggestions: selectedBeads.length > 0 ? 
        generateBeadReductionSuggestions(
          selectedBeads, 
          components.filter(c => c.type === 'bead'), 
          Math.max(0, calculateTotalBeadSpace(selectedBeads) - calculation.availableBeadSpace)
        ) : []
    };
  },

  // Validate if a bead can be added (for component selector)
  canAddBead: (bead: JewelryComponent): { canAdd: boolean; warning?: string; error?: string } => {
    const template = get(selectedTemplate);
    if (!template?.isBracelet) return { canAdd: true };
    
    const state = get(designState);
    const config = get(braceletConfiguration);
    
    if (!config) return { canAdd: false, error: 'Bracelet configuration not found' };
    
    const currentBeads = Array.from(state.selectedComponents.values()).filter(c => c.type === 'bead');
    const calculation = calculateBraceletBeads(config.wristCircumference, 0.5);
    const validation = validateBeadAddition(currentBeads, bead, calculation.availableBeadSpace);
    
    if (!validation.isValid) {
      return { canAdd: false, error: validation.errors[0] };
    }
    
    if (validation.warningLevel && validation.warningLevel !== 'low') {
      return { canAdd: true, warning: validation.errors[0] };
    }
    
    return { canAdd: true };
  },

  // Reset actions
  resetDesign: () => {
    selectedTemplate.set(null);
    braceletConfiguration.set(null);
    braceletCalculationResult.set(null);
    designState.set({
      templateId: '',
      selectedComponents: new Map(),
      totalPrice: 0,
      designData: {
        templateId: '',
        components: [],
        timestamp: new Date()
      }
    });
    currentStep.set(DesignStep.WELCOME);
  },

  // Error handling
  setError: (error: JewelryDesignerError) => {
    designerError.set(error);
  },

  clearError: () => {
    designerError.set(null);
  },

  setTemplateLoadError: (error: JewelryDesignerError) => {
    templateLoadError.set(error);
  },

  clearTemplateLoadError: () => {
    templateLoadError.set(null);
  },

  setComponentLoadError: (error: JewelryDesignerError) => {
    componentLoadError.set(error);
  },

  clearComponentLoadError: () => {
    componentLoadError.set(null);
  },

  // Local storage persistence
  saveToLocalStorage: () => {
    try {
      const state = get(designState);
      const template = get(selectedTemplate);
      const step = get(currentStep);
      const braceletConfig = get(braceletConfiguration);
      
      // Only save if there's meaningful data
      if (!template && state.selectedComponents.size === 0) {
        return;
      }
      
      const saveData = {
        version: '1.1', // Updated version for bracelet support
        designState: {
          ...state,
          selectedComponents: Array.from(state.selectedComponents.entries()),
          designData: {
            ...state.designData,
            timestamp: state.designData.timestamp.toISOString()
          }
        },
        selectedTemplate: template,
        currentStep: step,
        braceletConfiguration: braceletConfig,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('jewelry-designer-state', JSON.stringify(saveData));
      localStorage.setItem('jewelry-designer-last-save', new Date().toISOString());
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // If localStorage is full or unavailable, fail silently
    }
  },

  loadFromLocalStorage: () => {
    try {
      const saved = localStorage.getItem('jewelry-designer-state');
      if (!saved) return false;
      
      const saveData = JSON.parse(saved);
      
      // Validate version compatibility (support both 1.0 and 1.1)
      if (!saveData.version || !['1.0', '1.1'].includes(saveData.version)) {
        console.warn('Incompatible save data version, clearing...');
        localStorage.removeItem('jewelry-designer-state');
        return false;
      }
      
      // Check if saved data is not too old (24 hours)
      const savedTime = new Date(saveData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('Saved data expired (>24 hours), clearing...');
        localStorage.removeItem('jewelry-designer-state');
        localStorage.removeItem('jewelry-designer-last-save');
        return false;
      }
      
      // Restore state with validation
      if (saveData.selectedTemplate) {
        selectedTemplate.set(saveData.selectedTemplate);
      }
      
      if (saveData.designState) {
        const restoredState = {
          ...saveData.designState,
          selectedComponents: new Map(saveData.designState.selectedComponents),
          designData: {
            ...saveData.designState.designData,
            timestamp: new Date(saveData.designState.designData.timestamp)
          }
        };
        designState.set(restoredState);
      }

      // Restore bracelet configuration if available (version 1.1+)
      if (saveData.version === '1.1' && saveData.braceletConfiguration) {
        braceletConfiguration.set(saveData.braceletConfiguration);
      }
      
      if (saveData.currentStep) {
        // Don't restore SUCCESS step, start fresh
        if (saveData.currentStep !== DesignStep.SUCCESS) {
          currentStep.set(saveData.currentStep);
        }
      }
      
      console.log('Successfully restored design from localStorage');
      hasRecoveredSession.set(true);
      recoveryTimestamp.set(savedTime);
      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      localStorage.removeItem('jewelry-designer-state');
      localStorage.removeItem('jewelry-designer-last-save');
      return false;
    }
  },

  clearLocalStorage: () => {
    try {
      localStorage.removeItem('jewelry-designer-state');
      localStorage.removeItem('jewelry-designer-last-save');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },

  // Get last save timestamp
  getLastSaveTime: (): Date | null => {
    try {
      const lastSave = localStorage.getItem('jewelry-designer-last-save');
      return lastSave ? new Date(lastSave) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if there's a saved session available
  hasSavedSession: (): boolean => {
    try {
      const saved = localStorage.getItem('jewelry-designer-state');
      if (!saved) return false;
      
      const saveData = JSON.parse(saved);
      
      // Check if not expired
      const savedTime = new Date(saveData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      return hoursDiff <= 24;
    } catch (error) {
      return false;
    }
  },

  // Dismiss recovery notification
  dismissRecoveryNotification: () => {
    hasRecoveredSession.set(false);
    recoveryTimestamp.set(null);
  }
};

// Auto-save functionality with debouncing
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const autoSave = () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    jewelryDesignerActions.saveToLocalStorage();
  }, 1000);
};

// Auto-save when design state changes
designState.subscribe(() => {
  autoSave();
});

// Auto-save when template changes
selectedTemplate.subscribe(() => {
  autoSave();
});

// Auto-save when step changes
currentStep.subscribe(() => {
  autoSave();
});

// Auto-save when bracelet configuration changes
braceletConfiguration.subscribe(() => {
  autoSave();
});