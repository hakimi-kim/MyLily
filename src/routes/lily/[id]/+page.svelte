<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { LilyStage, LilyType, LilyCategory } from '$lib/types';
  import AddProgressDialog from '$lib/components/AddProgressDialog.svelte';
  import LilyArt from '$lib/components/LilyArt.svelte';
  import { enhance } from '$app/forms';
  import { ArrowLeft, Sparkles } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  let lily = $derived(data.lily);
  let timeline = $derived(data.timeline);

  let addOpen = $state(false);
  let showExtend = $state(false);

  let showDeleteModal = $state(false);
  let isDeleting = $state(false);

  let extendDateRaw = $state('');
  let extendDateUtc = $derived(
    extendDateRaw ? new Date(`${extendDateRaw}T00:00:00`).toISOString() : ''
  );

  const dateLabel = $derived(new Date(lily.plantedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }));
</script>

<main class="relative min-h-screen pt-16 pb-12 px-4 overflow-hidden">
  <div class="grain-paper absolute inset-0 pointer-events-none"></div>

  <div class="max-w-[52ch] mx-auto animate-fade-up">
    <button
      onclick={() => goto('/garden')}
      class="mb-3 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-sepia/60 hover:text-ink transition-colors font-sans cursor-pointer"
    >
      <ArrowLeft class="size-3" />
      Back to the garden
    </button>

    <article class="relative bg-card ring-1 ring-border rounded-sm p-5 sm:p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)] overflow-hidden">
      <div class="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-8 opacity-15" aria-hidden="true">
        <span class="size-2.5 rounded-full border border-ink"></span>
        <span class="size-2.5 rounded-full border border-ink"></span>
        <span class="size-2.5 rounded-full border border-ink"></span>
        <span class="size-2.5 rounded-full border border-ink"></span>
      </div>

      <!-- Floating lily glyph -->
      <div class="absolute top-10 right-3 sm:right-5 opacity-95">
        <LilyArt stage={lily.stage} fulfilled={lily.isFulfilled} size={48} />
      </div>

      <header class="mb-6 pl-3 sm:pl-4">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2 mb-3">
          <span class="min-w-0 truncate text-[11px] font-medium uppercase tracking-widest text-dusty-rose font-sans">
            {LilyCategory[lily.category]}
          </span>
          <span class="shrink-0 text-[11px] italic text-sepia/50 font-serif">Planted {dateLabel}</span>
        </div>
        <h1 class="font-serif text-xl sm:text-2xl leading-tight text-pretty mb-2 text-ink">
          {lily.wishText}
        </h1>

        <div class="mt-4 flex items-center gap-2">
          <div class="h-px flex-1 bg-border"></div>
          <span class="text-[9px] font-medium text-sepia/60 uppercase tracking-widest font-sans">
            {lily.isFulfilled
              ? "Fulfilled · radiating"
              : lily.stage === LilyStage.Bloom
                ? "In full bloom"
                : `${LilyStage[lily.stage]} · growing`}
          </span>
          <div class="h-px flex-1 bg-border"></div>
        </div>
      </header>

      <section class="space-y-5 pl-3 sm:pl-4">
        <div class="relative pl-5 border-l border-border">
          <div class="absolute -left-1.25 top-0.5 size-2.5 rounded-full bg-dusty-rose ring-4 ring-card"></div>
          <span class="text-[9px] font-semibold text-sepia/60 block mb-0.5 uppercase tracking-widest font-sans">
            {new Date(lily.plantedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <h4 class="font-serif italic text-base text-ink mb-0.5">Wish planted</h4>
          <p class="text-xs text-sepia/70 leading-relaxed font-sans">
            The first seed pressed into the soil.
          </p>
        </div>

        {#each timeline as entry (entry.id)}
          <div class="relative pl-5 border-l border-border">
            <div class="absolute -left-1 top-1 size-2 rounded-full bg-leaf ring-4 ring-card"></div>
            <span class="text-[9px] font-semibold text-sepia/60 block mb-0.5 uppercase tracking-widest font-sans">
              {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <h4 class="font-serif italic text-base text-ink mb-0.5">Progress update</h4>
            <p class="text-xs text-sepia/70 leading-relaxed text-pretty font-sans">{entry.note}</p>
          </div>
        {/each}

        {#if lily.type === LilyType.GoalOriented && !lily.isFulfilled}
          <button
            onclick={() => (addOpen = true)}
            class="w-full py-2.5 border border-dashed border-border rounded-sm text-xs text-sepia/60 hover:text-ink hover:border-sage/50 transition-all font-medium font-sans cursor-pointer"
          >
            + Add Progress Update
          </button>
        {/if}
      </section>

      {#if lily.needsConfirmation}
        <div class="mt-6 pl-3 sm:pl-4 space-y-2.5">
          <p class="text-xs text-sepia/80 font-serif italic">This wish has reached its date. Did it come true?</p>

          <div class="flex flex-wrap gap-1.5">
            <form
              method="POST"
              action="?/confirmFulfilled"
              use:enhance={() => {
                return async ({ result, update }) => {
                  await update();
                  if (result.type === 'success') {
                    goto('/garden');
                  }
                };
              }}
            >
              <button type="submit" class="inline-flex items-center px-3 py-1.5 rounded-full border border-border text-sepia hover:bg-leaf/40 text-xs transition-colors font-sans cursor-pointer">
                <Sparkles class="size-3.5 mr-1.5" />
                Yes, it bloomed
              </button>
            </form>

            <button onclick={() => (showExtend = !showExtend)} class="px-3 py-1.5 rounded-full border border-border text-sepia hover:bg-leaf/40 text-xs transition-colors font-sans cursor-pointer">
              Not yet — give it more time
            </button>
          </div>

          {#if showExtend}
            <form method="POST" action="?/extend" use:enhance class="flex items-center gap-1.5 pt-1">
              <input
                type="date"
                bind:value={extendDateRaw}
                required
                class="bg-card border border-border rounded-sm px-2.5 py-1.5 text-xs text-ink font-sans outline-none focus:ring-2 focus:ring-sage"
              />
              <input type="hidden" name="newTargetDate" value={extendDateUtc} />
              <button type="submit" class="px-3 py-1.5 rounded-full bg-ink text-parchment hover:bg-ink/85 text-xs font-medium transition-colors font-sans cursor-pointer">
                Extend
              </button>
            </form>
          {/if}
        </div>
      {/if}

      {#if form?.error}
        <p class="mt-4 pl-3 sm:pl-4 text-xs text-destructive font-sans">{form.error}</p>
      {/if}

      <footer class="mt-6 flex flex-row items-center justify-between gap-2.5 sm:gap-4 px-3 sm:px-4">
        <button 
          onclick={() => goto('/garden')} 
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-full border border-border text-sepia hover:bg-leaf/40 text-xs transition-colors font-sans text-center cursor-pointer whitespace-nowrap"
        >
          Return to the garden
        </button>

        <button 
          type="button" 
          class="flex-1 sm:flex-initial px-3 py-1.5 rounded-full border border-red-200 bg-red-50/50 text-red-500 hover:bg-red-50 hover:border-red-300 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap text-center" 
          onclick={() => showDeleteModal = true}
        >
          Delete this wish
        </button>
      </footer>
    </article>
  </div>

  <AddProgressDialog lilyId={lily.id} bind:open={addOpen} />

  {#if showDeleteModal}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div class="w-full max-w-xs sm:max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
        <div class="space-y-1 text-left">
          <h3 id="delete-dialog-title" class="text-sm font-semibold text-ink">
            Delete this wish?
          </h3>
          <p class="text-xs text-sepia/70 leading-relaxed font-sans">
            This action cannot be undone. Are you sure you want to permanently remove this wish from your garden?
          </p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
          <button 
            type="button"
            disabled={isDeleting}
            class="w-full sm:w-auto px-3 py-1.5 rounded-full border border-border text-xs font-medium text-sepia hover:bg-leaf/20 transition-colors cursor-pointer font-sans disabled:opacity-50"
            onclick={() => showDeleteModal = false}
          >
            Cancel
          </button>

          <form
            method="POST"
            action="?/deleteLily"
            class="w-full sm:w-auto"
            use:enhance={() => {
              isDeleting = true;
              return async ({ result, update }) => {
                isDeleting = false;
                if (result.type === 'success' || result.type === 'redirect') {
                  showDeleteModal = false;
                }
                await update();
              };
            }}
          >
            <input type="hidden" name="lilyId" value={lily.id} />
            <button 
              type="submit" 
              disabled={isDeleting}
              class="w-full sm:w-auto px-3 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors cursor-pointer font-sans disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </form>
        </div>

        {#if form?.error}
          <p class="text-red-500 text-xs text-left font-sans">{form.error}</p>
        {/if}
      </div>
    </div>
  {/if}
</main>