import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import {
  DesignStep,
  type JewelryTemplate,
  type JewelryComponent,
  type DesignState,
  type ComponentPlacement,
  type DesignConfiguration,
  type JewelryDesignerError,
  type BraceletConfiguration,
  type BraceletCalculationResult,
  type ComponentType,
  type SizeCategory
} from '$lib/types/jewelry';
import { isLetterBeadComponent } from '$lib/utils/jewelryHelpers';
import { templatesApi } from '$lib/api/strapiClient';
import {
  calculateBraceletBeads,
  averageBeadDiameter,
  validateBraceletConfiguration,
  validateBeadAddition,
  getBraceletCapacityStatus,
  generateBeadReductionSuggestions,
  calculateTotalBeadSpace,
  calculateLetterBeadPositions,
  getLetterBeadId
} from '$lib/utils/braceletCalculations.js';

export interface DesignerNotice {
  level: 'warning' | 'error' | 'info';
  message: string;
}

export interface RestoreResult {
  restored: boolean;
  /** Placements dropped because the position or component no longer exists. */
  droppedCount?: number;
}

/** Bumped to 2.0: saved payloads now hold a template id, not the whole template. */
const SAVE_VERSION = '2.0';
const SUPPORTED_SAVE_VERSIONS = ['1.0', '1.1', '2.0'];
const SAVE_MAX_AGE_HOURS = 24;

let noticeTimeout: ReturnType<typeof setTimeout> | null = null;

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
//
// `designerError` is for hard failures that justify a blocking overlay (network,
// server). Soft, in-context feedback ("this bead doesn't fit") goes to
// `designerNotice` and is rendered inline — a capacity hint used to darken the
// whole screen behind a modal.
export const designerError = writable<JewelryDesignerError | null>(null);
export const designerNotice = writable<DesignerNotice | null>(null);
export const templateLoadError = writable<JewelryDesignerError | null>(null);
export const componentLoadError = writable<JewelryDesignerError | null>(null);

// Session recovery notification
export const hasRecoveredSession = writable<boolean>(false);
export const recoveryTimestamp = writable<Date | null>(null);

/** True when the last auto-save failed (quota exceeded, storage blocked, …). */
export const saveFailed = writable<boolean>(false);

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
  [braceletConfiguration, designState],
  ([$braceletConfiguration, $designState]) => {
    if (!$braceletConfiguration) return null;

    // Use the beads the customer actually placed. This previously averaged over
    // `availableComponents` — the whole catalogue — under a variable named
    // `selectedBeads`, so the figure had nothing to do with her design.
    const placedBeads = Array.from($designState.selectedComponents.values()).filter(
      (c) => c.type === 'bead'
    );

    return calculateBraceletBeads(
      $braceletConfiguration.wristCircumference,
      averageBeadDiameter(placedBeads)
    );
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
        const calculation = calculateBraceletBeads(
          braceletConfig.wristCircumference,
          averageBeadDiameter(currentBeads)
        );
        const validation = validateBeadAddition(currentBeads, component, calculation.availableBeadSpace);

        if (!validation.isValid) {
          // A bead that does not fit is a soft, in-context problem — not a
          // full-screen failure. It goes to `designerNotice`, which the UI shows
          // inline; `designerError` stays reserved for network/server failures.
          jewelryDesignerActions.setNotice({
            level: 'error',
            message: validation.errors[0] ?? 'אין מקום לחרוז הזה'
          });
          return;
        }

        if (validation.warnings.length > 0) {
          jewelryDesignerActions.setNotice({ level: 'warning', message: validation.warnings[0] });
        } else {
          jewelryDesignerActions.clearNotice();
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

  // Auto-populate empty required positions with white-pearl defaults.
  // Picks the cheapest white/pearl component that matches each position's type & size,
  // and only fills positions that are currently empty (preserves user choices and recovered sessions).
  autoPopulateWithDefaults: () => {
    const template = get(selectedTemplate);
    const components = get(availableComponents);
    if (!template || components.length === 0) return;

    const isWhitePearl = (c: JewelryComponent) => {
      const color = (c.color || '').toLowerCase();
      const material = (c.material || '').toLowerCase();
      const isWhite = color.includes('white') || c.color?.includes('לבן');
      const isPearl = material.includes('pearl') || c.material?.includes('פנינה');
      return (isWhite || isPearl) && !c.isLetterBead && c.isActive;
    };

    const pickDefault = (type: ComponentType, size: SizeCategory) => {
      const candidates = components.filter(
        (c) => c.type === type && c.compatibleSizes.includes(size) && c.isActive && !c.isLetterBead
      );
      const whitePearl = candidates.find(isWhitePearl);
      if (whitePearl) return whitePearl;
      // Fallback: any pearl, then any matching component (sorted by price).
      const pearls = candidates.filter((c) => (c.material || '').toLowerCase().includes('pearl'));
      const pool = pearls.length > 0 ? pearls : candidates;
      return pool.sort((a, b) => a.price - b.price)[0];
    };

    designState.update((state) => {
      const newSelectedComponents = new Map(state.selectedComponents);
      const newComponents = [...state.designData.components];
      let added = false;

      template.positions.forEach((position) => {
        if (!position.required) return;
        if (newSelectedComponents.has(position.id)) return;
        const defaultComp = pickDefault(position.type, position.size);
        if (!defaultComp) return;
        newSelectedComponents.set(position.id, defaultComp);
        newComponents.push({ positionId: position.id, componentId: defaultComp.id });
        added = true;
      });

      if (!added) return state;

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
      const placedBeads = Array.from(get(designState).selectedComponents.values()).filter(
        (c) => c.type === 'bead'
      );
      const calculation = calculateBraceletBeads(
        wristCircumference,
        averageBeadDiameter(placedBeads)
      );
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

        // Collect the letter-bead positions FIRST. The previous version deleted
        // from the map and then looked the entries up in the same (already
        // mutated) map, so the lookup returned undefined, the filter kept every
        // stale placement, and cleared letters still shipped with the order.
        const letterPositionIds = new Set(
          Array.from(state.selectedComponents.entries())
            .filter(([, component]) => isLetterBeadComponent(component))
            .map(([positionId]) => positionId)
        );

        letterPositionIds.forEach((positionId) => newSelectedComponents.delete(positionId));

        const filteredComponents = state.designData.components.filter(
          (comp) => !letterPositionIds.has(comp.positionId)
        );

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

    const letterBeadComponents = new Map<string, JewelryComponent>();
    components.forEach((comp) => {
      if (isLetterBeadComponent(comp)) letterBeadComponents.set(comp.id, comp);
    });

    if (letterBeadComponents.size === 0) {
      console.warn('No letter bead components available');
      return;
    }

    // Bead slots the template actually offers, and how many beads fit at the
    // selected wrist size (using the real diameter of the letter beads).
    const availableBeadPositions = template.positions.filter((p) => p.type === 'bead').length;
    const calculation = calculateBraceletBeads(
      config.wristCircumference,
      averageBeadDiameter(Array.from(letterBeadComponents.values()))
    );
    const totalBeadCount = calculation.recommendedBeadCount;

    // Calculate letter bead positions using actual available positions
    const letterPositions = calculateLetterBeadPositions(
      customText,
      totalBeadCount,
      letterBeadComponents,
      availableBeadPositions
    );

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
      
      // Remove existing letter beads first. Collect the ids up front — looking
      // them up after deleting from the map returns undefined and silently keeps
      // every stale placement in designData.components.
      const staleLetterPositionIds = new Set(
        templateBeadPositions
          .filter((templatePos) => isLetterBeadComponent(newSelectedComponents.get(templatePos.id)))
          .map((templatePos) => templatePos.id)
      );

      staleLetterPositionIds.forEach((positionId) => newSelectedComponents.delete(positionId));

      const filteredComponents = newComponents.filter(
        (comp) => !staleLetterPositionIds.has(comp.positionId)
      );

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
          if (existingComponent && !isLetterBeadComponent(existingComponent)) {
            console.warn(`Position ${templatePosition.id} already has a non-letter bead, skipping`);
            return;
          }

          newSelectedComponents.set(templatePosition.id, letterBead);
          filteredComponents.push({
            positionId: templatePosition.id,
            componentId: letterBead.id
          });
          addedCount++;
        } else {
          console.warn('Template position not found for index:', letterPos.positionIndex);
        }
      });

      if (letterPositions.length > templateBeadPositions.length) {
        console.warn(`Text has ${letterPositions.length} letters but only ${templateBeadPositions.length} positions available. Some letters may not be placed.`);
      }

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
    
    const placedBeads = Array.from(get(designState).selectedComponents.values()).filter(
      (c) => c.type === 'bead'
    );
    return calculateBraceletBeads(config.wristCircumference, averageBeadDiameter(placedBeads));
  },

  // Get bracelet capacity status and overflow prevention info
  getBraceletCapacityInfo: () => {
    const config = get(braceletConfiguration);
    const state = get(designState);
    
    if (!config) return null;
    
    const selectedBeads = Array.from(state.selectedComponents.values()).filter(c => c.type === 'bead');
    const calculation = calculateBraceletBeads(
      config.wristCircumference,
      averageBeadDiameter(selectedBeads)
    );
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
    
    if (!config) return { canAdd: false, error: 'לא נמצאו הגדרות הצמיד' };
    
    const currentBeads = Array.from(state.selectedComponents.values()).filter(c => c.type === 'bead');
    const calculation = calculateBraceletBeads(
      config.wristCircumference,
      averageBeadDiameter(currentBeads)
    );
    const validation = validateBeadAddition(currentBeads, bead, calculation.availableBeadSpace);

    if (!validation.isValid) {
      return { canAdd: false, error: validation.errors[0] };
    }

    if (validation.warnings.length > 0) {
      return { canAdd: true, warning: validation.warnings[0] };
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

  // Soft, inline feedback. Auto-dismisses so it never sticks around.
  setNotice: (notice: DesignerNotice) => {
    designerNotice.set(notice);
    if (noticeTimeout) clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(
      () => designerNotice.set(null),
      notice.level === 'error' ? 6000 : 4000
    );
  },

  clearNotice: () => {
    if (noticeTimeout) clearTimeout(noticeTimeout);
    designerNotice.set(null);
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
    if (!browser) return;

    try {
      const state = get(designState);
      const template = get(selectedTemplate);
      const step = get(currentStep);
      const braceletConfig = get(braceletConfiguration);

      // Only save if there's meaningful data
      if (!template && state.selectedComponents.size === 0) {
        return;
      }

      // `previewImage` is a 2x PNG data URL — easily hundreds of KB. Persisting it
      // blew through the ~5MB localStorage quota, the write threw, and auto-save
      // silently stopped working from the moment the preview was generated. It is
      // regenerated on demand, so it is never persisted.
      const { previewImage: _previewImage, ...persistableState } = state;

      const saveData = {
        version: SAVE_VERSION,
        designState: {
          ...persistableState,
          selectedComponents: Array.from(state.selectedComponents.entries()),
          designData: {
            ...state.designData,
            timestamp: state.designData.timestamp.toISOString()
          }
        },
        // Only the id: the full template (prices, positions) went stale as soon as
        // it changed in Strapi, and the customer would then order at the old price.
        selectedTemplateId: template?.id ?? null,
        currentStep: step,
        braceletConfiguration: braceletConfig,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('jewelry-designer-state', JSON.stringify(saveData));
      localStorage.setItem('jewelry-designer-last-save', new Date().toISOString());
      saveFailed.set(false);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      // Surface it: "your design is saved" silently becoming false is worse than
      // saying so.
      saveFailed.set(true);
    }
  },

  /**
   * Restores a saved design.
   *
   * Async because the template is re-fetched from Strapi by id instead of being
   * restored from the browser copy — a stored template carried stale prices and
   * positions, so a customer returning an hour later could order at the old price.
   * Components that no longer exist in the catalogue are dropped, and the caller
   * is told about it so it can say something.
   */
  loadFromLocalStorage: async (): Promise<RestoreResult> => {
    if (!browser) return { restored: false };

    const discard = () => {
      localStorage.removeItem('jewelry-designer-state');
      localStorage.removeItem('jewelry-designer-last-save');
    };

    try {
      const saved = localStorage.getItem('jewelry-designer-state');
      if (!saved) return { restored: false };

      const saveData = JSON.parse(saved);

      if (!saveData.version || !SUPPORTED_SAVE_VERSIONS.includes(saveData.version)) {
        console.warn('Incompatible save data version, clearing...');
        discard();
        return { restored: false };
      }

      const savedTime = new Date(saveData.timestamp);
      const hoursDiff = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > SAVE_MAX_AGE_HOURS) {
        discard();
        return { restored: false };
      }

      // Re-fetch the template so prices and positions are current.
      // `selectedTemplate` (the full object) is the pre-2.0 format.
      const templateId: string | null =
        saveData.selectedTemplateId ?? saveData.selectedTemplate?.id ?? null;

      let template: JewelryTemplate | null = null;
      if (templateId) {
        try {
          template = await templatesApi.getById(templateId);
        } catch (error) {
          console.error('Could not re-fetch the saved template:', error);
          discard();
          return { restored: false };
        }
      }

      if (!template) {
        discard();
        return { restored: false };
      }

      // Drop placements whose component or position no longer exists.
      const validPositionIds = new Set(template.positions.map((p) => p.id));
      const savedEntries: Array<[string, JewelryComponent]> =
        saveData.designState?.selectedComponents ?? [];

      const keptEntries = savedEntries.filter(
        ([positionId, component]) => validPositionIds.has(positionId) && component?.id
      );
      const droppedCount = savedEntries.length - keptEntries.length;

      selectedTemplate.set(template);

      if (saveData.designState) {
        const keptPositionIds = new Set(keptEntries.map(([positionId]) => positionId));
        designState.set({
          ...saveData.designState,
          previewImage: undefined,
          templateId: template.id,
          selectedComponents: new Map(keptEntries),
          designData: {
            ...saveData.designState.designData,
            templateId: template.id,
            components: (saveData.designState.designData?.components ?? []).filter(
              (c: ComponentPlacement) => keptPositionIds.has(c.positionId)
            ),
            timestamp: new Date(saveData.designState.designData.timestamp)
          }
        });
      }

      if (saveData.braceletConfiguration) {
        braceletConfiguration.set(saveData.braceletConfiguration);
      }

      // Never restore into SUCCESS — that order is already sent.
      if (saveData.currentStep && saveData.currentStep !== DesignStep.SUCCESS) {
        currentStep.set(saveData.currentStep);
      }

      hasRecoveredSession.set(true);
      recoveryTimestamp.set(savedTime);

      return { restored: true, droppedCount };
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      discard();
      return { restored: false };
    }
  },

  clearLocalStorage: () => {
    if (!browser) return;
    try {
      localStorage.removeItem('jewelry-designer-state');
      localStorage.removeItem('jewelry-designer-last-save');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },

  // Get last save timestamp
  getLastSaveTime: (): Date | null => {
    if (!browser) return null;
    try {
      const lastSave = localStorage.getItem('jewelry-designer-last-save');
      return lastSave ? new Date(lastSave) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if there's a saved session available
  hasSavedSession: (): boolean => {
    if (!browser) return false;
    try {
      const saved = localStorage.getItem('jewelry-designer-state');
      if (!saved) return false;

      const saveData = JSON.parse(saved);
      const savedTime = new Date(saveData.timestamp);
      const hoursDiff = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);

      return hoursDiff <= SAVE_MAX_AGE_HOURS;
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

// Auto-save functionality with debouncing.
// Guarded on `browser`: these subscriptions fire once at module init, which also
// happens during SSR, where there is no localStorage to write to.
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const autoSave = () => {
  if (!browser) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    jewelryDesignerActions.saveToLocalStorage();
  }, 1000);
};

if (browser) {
  designState.subscribe(autoSave);
  selectedTemplate.subscribe(autoSave);
  currentStep.subscribe(autoSave);
  braceletConfiguration.subscribe(autoSave);
}
