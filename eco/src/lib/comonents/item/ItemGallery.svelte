<script>
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import 'swiper/css';
	import 'swiper/css/zoom';
	import 'swiper/css/pagination';
	import 'swiper/css/keyboard';
	import 'swiper/css/effect-cube';
	import { Zoom, Pagination, Keyboard, EffectCube, Mousewheel } from 'swiper';

	/** @type {{ slides: Array<{url: string, isVideo: boolean, formats?: any}>, shem?: string }} */
	let { slides = [], shem = '' } = $props();

	let swiperRef = $state(null);
	let activeIndex = $state(0);

	function srcsetOf(slide) {
		const f = slide.formats;
		if (!f) return undefined;
		const parts = [];
		if (f.small?.url) parts.push(`${f.small.url} 500w`);
		if (f.medium?.url) parts.push(`${f.medium.url} 750w`);
		if (f.large?.url) parts.push(`${f.large.url} 1000w`);
		return parts.length ? parts.join(', ') : undefined;
	}

	function thumbOf(slide) {
		return slide.formats?.thumbnail?.url || slide.formats?.small?.url || slide.url;
	}

	function onSwiper(e) {
		swiperRef = e.detail[0];
	}

	function onSlideChange(e) {
		const sw = e.detail[0];
		activeIndex = sw?.realIndex ?? sw?.activeIndex ?? 0;
	}

	function goTo(i) {
		if (!swiperRef) return;
		if (slides.length > 1 && swiperRef.params?.loop) swiperRef.slideToLoop(i);
		else swiperRef.slideTo(i);
	}
</script>

<div class="gallery" dir="rtl">
	<div class="galleryFrame">
	<Swiper
		effect={'cube'}
		cubeEffect={{
			shadow: true,
			slideShadows: true,
			shadowOffset: 20,
			shadowScale: 0.94
		}}
		zoom={true}
		grabCursor={true}
		mousewheel={true}
		loop={slides.length > 1}
		pagination={{ clickable: true }}
		keyboard={{ enabled: true }}
		modules={[EffectCube, Zoom, Pagination, Keyboard, Mousewheel]}
		class="itemSwiper"
		on:swiper={onSwiper}
		on:slideChange={onSlideChange}
	>
		{#each slides as slide, i}
			<SwiperSlide>
				<div class="swiper-zoom-container">
					{#if slide.isVideo}
						<video autoplay loop muted playsinline src={slide.url}></video>
					{:else}
						<img
							alt={`${shem} תמונת המוצר`}
							src={slide.url}
							srcset={srcsetOf(slide)}
							sizes="(min-width: 1024px) 50vw, 100vw"
							loading={i === 0 ? 'eager' : 'lazy'}
							decoding="async"
						/>
					{/if}
				</div>
			</SwiperSlide>
		{/each}
	</Swiper>
	</div>

	{#if slides.length > 1}
		<div class="thumbs" role="tablist" aria-label="תמונות המוצר">
			{#each slides as slide, i}
				<button
					type="button"
					role="tab"
					aria-selected={activeIndex === i}
					aria-label={`תמונה ${i + 1}`}
					class="thumb"
					class:active={activeIndex === i}
					onclick={() => goTo(i)}
				>
					{#if slide.isVideo}
						<video muted playsinline src={slide.url}></video>
					{:else}
						<img alt="" src={thumbOf(slide)} loading="lazy" decoding="async" />
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gallery {
		width: 100%;
	}
	/* אפקט קוביה: swiper מכריח overflow:visible על אלמנט ה-swiper עצמו כדי
	   להראות את פאות הקוביה בסיבוב. לכן חוסמים את הגלישה במסגרת חיצונית קבועה
	   (ריבוע), אחרת פאות הקוביה המסובבות מנפחות את רוחב העמוד. */
	.galleryFrame {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 1rem;
		margin-bottom: 1.25rem;
	}
	.gallery :global(.itemSwiper) {
		width: 100%;
		height: 100%;
	}
	.gallery :global(.swiper-slide) {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 1rem;
		overflow: hidden;
		background: rgba(255, 246, 213, 0.35);
	}
	.gallery :global(.swiper-zoom-container) {
		width: 100%;
		height: 100%;
	}
	.gallery :global(.swiper-zoom-container img),
	.gallery :global(.swiper-zoom-container video) {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.gallery :global(.swiper-pagination-bullet) {
		background: #fff6d5;
		opacity: 0.6;
		width: 10px;
		height: 10px;
	}
	.gallery :global(.swiper-pagination-bullet-active) {
		background: #aa1f5d;
		opacity: 1;
	}

	.thumbs {
		display: none;
	}
	@media (min-width: 640px) {
		.thumbs {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			margin-top: 0.75rem;
		}
		.thumb {
			width: 64px;
			height: 64px;
			padding: 0;
			border: 2px solid transparent;
			border-radius: 0.5rem;
			overflow: hidden;
			cursor: pointer;
			background: rgba(255, 246, 213, 0.35);
		}
		.thumb.active,
		.thumb:focus-visible {
			border-color: #aa1f5d;
			outline: none;
		}
		.thumb img,
		.thumb video {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
	}
</style>
