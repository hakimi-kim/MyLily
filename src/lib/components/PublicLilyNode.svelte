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
</script>

<div
	class="absolute -translate-x-1/2 -translate-y-full text-left transition-all duration-500"
	style="left: calc(50% + {position.x}px); top: calc(50% + {position.y}px);"
>
	<div class="relative flex flex-col items-center group">
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

		<!-- {#if lily.stage !== LilyStage.Bloom}
			<span class="-mt-2 font-sans text-[9px] uppercase tracking-[0.18em] text-sepia/60">
				{LilyStage[lily.stage]}
			</span>
		{/if} -->

		<!-- Hover reveals the wish only if the owner made it visible — otherwise
		     the visitor sees that the lily exists and how it's growing, nothing more. -->
		<div class="pointer-events-none absolute top-full mt-3 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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