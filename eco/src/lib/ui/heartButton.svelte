<script>
  /** @type {{text?: string, className?: string}} */
  let { text = "", className = "" } = $props();
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300&display=swap');
</style>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 100"
  class={`w-40 h-40 ${className}`}  
>
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#BF953F" />
      <stop offset="50%" style="stop-color:#FCF6BA" />
      <stop offset="100%" style="stop-color:#B38728" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <pattern id="decorativePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="5" cy="5" r="1" fill="#FCF6BA" opacity="0.3"/>
    </pattern>
  </defs>
  
  <!-- Background decorative pattern -->
  <path
    d="M50 82l-7-6.5C19 56 5 44 5 28c0-13.5 11.5-24 25-24 8 0 16 4 20 10 4-6 12-10 20-10 13.5 0 25 10.5 25 24 0 16-14 28-38 47.5L50 82z"
    fill="url(#decorativePattern)"
    opacity="0.5"
  />

  <!-- Decorative outer heart border -->
  <path
    d="M50 85l-7-6.5C19 59 5 47 5 31c0-13.5 11.5-24 25-24 8 0 16 4 20 10 4-6 12-10 20-10 13.5 0 25 10.5 25 24 0 16-14 28-38 47.5L50 85z"
    fill="none"
    stroke="#BF953F"
    stroke-width="1.5"
    filter="url(#glow)"
    opacity="0.6"
  />
  
  <!-- Main heart -->
  <path
    fill-rule="evenodd"
    d="M50 82l-7-6.5C19 56 5 44 5 28c0-13.5 11.5-24 25-24 8 0 16 4 20 10 4-6 12-10 20-10 13.5 0 25 10.5 25 24 0 16-14 28-38 47.5L50 82z"
    clip-rule="evenodd"
    fill="url(#goldGradient)"
    filter="url(#glow)"
    class="transition-all duration-300 hover:brightness-110"
  />

  <!-- Decorative swirls -->
  <path
    d="M25 30c0 0 5-8 15-8M75 30c0 0 -5-8 -15-8"
    stroke="#FCF6BA"
    stroke-width="1.5"
    fill="none"
    opacity="0.7"
  />
  
  <!-- Additional decorative elements -->
  <path
    d="M50 15 C 45 15, 40 20, 40 25 C 40 30, 45 35, 50 35 C 55 35, 60 30, 60 25 C 60 20, 55 15, 50 15"
    fill="none"
    stroke="#FCF6BA"
    stroke-width="1"
    opacity="0.5"
  />

  <!-- Decorative dots -->
  <circle cx="25" cy="45" r="1" fill="#FCF6BA" opacity="0.8"/>
  <circle cx="75" cy="45" r="1" fill="#FCF6BA" opacity="0.8"/>
  <circle cx="50" cy="70" r="1" fill="#FCF6BA" opacity="0.8"/>
  
  <text
    x="50"
    y="50"
    text-anchor="middle"
    font-size="18"
    class="font-light"
    fill="#FF69B4"
    style="font-family: 'Rubik', system-ui; text-shadow: 0 0 2px #FFB6C1;"
  >
    {text}
  </text>
</svg>