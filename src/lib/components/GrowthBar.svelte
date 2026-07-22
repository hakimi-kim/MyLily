<script lang="ts">
  import { LilyStage } from '$lib/types';

  let { 
    percent, 
    nextStageAt, 
    stage 
  }: { 
    percent?: number | null; 
    nextStageAt?: string | null; 
    stage?: LilyStage;
  } = $props();

  let remaining = $state('');

  $effect(() => {
    if (!nextStageAt) {
      remaining = '';
      return;
    }
    const target = new Date(nextStageAt).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        remaining = 'any moment now';
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) remaining = `${days}d ${hours}h left`;
      else if (hours > 0) remaining = `${hours}h ${mins}m left`;
      else remaining = `${mins}m left`;
    }

    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  });
</script>

{#if percent != null && stage !== LilyStage.Bloom}
  <div class="w-full">
    <div class="h-1.5 w-full rounded-full bg-sage/20 overflow-hidden">
      <div class="h-full bg-sage transition-all duration-500" style="width: {percent}%"></div>
    </div>
    {#if remaining}
      <p class="text-[10px] text-sepia/60 mt-0.5 text-center">{remaining}</p>
    {:else if percent >= 100}
      <p class="text-[10px] text-sepia/60 mt-0.5 text-center">awaiting confirmation</p>
    {/if}
  </div>
{/if}