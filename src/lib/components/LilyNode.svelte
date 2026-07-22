<script lang="ts">
  import { LilyStage, type LilyDto } from '$lib/types';
  import LilyArt from './LilyArt.svelte';
  import Butterfly from './Butterfly.svelte';
	import GrowthBar from './GrowthBar.svelte';

  let { 
    lily, 
    position, 
    highlighted = false, 
    dimmed = false, 
    showWishText = true, // 👈 New prop (defaults to true)
    onSelect 
  }: {
    lily: LilyDto;
    position: { x: number; y: number };
    highlighted?: boolean;
    dimmed?: boolean;
    showWishText?: boolean;
    onSelect: (lily: LilyDto) => void;
  } = $props();

  const isBudOrBloom = $derived(
    lily.stage === LilyStage.Bud ||
    lily.stage === LilyStage.AwaitingConfirmation ||
    lily.stage === LilyStage.Bloom
  );
  const size = $derived(
    lily.stage === LilyStage.Seedling ? 36 : lily.stage === LilyStage.Sprout ? 52 : 72
  );
</script>

<button
  type="button"
  onclick={() => onSelect(lily)}
  class="group absolute -translate-x-1/2 -translate-y-full text-left focus:outline-none transition-all duration-500"
  class:opacity-30={dimmed}
  class:scale-110={highlighted}
  class:z-20={highlighted}
  style="left: calc(50% + {position.x}px); top: calc(50% + {position.y}px);"
  aria-label={`Open lily: ${lily.wishText}`}
>
  <div class="relative flex flex-col items-center">
    {#if lily.isFulfilled}
      <Butterfly class="absolute -top-6 -right-4 opacity-80" />
    {/if}

    {#if lily.needsConfirmation}
      <span class="absolute -inset-4 rounded-full border-2 border-dashed border-dusty-rose/60 animate-ripple" aria-hidden="true"></span>
    {:else if isBudOrBloom}
      <span class="absolute -inset-2 rounded-full border border-dashed {lily.isFulfilled ? 'border-dusty-rose/40 animate-ripple' : 'border-sage/30'}" aria-hidden="true"></span>
    {/if}

    <LilyArt stage={lily.stage} fulfilled={lily.isFulfilled} {size} />

    {#if lily.stage !== LilyStage.Bloom}
      <div class="-mt-2 flex flex-col items-center gap-1">
        {#if lily.stage !== LilyStage.AwaitingConfirmation}
          <span class="font-sans text-[9px] uppercase tracking-[0.18em] text-sepia/60">
            {LilyStage[lily.stage]}
          </span>
        {/if}
        <GrowthBar percent={lily.stageProgressPercent} nextStageAt={lily.nextStageAt} />
      </div>
    {/if}

    <!-- 👈 Only render hover popup if showWishText is enabled -->
    {#if showWishText}
      <div class="pointer-events-none absolute top-full mt-3 w-48 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
        <div class="rounded-sm bg-card/95 backdrop-blur px-3 py-2 ring-1 ring-border shadow-sm text-center">
          <p class="font-serif italic text-sm text-ink leading-tight">{lily.wishText}</p>
          <p class="mt-1 text-[10px] uppercase tracking-widest text-sepia/60 font-sans">
            {#if lily.isFulfilled}
              Fulfilled
            {:else if lily.stage === LilyStage.Bloom}
              In full bloom
            {:else}
              {LilyStage[lily.stage]} · growing
            {/if}
          </p>
        </div>
      </div>
    {/if}
  </div>
</button>