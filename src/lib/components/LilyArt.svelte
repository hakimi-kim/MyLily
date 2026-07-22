<script lang="ts">
  import { LilyStage } from '$lib/types'; // Adjust path to your backend types
  import { cn } from '$lib/utils';

  let { stage = LilyStage.Seedling, fulfilled = false, size = 72, className = '' } = $props<{
    stage: LilyStage;
    fulfilled?: boolean;
    size?: number;
    className?: string;
  }>();

  const uid = $derived(`sg-${stage}-${fulfilled ? 'f' : 'u'}`);
</script>

<svg
  viewBox="0 0 80 120"
  width={size}
  height={size * 1.5}
  class={cn('origin-bottom animate-sway-soft', className)}
  aria-hidden="true"
>
  <defs>
    <!-- Stargazer petal gradient: deep pink core → pale pink → white recurved tip -->
    <radialGradient id="{uid}-petal" cx="50%" cy="82%" r="80%">
      <stop offset="0%" stop-color="oklch(0.55 0.22 5)" />
      <stop offset="35%" stop-color="oklch(0.68 0.24 8)" />
      <stop offset="70%" stop-color="oklch(0.86 0.12 8)" />
      <stop offset="100%" stop-color="oklch(0.98 0.015 20)" />
    </radialGradient>
  </defs>

  <ellipse cx="40" cy="115" rx="22" ry="4" fill="oklch(0.45 0.04 60 / 0.18)" />

  {#if stage === LilyStage.Seedling}
    <path d="M40 115 C 40 105, 38 100, 36 95" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" fill="none" />
    <path d="M36 95 C 32 92, 30 88, 33 85 C 36 83, 39 86, 38 90 Z" fill="var(--color-sage)" />
  {:else if stage === LilyStage.Sprout}
    <path d="M40 115 L 40 80" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
    <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" />
    <path d="M40 88 C 52 85, 58 77, 54 69 C 48 71, 42 79, 40 88 Z" fill="var(--color-sage)" opacity="0.9" />
  {:else if stage === LilyStage.Bud || stage === LilyStage.AwaitingConfirmation}
    <path d="M40 115 L 40 60" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />
    <path d="M40 92 C 30 90, 26 84, 28 78 C 33 79, 38 84, 40 92 Z" fill="var(--color-sage)" />
    <path d="M40 60 C 33 60, 30 52, 34 44 C 38 38, 42 38, 46 44 C 50 52, 47 60, 40 60 Z" fill="var(--color-petal)" stroke="var(--color-dusty-rose)" stroke-opacity="0.4" stroke-width="0.8" />
    {#if stage === LilyStage.AwaitingConfirmation}
      <circle cx="40" cy="48" r="14" fill="oklch(1 0 0 / 0.4)" class="animate-glow" />
    {/if}
{:else if stage === LilyStage.Bloom}
  {#if fulfilled}
    <circle cx="40" cy="40" r="36" fill="oklch(0.95 0.05 10 / 0.5)" class="animate-glow" />
  {/if}

  <!-- Stem -->
  <path d="M40 115 L 40 58" stroke="var(--color-moss)" stroke-width="2" stroke-linecap="round" />

  <!-- Leaves -->
  <path d="M40 95 C 28 92, 22 84, 26 76 C 32 78, 38 86, 40 95 Z" fill="var(--color-sage)" />
  <path d="M40 85 C 52 83, 58 77, 54 69 C 48 71, 42 78, 40 85 Z" fill="var(--color-sage)" opacity="0.9" />

  <!-- Back trio of recurved petals -->
  {#each [30, 150, 270] as deg}
    <g transform="rotate({deg} 40 42)" opacity="0.92">
      <path
        d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z"
        fill="url(#{uid}-petal)"
        stroke="oklch(0.5 0.2 8 / 0.35)"
        stroke-width="0.5"
      />
    </g>
  {/each}

  <!-- Front trio -->
  {#each [90, 210, 330] as deg}
    <g transform="rotate({deg} 40 42)">
      <path
        d="M40 42 C 30 34, 26 20, 34 8 C 38 4, 42 4, 46 8 C 54 20, 50 34, 40 42 Z"
        fill="url(#{uid}-petal)"
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
  <circle cx="40" cy="26.5" r="1.1" fill="oklch(0.55 0.14 40)" />
{/if}
</svg>