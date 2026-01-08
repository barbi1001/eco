<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Head } from 'svead';

	// Import stores and types
	import {
		currentStep,
		jewelryDesignerActions,
		designerError,
		designState,
		totalPrice,
		selectedTemplate,
		braceletConfiguration,
		hasRecoveredSession,
		recoveryTimestamp
	} from '$lib/stores/jewelryDesigner';
	import { DesignStep } from '$lib/types/jewelry';

	// Import components
	import WelcomeScreen from '$lib/components/jewelry/WelcomeScreen.svelte';
	import TemplateGallery from '$lib/components/jewelry/TemplateGallery.svelte';
	import DesignWorkspace from '$lib/components/jewelry/DesignWorkspace.svelte';
	import DesignPreview from '$lib/components/jewelry/DesignPreview.svelte';
	import OrderForm from '$lib/components/jewelry/OrderForm.svelte';
	import SuccessScreen from '$lib/components/jewelry/SuccessScreen.svelte';
	import ErrorMessage from '$lib/components/jewelry/ErrorMessage.svelte';
	import RecoveryNotification from '$lib/components/jewelry/RecoveryNotification.svelte';
	import AutoSaveIndicator from '$lib/components/jewelry/AutoSaveIndicator.svelte';

	// Component state using Svelte 5 runes
	let mounted = $state(false);
	let isSubmittingOrder = $state(false);

	onMount(() => {
		console.log('starting');
		// Try to restore previous session
		const restored = jewelryDesignerActions.loadFromLocalStorage();

		// Auto-dismiss recovery notification after 5 seconds
		if (restored) {
			setTimeout(() => {
				jewelryDesignerActions.dismissRecoveryNotification();
			}, 5000);
		}

		mounted = true;
	});

	// Handle navigation between steps
	function handleStepChange(step: DesignStep) {
		jewelryDesignerActions.setStep(step);
	}

	// Handle errors
	function handleError(error: any) {
		console.error('Jewelry Designer Error:', error);
		jewelryDesignerActions.setError({
			type: 'unknown',
			message: 'אירעה שגיאה בלתי צפויה. אנא נסי שוב.',
			details: error
		});
	}

	// Handle order submission
	async function handleOrderSubmit(orderData: { name: string; phone: string; message: string }) {
		if (isSubmittingOrder) return;

		isSubmittingOrder = true;

		try {
			// Prepare order data
			const orderPayload = {
				customerName: orderData.name,
				customerPhone: orderData.phone,
				customerMessage: orderData.message,
				designConfiguration: $designState.designData,
				totalPrice: $totalPrice,
				previewImageBlob: $designState.previewImage || '',
				// Add bracelet-specific data if available
				...($selectedTemplate?.isBracelet &&
					$braceletConfiguration && {
						wristCircumference: $braceletConfiguration.wristCircumference,
						customText: $braceletConfiguration.customText
					})
			};

			// Submit order to API
			const response = await fetch('/api/jewelry-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderPayload)
			});

			if (!response.ok) {
				throw new Error('Failed to submit order');
			}

			const result = await response.json();

			if (result.success) {
				// Move to success step
				handleStepChange(DesignStep.SUCCESS);
			} else {
				throw new Error(result.error || 'Order submission failed');
			}
		} catch (error) {
			console.error('Order submission error:', error);
			handleError(error);
		} finally {
			isSubmittingOrder = false;
		}
	}
</script>

<Head
	title="מעצבת תכשיטים - עיצוב תכשיטים בהתאמה אישית | ברבי עיצובים"
	description="עצבי תכשיט ייחודי בהתאמה אישית עם מעצבת התכשיטים האינטראקטיבית של ברבי. בחרי תבנית, התאימי רכיבים ויצרי תכשיט מושלם עבורך."
	url="https://barbracha.vercel.app/custom-jewelry"
/>

<div class="jewelry-designer-container">
	{#if mounted}
		<!-- Recovery Notification -->
		{#if $hasRecoveredSession && $recoveryTimestamp}
			<RecoveryNotification
				timestamp={$recoveryTimestamp}
				onDismiss={() => jewelryDesignerActions.dismissRecoveryNotification()}
			/>
		{/if}

		<!-- Auto-save Indicator -->
		<AutoSaveIndicator />

		<!-- Error Display -->
		{#if $designerError}
			<div class="error-overlay" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
				<ErrorMessage
					error={$designerError}
					onDismiss={() => jewelryDesignerActions.clearError()}
				/>
			</div>
		{/if}

		<!-- Main Content -->
		<div class="step-container">
			{#if $currentStep === DesignStep.WELCOME}
				<div
					class="step-content"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<WelcomeScreen onStart={() => handleStepChange(DesignStep.TEMPLATE_SELECTION)} />
				</div>
			{:else if $currentStep === DesignStep.TEMPLATE_SELECTION}
				<div
					class="step-content"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<TemplateGallery
						onTemplateSelect={() => handleStepChange(DesignStep.CUSTOMIZATION)}
						onError={(error) => handleError(error)}
					/>

					<!-- Back button -->
					<div class="navigation-controls">
						<button class="back-button" onclick={() => handleStepChange(DesignStep.WELCOME)}>
							חזרה
						</button>
					</div>
				</div>
			{:else if $currentStep === DesignStep.CUSTOMIZATION}
				<div
					class="step-content full-width"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<DesignWorkspace
						onProceed={() => handleStepChange(DesignStep.PREVIEW)}
						onBack={() => handleStepChange(DesignStep.TEMPLATE_SELECTION)}
					/>
				</div>
			{:else if $currentStep === DesignStep.PREVIEW}
				<div
					class="step-content full-width"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<DesignPreview
						onProceed={() => handleStepChange(DesignStep.ORDER)}
						onBack={() => handleStepChange(DesignStep.CUSTOMIZATION)}
					/>
				</div>
			{:else if $currentStep === DesignStep.ORDER}
				<div
					class="step-content"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<OrderForm
						totalPrice={$totalPrice}
						selectedTemplate={$selectedTemplate}
						braceletConfig={$braceletConfiguration}
						onSubmit={handleOrderSubmit}
						onCancel={() => handleStepChange(DesignStep.PREVIEW)}
					/>
				</div>
			{:else if $currentStep === DesignStep.SUCCESS}
				<div
					class="step-content"
					in:fly={{ y: 50, duration: 600, easing: quintOut }}
					out:fly={{ y: -50, duration: 300 }}
				>
					<SuccessScreen
						onRestart={() => {
							jewelryDesignerActions.resetDesign();
							jewelryDesignerActions.clearLocalStorage();
						}}
						onGoHome={() => (window.location.href = '/')}
					/>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Loading state while mounting -->
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>טוען מעצבת תכשיטים...</p>
		</div>
	{/if}
</div>

<style>
	.jewelry-designer-container {
		min-height: 100vh;
		width: 100%;
		background: radial-gradient(#e46faf 0%, #ba98b7 50%, #b66123 100%);
		position: relative;
		overflow-x: hidden;
	}

	.error-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.step-container {
		width: 100%;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.step-content {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
	}

	.step-content.full-width {
		max-width: 100%;
	}

	.back-button {
		background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728);
		color: #374151;
		font-weight: 600;
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.3s ease;
		font-family: 'MakabiYG', sans-serif;
	}

	.back-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(191, 149, 63, 0.3);
	}

	.navigation-controls {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		padding: 1rem;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: #6b7280;
	}

	.loading-spinner {
		width: 3rem;
		height: 3rem;
		border: 3px solid #f3f4f6;
		border-top: 3px solid #bf953f;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.loading-container p {
		font-size: 1.1rem;
		font-family: 'MakabiYG', sans-serif;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.step-container {
			padding: 0.5rem;
		}

		/* Optimize animations for mobile */
		.step-content {
			will-change: transform, opacity;
		}
	}

	/* Reduce motion for users who prefer it */
	@media (prefers-reduced-motion: reduce) {
		.step-content,
		.loading-spinner {
			animation: none;
			transition: none;
		}
	}

	/* Performance optimizations for mobile */
	@media (max-width: 768px) {
		.jewelry-designer-container {
			/* Use hardware acceleration */
			transform: translateZ(0);
			-webkit-transform: translateZ(0);
		}
	}
</style>
