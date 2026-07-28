<script lang="ts">
  const messages = ['Waking the garden', 'Planting your wishes', 'Watching it grow', 'In full bloom'];
</script>

<div class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-parchment">
  <div class="grain-paper absolute inset-0 pointer-events-none"></div>

  <svg viewBox="0 0 80 120" width="96" height="144" class="relative">
    <defs>
      <radialGradient id="loading-petal" cx="50%" cy="82%" r="80%">
        <stop offset="0%" stop-color="oklch(0.55 0.22 5)" />
        <stop offset="35%" stop-color="oklch(0.68 0.24 8)" />
        <stop offset="70%" stop-color="oklch(0.86 0.12 8)" />
        <stop offset="100%" stop-color="oklch(0.98 0.015 20)" />
      </radialGradient>
    </defs>

    <ellipse cx="40" cy="115" rx="22" ry="4" fill="oklch(0.45 0.04 60 / 0.18)" />

    <g class="stage-seedling">
      <path d="M40 115 C 40 105, 38 100, 36 95" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M36 95 C 32 92, 30 88, 33 85 C 36 83, 39 86, 38 90 Z" fill="var(--color-sage)" />
    </g>

    <g class="stage-sprout">
      <path d="M40 115 L 40 80" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
      <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" />
      <path d="M40 88 C 52 85, 58 77, 54 69 C 48 71, 42 79, 40 88 Z" fill="var(--color-sage)" opacity="0.9" />
    </g>

    <g class="stage-bud">
      <path d="M40 115 L 40 60" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
      <path d="M40 92 C 30 90, 26 84, 28 78 C 33 79, 38 84, 40 92 Z" fill="var(--color-sage)" />
      <path d="M40 60 C 33 60, 30 52, 34 44 C 38 38, 42 38, 46 44 C 50 52, 47 60, 40 60 Z" fill="var(--color-petal)" stroke="var(--color-dusty-rose)" stroke-opacity="0.4" stroke-width="0.8" />
    </g>

    <g class="stage-bloom">
      <path d="M40 115 L 40 58" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
      <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" />
      <path d="M40 85 C 52 83, 58 77, 54 69 C 48 71, 42 78, 40 85 Z" fill="var(--color-sage)" opacity="0.9" />

      {#each [30, 150, 270] as deg}
        <g transform="rotate({deg} 40 42)" opacity="0.92">
          <path d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z" fill="url(#loading-petal)" stroke="oklch(0.5 0.2 8 / 0.35)" stroke-width="0.5" />
        </g>
      {/each}

      {#each [90, 210, 330] as deg}
        <g transform="rotate({deg} 40 42)">
          <path d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z" fill="url(#loading-petal)" stroke="oklch(0.5 0.2 8 / 0.4)" stroke-width="0.55" />
          <path d="M40 40 C 39 30, 39 20, 40 10" stroke="oklch(0.5 0.22 6 / 0.55)" stroke-width="0.8" fill="none" stroke-linecap="round" />
        </g>
      {/each}

      {#each [0, 60, 120, 180, 240, 300] as deg, i}
        {@const sx = 40 + (i % 2 ? 3.5 : -3.5)}
        <g transform="rotate({deg} 40 42)">
          <path d="M40 42 Q {40 + (i % 2 ? 2 : -2)} 36, {sx} 30" stroke="oklch(0.85 0.05 80)" stroke-width="0.5" fill="none" stroke-linecap="round" />
          <ellipse cx={sx} cy="29.5" rx="0.9" ry="1.6" fill="oklch(0.45 0.15 40)" transform="rotate({i % 2 ? 20 : -20} {sx} 29.5)" />
        </g>
      {/each}

      <path d="M40 42 L 40 27" stroke="oklch(0.75 0.08 100)" stroke-width="0.7" stroke-linecap="round" />
      <circle cx="40" cy="26.5" r="1.1" fill="oklch(0.55 0.14 40)" />

      <g class="butterfly" style="transform-origin: 58px 20px;">
        <g transform="translate(48 10) scale(0.9)">
          <path d="M12 12 C 8 6, 2 6, 4 12 C 2 18, 8 18, 12 12 Z" fill="var(--color-dusty-rose)" opacity="0.85" />
          <path d="M12 12 C 16 6, 22 6, 20 12 C 22 18, 16 18, 12 12 Z" fill="var(--color-lavender)" opacity="0.85" />
          <ellipse cx="12" cy="12" rx="0.8" ry="3" fill="var(--color-ink)" />
        </g>
      </g>
    </g>
  </svg>

  <!-- Stacked text elements controlled by exact CSS timing -->
  <div class="relative h-6 w-full max-w-xs mt-2 flex items-center justify-center">
    <p class="msg msg-1 font-serif italic text-sepia/70 text-sm absolute whitespace-nowrap text-center">{messages[0]}</p>
    <p class="msg msg-2 font-serif italic text-sepia/70 text-sm absolute whitespace-nowrap text-center">{messages[1]}</p>
    <p class="msg msg-3 font-serif italic text-sepia/70 text-sm absolute whitespace-nowrap text-center">{messages[2]}</p>
    <p class="msg msg-4 font-serif italic text-sepia/70 text-sm absolute whitespace-nowrap text-center">{messages[3]}</p>
  </div>
</div>

<style>
  /* SVG & Text share identical animation timing */
  .stage-seedling, .msg-1 { animation: stage1 4.8s infinite; }
  .stage-sprout,   .msg-2 { animation: stage2 4.8s infinite; }
  .stage-bud,      .msg-3 { animation: stage3 4.8s infinite; }
  .stage-bloom,    .msg-4 { animation: stage4 4.8s infinite; }
  
  .butterfly { animation: flutter 2.6s ease-in-out infinite; }

  /* Perfectly aligned keyframes with 1% fade transitions right at the 25% boundary marks */
  @keyframes stage1 { 
    0% { opacity: 0; } 
    1%, 24% { opacity: 1; } 
    25%, 100% { opacity: 0; } 
  }
  @keyframes stage2 { 
    0%, 24% { opacity: 0; } 
    25%, 49% { opacity: 1; } 
    50%, 100% { opacity: 0; } 
  }
  @keyframes stage3 { 
    0%, 49% { opacity: 0; } 
    50%, 74% { opacity: 1; } 
    75%, 100% { opacity: 0; } 
  }
  @keyframes stage4 { 
    0%, 74% { opacity: 0; } 
    75%, 99% { opacity: 1; } 
    100% { opacity: 0; } 
  }

  @keyframes flutter { 
    0%, 100% { transform: translate(0, 0) rotate(0deg); } 
    50% { transform: translate(-2px, -3px) rotate(10deg); } 
  }
</style>