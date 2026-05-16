<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import { Send, Check } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import type { CustomJewelryOrder, BraceletConfiguration, JewelryTemplate } from '$lib/types/jewelry';

	interface OrderFormProps {
		totalPrice: number;
		selectedTemplate?: JewelryTemplate | null;
		braceletConfig?: BraceletConfiguration | null;
		onSubmit: (orderData: {
			name: string;
			phone: string;
			message: string;
			email: string;
			city: string;
			street: string;
			houseNumber: string;
			apartment: string;
			postalCode: string;
		}) => Promise<void>;
		onCancel?: () => void;
	}

	let { totalPrice, selectedTemplate, braceletConfig, onSubmit, onCancel }: OrderFormProps = $props();

	let name = $state('');
	let phone = $state('');
	let message = $state('');
	let email = $state('');
	let city = $state('');
	let street = $state('');
	let houseNumber = $state('');
	let apartment = $state('');
	let postalCode = $state('');
	let isLoading = $state(false);
	let isSuccess = $state(false);
	let errorMessage = $state('');

	async function handleSubmit() {
		if (!name || !phone || !email || !city || !street || !houseNumber) return;

		isLoading = true;
		isSuccess = false;
		errorMessage = '';

		try {
			await onSubmit({ name, phone, message, email, city, street, houseNumber, apartment, postalCode });
			isSuccess = true;

			// Reset form after delay
			setTimeout(() => {
				name = '';
				phone = '';
				message = '';
				email = '';
				city = '';
				street = '';
				houseNumber = '';
				apartment = '';
				postalCode = '';
				isSuccess = false;
			}, 3000);
		} catch (error) {
			console.error('Order submission error:', error);
			errorMessage = 'אירעה שגיאה, אנא נסי שוב';
		} finally {
			isLoading = false;
		}
	}

	const isFormValid = $derived(
		name.trim() !== '' &&
		phone.trim() !== '' &&
		email.trim() !== '' &&
		city.trim() !== '' &&
		street.trim() !== '' &&
		houseNumber.trim() !== ''
	);
	const isBraceletOrder = $derived(selectedTemplate?.isBracelet || false);
	const hasCustomText = $derived(braceletConfig?.customText && braceletConfig.customText.trim() !== '');
</script>

<div class="order-form-container" dir="rtl">
	<div class="form-header">
		<h2
			class="text-3xl font-[Heebo] font-black mb-4 bg-gradient-to-r from-[#831843] via-[#be185d] to-[#b45309] text-transparent bg-clip-text sparkly-uv"
		>
			השלימי את ההזמנה
		</h2>
		<p
			class="text-lg font-bold bg-gradient-to-r from-[#be185d] via-[#ec4899] to-[#BF953F] text-transparent bg-clip-text mb-4 pearl-effect"
		>
			השאירי פרטים ואני אחזור אלייך בהקדם!
		</p>
		<div class="price-display mb-4">
			<span class="text-xl font-bold text-pink-900">סכום כולל: ₪{totalPrice}</span>
		</div>

		{#if isBraceletOrder && braceletConfig}
			<div class="bracelet-summary mb-4 p-4 bg-gradient-to-r from-pink-50 to-amber-50 rounded-lg border border-pink-200">
				<h3 class="text-lg font-bold text-pink-800 mb-2">פרטי הצמיד</h3>
				<div class="space-y-2 text-sm text-pink-700">
					<div class="flex justify-between">
						<span>היקף פרק יד:</span>
						<span class="font-medium">{braceletConfig.wristCircumference} ס"מ</span>
					</div>
					{#if hasCustomText}
						<div class="flex justify-between">
							<span>טקסט מותאם:</span>
							<span class="font-medium font-hebrew">{braceletConfig.customText}</span>
						</div>
					{/if}
					{#if braceletConfig.calculatedBeadCount > 0}
						<div class="flex justify-between">
							<span>מספר חרוזים משוער:</span>
							<span class="font-medium">{braceletConfig.calculatedBeadCount}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<form class="flex flex-col space-y-4" onsubmit={preventDefault(handleSubmit)}>
		<input
			class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
			type="text"
			placeholder="שם מלא"
			bind:value={name}
			required
			dir="rtl"
		/>
		<input
			class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
			type="tel"
			placeholder="טלפון נייד"
			bind:value={phone}
			required
			dir="rtl"
			pattern="[0-9]*"
			inputmode="numeric"
		/>
		<input
			class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
			type="email"
			placeholder="אימייל"
			bind:value={email}
			required
			dir="ltr"
			inputmode="email"
		/>
		<div class="grid grid-cols-2 gap-3">
			<input
				class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
				type="text"
				placeholder="עיר"
				bind:value={city}
				required
				dir="rtl"
			/>
			<input
				class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
				type="text"
				placeholder="רחוב"
				bind:value={street}
				required
				dir="rtl"
			/>
		</div>
		<div class="grid grid-cols-3 gap-3">
			<input
				class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
				type="text"
				placeholder="מס' בית"
				bind:value={houseNumber}
				required
				dir="rtl"
			/>
			<input
				class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
				type="text"
				placeholder="דירה (אופציונלי)"
				bind:value={apartment}
				dir="rtl"
			/>
			<input
				class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10"
				type="text"
				placeholder="מיקוד"
				bind:value={postalCode}
				dir="ltr"
				inputmode="numeric"
				pattern="[0-9]*"
			/>
		</div>
		<textarea
			class="text-pink-700 bg-gray-50 border-2 border-transparent bg-clip-padding text-sm rounded-lg block w-full p-3 transition-all duration-300 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#BF953F] focus:border-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-opacity-10 min-h-[100px] resize-y"
			placeholder="הודעה (אופציונלי)"
			bind:value={message}
			dir="rtl"
		></textarea>

		{#if errorMessage}
			<div class="error-message text-red-600 text-center font-medium">
				{errorMessage}
			</div>
		{/if}

		<button
			class="z-[1000] bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-gray-900 font-medium rounded-lg text-base px-6 py-3 text-center
                hover:to-pink-600 hover:from-pink-600 hover:via-[#FCF6BA] transition-all duration-300 hover:opacity-70 focus:ring-4 focus:ring-[#BF953F] focus:ring-opacity-50 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
			type="submit"
			disabled={!isFormValid || isLoading}
		>
			{#if isSuccess}
				<div
					class="success-container"
					in:fly={{ y: 20, duration: 400, easing: backOut }}
				>
					<Check class="check-icon" size={24} />
					<span class="inline-block">נשלח בהצלחה!</span>
				</div>
			{:else}
				<Send class="send-icon {isLoading ? 'send-loading' : ''}" size={20} />
				{#if isLoading}
					<span class="inline-block">שולח...</span>
				{:else}
					<span class="inline-block">לשליחת הזמנה</span>
				{/if}
			{/if}
		</button>

		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="text-pink-700 hover:text-pink-900 font-bold text-center transition-colors"
			>
				חזרה לעיצוב
			</button>
		{/if}
	</form>
</div>

<style>
	.order-form-container {
		max-width: 500px;
		margin: 0 auto;
		padding: 1.5rem;
	}

	.form-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.price-display {
		padding: 1rem;
		background: linear-gradient(90deg, #fce7f3 0%, #fcf6ba 50%, #fce7f3 100%);
		border-radius: 0.5rem;
		border: 2px solid #ec4899;
		box-shadow: 0 2px 10px rgba(236, 72, 153, 0.15);
	}

	.send-icon {
		display: inline-block;
		margin-left: 8px;
	}

	.send-loading {
		animation: sendLoading 1.5s infinite;
	}

	@keyframes sendLoading {
		0% {
			transform: translateX(0) rotate(0);
			opacity: 1;
		}
		50% {
			transform: translateX(50px) rotate(15deg);
			opacity: 0;
		}
		51% {
			transform: translateX(-50px) rotate(-15deg);
			opacity: 0;
		}
		100% {
			transform: translateX(0) rotate(0);
			opacity: 1;
		}
	}

	.success-container {
		display: flex;
		align-items: center;
		gap: 8px;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to right, #4ade80, #22c55e);
		color: white;
		justify-content: center;
	}

	.check-icon {
		animation: checkmark 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}

	@keyframes checkmark {
		0% {
			transform: scale(0) rotate(-45deg);
			opacity: 0;
		}
		100% {
			transform: scale(1) rotate(0);
			opacity: 1;
		}
	}

	.error-message {
		animation: shake 0.5s;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-10px);
		}
		75% {
			transform: translateX(10px);
		}
	}

	.sparkly-uv {
		text-shadow: 0 0 10px rgba(191, 149, 63, 0.3);
	}

	.pearl-effect {
		filter: drop-shadow(0 2px 4px rgba(191, 149, 63, 0.2));
	}

	.bracelet-summary {
		background: linear-gradient(135deg, #fdf2f8 0%, #fef3c7 100%);
		border: 1px solid #f9a8d4;
	}

	.font-hebrew {
		font-family: 'Heebo', 'MakabiYG', Arial, sans-serif;
		direction: rtl;
	}

	/* Mobile responsive styles */
	@media (max-width: 768px) {
		.order-form-container {
			padding: 1rem;
		}

		.form-header h2 {
			font-size: 1.5rem;
		}

		.form-header p {
			font-size: 1rem;
		}

		.price-display {
			padding: 0.75rem;
		}

		.price-display span {
			font-size: 1.1rem;
		}

		.bracelet-summary {
			padding: 0.75rem;
		}

		.bracelet-summary h3 {
			font-size: 1rem;
			margin-bottom: 0.5rem;
		}

		.bracelet-summary .space-y-2 {
			font-size: 0.875rem;
		}

		input,
		textarea {
			font-size: 16px; /* Prevents zoom on iOS */
			padding: 0.875rem;
		}

		textarea {
			min-height: 120px;
		}

		button[type='submit'] {
			padding: 1rem 1.5rem;
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.order-form-container {
			padding: 0.75rem;
		}

		.form-header h2 {
			font-size: 1.25rem;
			margin-bottom: 0.75rem;
		}

		.form-header p {
			font-size: 0.95rem;
		}

		.price-display {
			padding: 0.625rem;
		}

		.price-display span {
			font-size: 1rem;
		}

		.bracelet-summary {
			padding: 0.625rem;
		}

		.bracelet-summary h3 {
			font-size: 0.95rem;
			margin-bottom: 0.5rem;
		}

		.bracelet-summary .space-y-2 {
			font-size: 0.8rem;
		}

		input,
		textarea {
			padding: 0.75rem;
		}
	}
</style>
