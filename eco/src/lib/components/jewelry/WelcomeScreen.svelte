<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Canvas } from '@threlte/core';
  import Crown3D from '$lib/components/WelcomeCrown3D.svelte';

  interface Props {
    onStart?: () => void;
  }

  let { onStart }: Props = $props();
</script>

<div dir="rtl" class="welcome-screen" in:fade={{ duration: 600 }}>
  <div class="store-container">

    <!-- SVG Store Front Frame -->
    <svg class="store-frame" viewBox="0 0 600 720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   style="stop-color:#BF953F"/>
          <stop offset="30%"  style="stop-color:#FCF6BA"/>
          <stop offset="55%"  style="stop-color:#B38728"/>
          <stop offset="80%"  style="stop-color:#FCF6BA"/>
          <stop offset="100%" style="stop-color:#BF953F"/>
        </linearGradient>
        <linearGradient id="sg-gold-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   style="stop-color:#FCF6BA"/>
          <stop offset="50%"  style="stop-color:#BF953F"/>
          <stop offset="100%" style="stop-color:#FCF6BA"/>
        </linearGradient>
        <linearGradient id="sg-pink" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   style="stop-color:#AA1F5D"/>
          <stop offset="50%"  style="stop-color:#F1FFCA"/>
          <stop offset="100%" style="stop-color:#D52474"/>
        </linearGradient>
        <radialGradient id="sg-center-glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   style="stop-color:#FCF6BA; stop-opacity:0.35"/>
          <stop offset="100%" style="stop-color:#FCF6BA; stop-opacity:0"/>
        </radialGradient>
        <filter id="sg-glow">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <!-- Soft center glow -->
      <ellipse cx="300" cy="380" rx="260" ry="310" fill="url(#sg-center-glow)"/>

      <!-- ══ AWNING ══ -->
      <path d="M 0 115 Q 300 5 600 115 L 600 148 Q 300 42 0 148 Z" fill="url(#sg-gold)"/>
      <path d="M 2 128 Q 300 18 598 128" stroke="url(#sg-pink)" stroke-width="2.5" fill="none" opacity="0.55"/>
      <!-- Awning fringe -->
      <path d="M 0 146 L 15 156 L 30 146 L 45 156 L 60 146 L 75 156 L 90 146 L 105 156 L 120 146
               L 135 156 L 150 146 L 165 156 L 180 146 L 195 156 L 210 146 L 225 156 L 240 146
               L 255 156 L 270 146 L 285 156 L 300 146 L 315 156 L 330 146 L 345 156 L 360 146
               L 375 156 L 390 146 L 405 156 L 420 146 L 435 156 L 450 146 L 465 156 L 480 146
               L 495 156 L 510 146 L 525 156 L 540 146 L 555 156 L 570 146 L 585 156 L 600 146"
            stroke="url(#sg-gold)" stroke-width="2.5" fill="none" opacity="0.65"/>

      <!-- Store sign banner -->
      <rect x="175" y="28" width="250" height="58" rx="13" fill="url(#sg-gold)" opacity="0.93"/>
      <rect x="179" y="32" width="242" height="50" rx="11" fill="white" opacity="0.13"/>
      <!-- Sign gems -->
      <path d="M 190 57 L 195 63 L 190 69 L 185 63 Z" fill="#D52474" opacity="0.7" filter="url(#sg-glow)"/>
      <path d="M 413 57 L 418 63 L 413 69 L 408 63 Z" fill="#D52474" opacity="0.7" filter="url(#sg-glow)"/>

      <!-- Top sparkles -->
      <g filter="url(#sg-glow)">
        <path d="M 300 6 L 305 17 L 316 22 L 305 27 L 300 38 L 295 27 L 284 22 L 295 17 Z"
              fill="url(#sg-gold)" opacity="0.92"/>
        <path d="M 100 52 L 104 60 L 112 64 L 104 68 L 100 76 L 96 68 L 88 64 L 96 60 Z"
              fill="url(#sg-gold)" opacity="0.6"/>
        <path d="M 500 52 L 504 60 L 512 64 L 504 68 L 500 76 L 496 68 L 488 64 L 496 60 Z"
              fill="url(#sg-gold)" opacity="0.6"/>
      </g>

      <!-- ══ LEFT PILLAR ══ -->
      <rect x="0" y="128" width="38" height="550" fill="url(#sg-gold)"/>
      <rect x="5" y="133" width="28" height="540" fill="white" opacity="0.14" rx="3"/>
      <rect x="0" y="118" width="42" height="17" rx="4" fill="url(#sg-gold)"/>
      <rect x="0" y="674" width="42" height="14" rx="4" fill="url(#sg-gold)"/>
      <!-- Pillar side sparkle -->
      <path d="M 19 360 L 22 367 L 29 370 L 22 373 L 19 380 L 16 373 L 9 370 L 16 367 Z"
            fill="url(#sg-gold-v)" opacity="0.38" filter="url(#sg-glow)"/>

      <!-- ══ RIGHT PILLAR ══ -->
      <rect x="562" y="128" width="38" height="550" fill="url(#sg-gold)"/>
      <rect x="567" y="133" width="28" height="540" fill="white" opacity="0.14" rx="3"/>
      <rect x="558" y="118" width="42" height="17" rx="4" fill="url(#sg-gold)"/>
      <rect x="558" y="674" width="42" height="14" rx="4" fill="url(#sg-gold)"/>
      <path d="M 581 360 L 584 367 L 591 370 L 584 373 L 581 380 L 578 373 L 571 370 L 578 367 Z"
            fill="url(#sg-gold-v)" opacity="0.38" filter="url(#sg-glow)"/>

      <!-- ══ WINDOW FRAME ══ -->
      <rect x="38" y="128" width="524" height="550" fill="none"
            stroke="url(#sg-gold)" stroke-width="3.5"/>
      <rect x="42" y="132" width="516" height="542" fill="none"
            stroke="url(#sg-pink)" stroke-width="1.2" opacity="0.38"/>

      <!-- Corner flourishes -->
      <g transform="translate(38,128)">
        <path d="M 0 28 Q 0 0 28 0" stroke="url(#sg-gold)" stroke-width="3" fill="none"/>
        <circle cx="14" cy="14" r="4" fill="url(#sg-pink)" opacity="0.65"/>
      </g>
      <g transform="translate(562,128)">
        <path d="M 0 28 Q 0 0 -28 0" stroke="url(#sg-gold)" stroke-width="3" fill="none"/>
        <circle cx="-14" cy="14" r="4" fill="url(#sg-pink)" opacity="0.65"/>
      </g>
      <g transform="translate(38,678)">
        <path d="M 0 -28 Q 0 0 28 0" stroke="url(#sg-gold)" stroke-width="3" fill="none"/>
        <circle cx="14" cy="-14" r="4" fill="url(#sg-pink)" opacity="0.65"/>
      </g>
      <g transform="translate(562,678)">
        <path d="M 0 -28 Q 0 0 -28 0" stroke="url(#sg-gold)" stroke-width="3" fill="none"/>
        <circle cx="-14" cy="-14" r="4" fill="url(#sg-pink)" opacity="0.65"/>
      </g>

      <!-- Scattered inner sparkles -->
      <g opacity="0.4">
        <path d="M 90 240 L 93 246 L 99 249 L 93 252 L 90 258 L 87 252 L 81 249 L 87 246 Z"
              fill="url(#sg-gold)" filter="url(#sg-glow)"/>
        <path d="M 510 240 L 513 246 L 519 249 L 513 252 L 510 258 L 507 252 L 501 249 L 507 246 Z"
              fill="url(#sg-gold)" filter="url(#sg-glow)"/>
        <path d="M 90 560 L 93 566 L 99 569 L 93 572 L 90 578 L 87 572 L 81 569 L 87 566 Z"
              fill="url(#sg-gold)" filter="url(#sg-glow)"/>
        <path d="M 510 560 L 513 566 L 519 569 L 513 572 L 510 578 L 507 572 L 501 569 L 507 566 Z"
              fill="url(#sg-gold)" filter="url(#sg-glow)"/>
      </g>

      <!-- ══ BOTTOM SHELF ══ -->
      <rect x="0"   y="678" width="600" height="22" fill="url(#sg-gold)"/>
      <rect x="0"   y="696" width="600" height="10" fill="url(#sg-pink)" opacity="0.3"/>
      <rect x="0"   y="704" width="600" height="16" fill="url(#sg-gold)" opacity="0.55"/>
      <!-- Shelf gems -->
      <g filter="url(#sg-glow)">
        <path d="M 300 689 L 308 697 L 300 705 L 292 697 Z" fill="#D52474" opacity="0.7"/>
        <path d="M 240 690 L 246 697 L 240 704 L 234 697 Z" fill="url(#sg-gold)" opacity="0.55"/>
        <path d="M 360 690 L 366 697 L 360 704 L 354 697 Z" fill="url(#sg-gold)" opacity="0.55"/>
        <path d="M 155 691 L 159 696 L 155 701 L 151 696 Z" fill="url(#sg-gold)" opacity="0.38"/>
        <path d="M 445 691 L 449 696 L 445 701 L 441 696 Z" fill="url(#sg-gold)" opacity="0.38"/>
      </g>
    </svg>

    <!-- Sign text pinned over the SVG gold banner -->
    <div class="store-sign-text">מעצבת התכשיטים</div>

    <!-- ══ CONTENT OVERLAY ══ -->
    <div class="welcome-content" in:fly={{ y: 30, duration: 800, delay: 200, easing: quintOut }}>
      <div class="crown-container">
        <Canvas>
          <Crown3D />
        </Canvas>
      </div>

      <div class="welcome-title-plaque">
        <h1 class="welcome-title">ברוכה הבאה למעצבת התכשיטים שלך</h1>
      </div>
      <p class="welcome-subtitle">צרי תכשיט ייחודי ומותאם אישית בקלות ובמהירות</p>

      <div class="features">
        <div class="feature">
          <span class="feature-icon">✨</span>
          <p>בחרי מתבניות מעוצבות</p>
        </div>
        <div class="feature">
          <span class="feature-icon">🎨</span>
          <p>התאימי רכיבים לפי טעמך</p>
        </div>
        <div class="feature">
          <span class="feature-icon">💝</span>
          <p>קבלי תכשיט מושלם</p>
        </div>
      </div>

      <button class="start-button" onclick={onStart}>התחילי לעצב</button>
    </div>

  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&display=swap');

  .welcome-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ff83a8;
    padding: 1rem;
    box-sizing: border-box;
    overflow: hidden;
  }

  /* CSS-grid overlay: SVG and content share the same cell.
     min() picks the smallest of: parent-width, 560px, or the width that fits
     in (100vh-2rem) at the SVG's 600:720 aspect ratio — so no letterboxing ever. */
  .store-container {
    position: relative;
    width: min(100%, 560px, calc((100vh - 2rem) * 600 / 720));
    aspect-ratio: 600 / 720;
    display: grid;
  }

  /* Sign text: absolutely pinned over the SVG gold banner rect
     Banner in SVG viewBox 600×720: x=175 y=28 w=250 h=58
     → left=175/600=29.2% top=28/720=3.9% width=250/600=41.7% height=58/720=8.1% */

  .store-frame {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    filter: drop-shadow(0 8px 32px rgba(191,149,63,0.28));
  }

  /* Content sits in the same grid cell as the SVG */
  .welcome-content {
    grid-area: 1 / 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    /* SVG pillars: x=38–562 (6.3%), inner frame x=42–558 (7%). Use 8.5% → ~1.5% breathing room */
    padding: 18% 8.5% 11%;
    box-sizing: border-box;
    justify-content: space-between;
    gap: 0.2rem;
    overflow: hidden;
  }

  .store-sign-text {
    position: absolute;
    top: 3.9%;
    left: 29.2%;
    width: 41.7%;
    height: 8.1%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    font-family: 'Frank Ruhl Libre', 'David Libre', Georgia, serif;
    font-size: clamp(0.8rem, 2.3vw, 1.15rem);
    font-weight: 900;
    color: #4a0060;
    text-shadow: 0 1px 3px rgba(252, 246, 186, 0.6), 0 0 8px rgba(180, 100, 255, 0.3);
    letter-spacing: 0.06em;
    text-align: center;
  }

  /* 3D Crown — sized relative to the SVG frame height */
  .crown-container {
    position: relative;
    width: 100%;
    height: clamp(5rem, 14vh, 8rem);
    flex-shrink: 0;
    animation: float 3s ease-in-out infinite;
  }

  .crown-container :global(canvas) {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }

  /* Decorative plaque behind the title */
  .welcome-title-plaque {
    position: relative;
    background: linear-gradient(160deg, #2d0040 0%, #3d0030 50%, #2d0040 100%);
    border: 2px solid #BF953F;
    border-radius: 1rem;
    padding: 0.5rem 1.2rem;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
    box-shadow:
      0 6px 28px rgba(139, 0, 100, 0.35),
      0 0 0 1px rgba(252, 246, 186, 0.15) inset,
      0 0 18px rgba(191, 149, 63, 0.12) inset;
  }

  .welcome-title-plaque::before,
  .welcome-title-plaque::after {
    content: '◆';
    position: absolute;
    color: #D52474;
    font-size: 0.65rem;
    filter: drop-shadow(0 0 5px #FF1493);
    top: 50%;
    transform: translateY(-50%);
  }

  .welcome-title-plaque::before { right: -0.55rem; }
  .welcome-title-plaque::after  { left:  -0.55rem; }

  /* Title */
  .welcome-title {
    font-family: 'MakabiYG', sans-serif;
    font-size: clamp(1.1rem, 3.2vw, 1.8rem);
    font-weight: bold;
    background: linear-gradient(to right, #FCF6BA, #FFD700, #FCF6BA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.25;
  }

  /* Subtitle */
  .welcome-subtitle {
    font-size: clamp(0.8rem, 2.2vw, 1rem);
    background: linear-gradient(135deg, #FF1493, #C71585, #8B008B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-family: 'MakabiYG', sans-serif;
    line-height: 1.4;
    font-weight: 600;
  }

  /* Feature cards */
  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
    margin: 0;
    width: 100%;
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(191,149,63,0.25);
    border-radius: 0.65rem;
    padding: 0.4rem 0.3rem;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 8px rgba(191,149,63,0.08);
  }

  .feature-icon {
    font-size: clamp(1rem, 3vw, 1.3rem);
  }

  .feature p {
    font-size: clamp(0.6rem, 1.6vw, 0.8rem);
    background: linear-gradient(135deg, #FF1493, #C71585, #8B008B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-family: 'MakabiYG', sans-serif;
    line-height: 1.3;
    font-weight: 600;
  }

  /* Start button */
  .start-button {
    background: linear-gradient(135deg, #2d0040 0%, #7b1fa2 45%, #6a0080 70%, #2d0040 100%);
    color: #FCF6BA;
    font-weight: 700;
    padding: 0.6rem 2rem;
    border: 2px solid #BF953F;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    font-family: 'MakabiYG', sans-serif;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow:
      0 4px 18px rgba(100, 0, 160, 0.45),
      0 0 0 1px rgba(252, 246, 186, 0.15) inset;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    letter-spacing: 0.03em;
    flex-shrink: 0;
    align-self: center;
    width: fit-content;
  }

  .start-button:hover {
    transform: translateY(-3px);
    box-shadow:
      0 8px 26px rgba(100, 0, 160, 0.55),
      0 0 0 1px rgba(252, 246, 186, 0.25) inset;
  }

  .start-button:active {
    transform: translateY(-1px);
  }

  /* ── Mobile ──────────────────────────── */
  @media (max-width: 480px) {
    .welcome-screen {
      padding: 0.5rem;
    }

    .store-container {
      max-width: 100%;
    }

    .features {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .feature {
      flex-direction: row;
      text-align: right;
      padding: 0.5rem 0.75rem;
      gap: 0.6rem;
    }

    .feature p {
      font-size: 0.82rem;
    }

    .start-button {
      width: 100%;
      padding: 0.85rem 1rem;
    }

    /* On mobile keep features horizontal and crown compact */
    .crown-container {
      height: clamp(4rem, 12vh, 6rem);
    }

    .features {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.3rem;
    }

    .feature {
      flex-direction: column;
      padding: 0.35rem 0.2rem;
    }
  }

  /* ── Tall desktop ──── */
  @media (min-width: 640px) {
    .welcome-screen {
      padding: 1.5rem;
    }
  }
</style>
