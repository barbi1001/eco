<script>
	// חולץ מ-mobileItem.svelte שורות 4812–4862 (<g id="bowDecoration">).
	// ids של הגרדיאנטים קיבלו קידומת bow- כדי לא להתנגש עם ids גלובליים בעמוד.
	let { class: className = '', width = '100%' } = $props();
</script>

<svg
	viewBox="-390 -85 780 315"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	style={`width:${width}; pointer-events:none;`}
	aria-hidden="true"
>
	<defs>
		<radialGradient id="bow-pearlGrad" cx="0.35" cy="0.35" r="0.7">
			<stop offset="0" stop-color="#ffffff" />
			<stop offset="0.35" stop-color="#fff6d5" />
			<stop offset="0.85" stop-color="#e8c8d4" />
			<stop offset="1" stop-color="#aa6080" />
		</radialGradient>
		<linearGradient id="bow-ribbonGrad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#f9a3c4" />
			<stop offset="0.4" stop-color="#d52474" />
			<stop offset="0.7" stop-color="#aa1f5d" />
			<stop offset="1" stop-color="#7a1442" />
		</linearGradient>
	</defs>
	<g>
		<circle cx="-360" cy="40" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="-300" cy="20" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="-240" cy="5" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="-180" cy="-5" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="-120" cy="-10" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="360" cy="40" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="300" cy="20" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="240" cy="5" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="180" cy="-5" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<circle cx="120" cy="-10" r="22" fill="url(#bow-pearlGrad)" stroke="#8a1850" stroke-width="2" />
		<ellipse cx="0" cy="22" rx="160" ry="40" fill="rgba(58,10,31,0.45)" />
		<path
			d="M -28,10 C -60,80 -90,150 -120,220 L -75,210 L -50,160 L -10,30 Z"
			fill="url(#bow-ribbonGrad)"
			stroke="#7a1442"
			stroke-width="3"
			stroke-linejoin="round"
		/>
		<path
			d="M 28,10 C 60,80 90,150 120,220 L 75,210 L 50,160 L 10,30 Z"
			fill="url(#bow-ribbonGrad)"
			stroke="#7a1442"
			stroke-width="3"
			stroke-linejoin="round"
		/>
		<path
			d="M -10,-5 C -90,-90 -180,-70 -160,10 C -150,60 -90,55 -10,15 Z"
			fill="url(#bow-ribbonGrad)"
			stroke="#7a1442"
			stroke-width="4"
			stroke-linejoin="round"
		/>
		<path
			d="M 10,-5 C 90,-90 180,-70 160,10 C 150,60 90,55 10,15 Z"
			fill="url(#bow-ribbonGrad)"
			stroke="#7a1442"
			stroke-width="4"
			stroke-linejoin="round"
		/>
		<ellipse cx="0" cy="2" rx="28" ry="32" fill="url(#bow-ribbonGrad)" stroke="#7a1442" stroke-width="4" />
		<ellipse cx="-8" cy="-6" rx="8" ry="14" fill="rgba(255,246,213,0.4)" />
	</g>
</svg>
