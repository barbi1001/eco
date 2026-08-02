<script>
	// שרשרת פנינים אופקית — מבוססת על פניני bowDecoration מ-mobileItem.svelte (4813–4822).
	let { class: className = '', width = '100%' } = $props();
	const pearls = [-360, -280, -200, -120, -40, 40, 120, 200, 280, 360];
</script>

<svg
	viewBox="-390 -30 780 60"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	style={`width:${width}; pointer-events:none;`}
	aria-hidden="true"
>
	<defs>
		<radialGradient id="pearls-pearlGrad" cx="0.35" cy="0.35" r="0.7">
			<stop offset="0" stop-color="#ffffff" />
			<stop offset="0.35" stop-color="#fff6d5" />
			<stop offset="0.85" stop-color="#e8c8d4" />
			<stop offset="1" stop-color="#aa6080" />
		</radialGradient>
	</defs>
	{#each pearls as cx, i}
		<circle
			{cx}
			cy={i % 2 === 0 ? 4 : -4}
			r="18"
			fill="url(#pearls-pearlGrad)"
			stroke="#8a1850"
			stroke-width="2"
		/>
	{/each}
</svg>
