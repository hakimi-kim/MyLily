<script lang="ts">
  import { LilyStage, type PublicLilyDto } from '$lib/types';
  import LilyArt from './LilyArt.svelte';
  import Butterfly from './Butterfly.svelte';
  import GrowthBar from './GrowthBar.svelte';

  let { lily, position }: { lily: PublicLilyDto; position: { x: number; y: number } } = $props();

  const isBudOrBloom = $derived(
    lily.stage === LilyStage.Bud || lily.stage === LilyStage.AwaitingConfirmation || lily.stage === LilyStage.Bloom
  );
  const size = $derived(lily.stage === LilyStage.Seedling ? 36 : lily.stage === LilyStage.Sprout ? 52 : 72);

  let active = $state(false);
  let touchMoved = $state(false);

  function handleTouchStart() {
    touchMoved = false;
  }

  function handleTouchMove() {
    touchMoved = true;
  }

  function handleTouchEnd(e: TouchEvent) {
    // If the user was dragging/panning the garden, ignore the tap
    if (touchMoved) return;
    
    // Toggle wish popover visibility on tap
    e.stopPropagation();
    active = !active;
  }

  function handleBlur() {
    active = false;
  }
</script>

<div
  class="absolute -translate-x-1/2 -translate-y-full text-left transition-all duration-500"
  style="left: calc(50% + {position.x}px); top: calc(50% + {position.y}px);"
>
  <div 
    class="relative flex flex-col items-center group cursor-pointer"
    role="button"
    tabindex="0"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onblur={handleBlur}
  >
    {#if lily.isFulfilled}
      <Butterfly class="absolute -top-6 -right-4 opacity-80" />
    {/if}

    {#if isBudOrBloom}
      <span class="absolute -inset-2 rounded-full border border-dashed {lily.isFulfilled ? 'border-dusty-rose/40 animate-ripple' : 'border-sage/30'}" aria-hidden="true"></span>
    {/if}

    <LilyArt stage={lily.stage} fulfilled={lily.isFulfilled} {size} />
    <GrowthBar 
      percent={lily.stageProgressPercent} 
      nextStageAt={lily.nextStageAt} 
      stage={lily.stage} 
    />

    <!-- Tooltip Popover: Hover on desktop (md:), click/tap active state on touch -->
    <div 
      class="pointer-events-none absolute top-full mt-3 w-48 transition-opacity duration-300 z-30
        {active ? 'opacity-100 pointer-events-auto' : 'opacity-0 md:group-hover:opacity-100'}"
    >
      <div class="rounded-sm bg-card/95 backdrop-blur px-3 py-2 ring-1 ring-border shadow-sm text-center">
        {#if lily.wishText}
          <p class="font-serif italic text-sm text-ink leading-tight">{lily.wishText}</p>
        {:else}
          <p class="font-serif italic text-sm text-sepia/50 leading-tight">a quiet, private wish</p>
        {/if}
      </div>
    </div>
  </div>
</div>