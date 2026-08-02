// Export all jewelry designer components for easy importing.
//
// This list is kept in sync with the files that actually exist — it previously
// exported `JewelryDesignerPage.svelte` (which never existed) and two
// `*Example.svelte` demo files, so importing from here could break the build.

// Flow screens
export { default as WelcomeScreen } from './WelcomeScreen.svelte';
export { default as TemplateGallery } from './TemplateGallery.svelte';
export { default as DesignWorkspace } from './DesignWorkspace.svelte';
export { default as DesignCanvas } from './DesignCanvas.svelte';
export { default as ComponentSelector } from './ComponentSelector.svelte';
export { default as DesignPreview } from './DesignPreview.svelte';
export { default as OrderForm } from './OrderForm.svelte';
export { default as SuccessScreen } from './SuccessScreen.svelte';

// Bracelet-specific
export { default as WristSizeSelector } from './WristSizeSelector.svelte';
export { default as BraceletCalculator } from './BraceletCalculator.svelte';
export { default as BeadOverflowPrevention } from './BeadOverflowPrevention.svelte';

// Text input and letter bead components
export { default as TextInputInterface } from './TextInputInterface.svelte';
export { default as LetterBeadManager } from './LetterBeadManager.svelte';
export { default as TextValidationDisplay } from './TextValidationDisplay.svelte';

// Shared UI
export { default as LoadingSpinner } from './LoadingSpinner.svelte';
export { default as SkeletonLoader } from './SkeletonLoader.svelte';
export { default as ErrorMessage } from './ErrorMessage.svelte';
export { default as OptimizedImage } from './OptimizedImage.svelte';
export { default as AutoSaveIndicator } from './AutoSaveIndicator.svelte';
export { default as RecoveryNotification } from './RecoveryNotification.svelte';
