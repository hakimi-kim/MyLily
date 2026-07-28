<!-- $lib/components/GardenInfoDialog.svelte -->
<script lang="ts">
  import { Eye, EyeOff } from 'lucide-svelte';


  let { open = $bindable(false) } = $props<{ open?: boolean }>();

  function close() {
    open = false;
  }

  const stages = ['Seedling', 'Sprout', 'Bud', 'Bloom'];
  const descs = ['Just planted', 'Taking root', 'Almost there', 'Fully grown'];
</script>

{#if open}
  <div
    class="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    role="dialog"
    aria-modal="true"
    aria-labelledby="garden-info-title"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
  >
    <div
      class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg space-y-5 max-h-[85vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div class="flex items-center justify-between">
        <h2 id="garden-info-title" class="font-serif text-lg text-ink">How the garden grows</h2>
        <button onclick={close} aria-label="Close" class="text-sepia/60 hover:text-ink transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div class="rounded-xl border border-border bg-leaf/5 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-sepia/50 mb-3 text-center">Growth stages</p>
        <div class="grid grid-cols-4 gap-2">

          <!-- Seedling -->
          <div class="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 80 120" width="40" height="60" class="info-seedling">
              <path d="M40 115 C 40 105, 38 100, 36 95" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" fill="none" />
              <path d="M36 95 C 32 92, 30 88, 33 85 C 36 83, 39 86, 38 90 Z" fill="var(--color-sage)" class="info-leaf-pulse" />
            </svg>
            <p class="font-serif italic text-ink text-xs text-center leading-tight">{stages[0]}</p>
            <p class="text-[10px] text-sepia/50 text-center leading-tight">{descs[0]}</p>
          </div>

          <!-- Sprout -->
          <div class="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 80 120" width="40" height="60" class="info-sprout">
              <path d="M40 115 L 40 80" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
              <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" class="info-sprout-leaf-left" />
              <path d="M40 88 C 52 85, 58 77, 54 69 C 48 71, 42 79, 40 88 Z" fill="var(--color-sage)" opacity="0.9" class="info-sprout-leaf-right" />
            </svg>
            <p class="font-serif italic text-ink text-xs text-center leading-tight">{stages[1]}</p>
            <p class="text-[10px] text-sepia/50 text-center leading-tight">{descs[1]}</p>
          </div>

          <!-- Bud -->
          <div class="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 80 120" width="40" height="60" class="info-bud-stem">
              <path d="M40 115 L 40 60" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
              <path d="M40 92 C 30 90, 26 84, 28 78 C 33 79, 38 84, 40 92 Z" fill="var(--color-sage)" />
              <g class="info-bud">
                <path d="M40 60 C 33 60, 30 52, 34 44 C 38 38, 42 38, 46 44 C 50 52, 47 60, 40 60 Z" fill="var(--color-petal)" stroke="var(--color-dusty-rose)" stroke-opacity="0.4" stroke-width="0.8" />
              </g>
            </svg>
            <p class="font-serif italic text-ink text-xs text-center leading-tight">{stages[2]}</p>
            <p class="text-[10px] text-sepia/50 text-center leading-tight">{descs[2]}</p>
          </div>

          <!-- Bloom -->
          <div class="flex flex-col items-center gap-1.5">
            <svg viewBox="0 0 80 120" width="40" height="60" class="info-bloom-plant">
              <defs>
                <radialGradient id="dialog-info-petal" cx="50%" cy="82%" r="80%">
                  <stop offset="0%" stop-color="oklch(0.55 0.22 5)" />
                  <stop offset="35%" stop-color="oklch(0.68 0.24 8)" />
                  <stop offset="70%" stop-color="oklch(0.86 0.12 8)" />
                  <stop offset="100%" stop-color="oklch(0.98 0.015 20)" />
                </radialGradient>
              </defs>

              <!-- Stem -->
              <path d="M40 115 L 40 58" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />

              <!-- Leaves -->
              <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" />
              <path d="M40 85 C 52 83, 58 77, 54 69 C 48 71, 42 78, 40 85 Z" fill="var(--color-sage)" opacity="0.9" />

              <g class="info-bloom">
                <!-- Back trio of recurved petals -->
                {#each [30, 150, 270] as deg}
                  <g transform="rotate({deg} 40 42)" opacity="0.92">
                    <path
                      d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z"
                      fill="url(#dialog-info-petal)"
                      stroke="oklch(0.5 0.2 8 / 0.35)"
                      stroke-width="0.5"
                    />
                  </g>
                {/each}

                <!-- Front trio with stripes and speckles -->
                {#each [90, 210, 330] as deg}
                  <g transform="rotate({deg} 40 42)">
                    <path
                      d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z"
                      fill="url(#dialog-info-petal)"
                      stroke="oklch(0.5 0.2 8 / 0.4)"
                      stroke-width="0.55"
                    />
                    <!-- Central pink stripe -->
                    <path
                      d="M40 40 C 39 30, 39 20, 40 10"
                      stroke="oklch(0.5 0.22 6 / 0.55)"
                      stroke-width="0.8"
                      fill="none"
                      stroke-linecap="round"
                    />
                    <!-- Crimson speckles -->
                    <circle cx="38.5" cy="30" r="0.6" fill="oklch(0.42 0.2 8)" />
                    <circle cx="41.2" cy="28" r="0.5" fill="oklch(0.42 0.2 8)" />
                    <circle cx="39" cy="24" r="0.55" fill="oklch(0.42 0.2 8)" />
                    <circle cx="41" cy="22" r="0.45" fill="oklch(0.42 0.2 8)" />
                    <circle cx="38" cy="18" r="0.4" fill="oklch(0.42 0.2 8)" />
                    <circle cx="41.5" cy="16" r="0.35" fill="oklch(0.42 0.2 8)" />
                  </g>
                {/each}

                <!-- Six stamens with rust anthers -->
                {#each [0, 60, 120, 180, 240, 300] as deg, i}
                  {@const sx = 40 + (i % 2 ? 3.5 : -3.5)}
                  <g transform="rotate({deg} 40 42)">
                    <path
                      d="M40 42 Q {40 + (i % 2 ? 2 : -2)} 36, {sx} 30"
                      stroke="oklch(0.85 0.05 80)"
                      stroke-width="0.5"
                      fill="none"
                      stroke-linecap="round"
                    />
                    <ellipse
                      cx={sx} cy="29.5" rx="0.9" ry="1.6"
                      fill="oklch(0.45 0.15 40)"
                      transform="rotate({i % 2 ? 20 : -20} {sx} 29.5)"
                    />
                  </g>
                {/each}

                <!-- Pistil -->
                <path d="M40 42 L 40 27" stroke="oklch(0.75 0.08 100)" stroke-width="0.7" stroke-linecap="round" />
                <circle cx="40" cy="26.5" r="1.1" fill="oklch(0.55 0.14 40)" class="info-glow" />
              </g>
            </svg>
            <p class="font-serif italic text-ink text-xs text-center leading-tight">{stages[3]}</p>
            <p class="text-[10px] text-sepia/50 text-center leading-tight">{descs[3]}</p>
          </div>

        </div>
      </div>

      <div class="rounded-xl border border-border bg-amber-50/40 p-4 flex items-center gap-3">
        <svg viewBox="0 0 24 24" width="32" height="32" class="shrink-0 info-butterfly">
          <path d="M12 12 C 8 6, 2 6, 4 12 C 2 18, 8 18, 12 12 Z" fill="var(--color-dusty-rose)" opacity="0.85" />
          <path d="M12 12 C 16 6, 22 6, 20 12 C 22 18, 16 18, 12 12 Z" fill="var(--color-lavender)" opacity="0.85" />
          <ellipse cx="12" cy="12" rx="0.8" ry="3" fill="var(--color-ink)" />
        </svg>
        <div>
          <p class="font-serif italic text-ink text-sm">The visiting butterfly</p>
          <p class="text-xs text-sepia/60">A small flourish that settles once a wish reaches full bloom.</p>
        </div>
      </div>

      <div class="space-y-4 text-sm text-sepia/80 leading-relaxed font-sans">
        <p>Every wish you plant grows into a lily. There are two kinds of wish, and each grows differently.</p>

        <div class="rounded-xl border border-border bg-leaf/10 p-4 space-y-1.5">
          <p class="font-serif italic text-ink text-base">Goal wishes</p>
          <p>Set your own target date when you plant. Your lily grows steadily toward that date. When the date arrives, you'll be asked whether the wish came true — say yes and it blooms, or push the date further out.</p>
        </div>

        <div class="rounded-xl border border-border bg-dusty-rose/10 p-4 space-y-1.5">
          <p class="font-serif italic text-ink text-base">Memory wishes</p>
          <p>No date to set — these bloom on their own over 5 days, moving through each stage above along the way.</p>
        </div>
      </div>

      <div class="space-y-3">
        <p class="font-serif italic text-ink text-base px-1">Who can see your wishes</p>

        <div class="rounded-xl border border-border bg-leaf/10 p-4 flex gap-3">
          <Eye class="w-4 h-4 text-sage shrink-0 mt-0.5" />
          <div>
            <p class="font-serif italic text-ink text-sm">Public wishes</p>
            <p class="text-xs text-sepia/70 leading-relaxed mt-0.5">
              Friends who visit your garden can see the lily and read the wish text behind it.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-dusty-rose/10 p-4 flex gap-3">
          <EyeOff class="w-4 h-4 text-dusty-rose shrink-0 mt-0.5" />
          <div>
            <p class="font-serif italic text-ink text-sm">Private wishes</p>
            <p class="text-xs text-sepia/70 leading-relaxed mt-0.5">
              Friends see the lily itself, growing in your garden — the wish behind it stays hidden.
            </p>
          </div>
        </div>

        <p class="text-xs text-sepia/50 px-1 leading-relaxed">
          The toggle at the top of your garden controls this for every wish you've planted.
        </p>
      </div>

      <button
        onclick={close}
        class="w-full py-2.5 rounded-full bg-ink text-parchment text-xs font-medium hover:bg-ink/85 transition-colors"
      >
        Got it
      </button>
    </div>
  </div>
{/if}

<style>
  /* Base Stem Sways */
  .info-seedling {
    animation: sway 3s ease-in-out infinite;
    transform-origin: 40px 115px;
  }
  .info-sprout {
    animation: sway 3.6s ease-in-out infinite 0.2s;
    transform-origin: 40px 115px;
  }
  .info-bud-stem {
    animation: sway 4s ease-in-out infinite 0.4s;
    transform-origin: 40px 115px;
  }
  .info-bloom-plant {
    animation: sway 4.4s ease-in-out infinite 0.6s;
    transform-origin: 40px 115px;
  }

  /* Specific Internal Stage Animations */
  .info-leaf-pulse {
    animation: pulse-leaf 2.8s ease-in-out infinite;
    transform-origin: 36px 95px;
  }
  .info-sprout-leaf-left {
    animation: wave-leaf-left 3.2s ease-in-out infinite;
    transform-origin: 40px 95px;
  }
  .info-sprout-leaf-right {
    animation: wave-leaf-right 3.2s ease-in-out infinite 0.3s;
    transform-origin: 40px 88px;
  }
  .info-bud {
    animation: breathe-bud 2.6s ease-in-out infinite;
    transform-origin: 40px 52px;
  }
  .info-bloom {
    animation: breathe-bloom 3.4s ease-in-out infinite;
    transform-origin: 40px 42px;
  }

  /* Ambient Details */
  .info-glow { animation: glow 2s ease-in-out infinite; }
  .info-butterfly { animation: flutter 2.4s ease-in-out infinite; transform-origin: 12px 12px; }

  /* Keyframes */
  @keyframes sway {
    0%, 100% { transform: rotate(-2.5deg); }
    50% { transform: rotate(2.5deg); }
  }

  @keyframes pulse-leaf {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }

  @keyframes wave-leaf-left {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-4deg); }
  }

  @keyframes wave-leaf-right {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(4deg); }
  }

  @keyframes breathe-bud {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }

  @keyframes breathe-bloom {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.04) rotate(1.5deg); }
  }

  @keyframes glow {
    0%, 100% { opacity: 0.5; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes flutter {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-3px) rotate(6deg); }
  }
</style>