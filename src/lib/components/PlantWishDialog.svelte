<script lang="ts">
  import { enhance } from '$app/forms';
  import { LilyCategory, LilyType } from '$lib/types';

  let { open = $bindable(false), onPlanted }: { open: boolean; onPlanted?: () => void } = $props();

  let type = $state(LilyType.GoalOriented);
  let selectedCategory = $state(LilyCategory.Dream);
  let loading = $state(false);
  let errorMsg = $state<string | null>(null);

  let targetDateRaw = $state('');
  let targetDateUtc = $derived(
    targetDateRaw ? new Date(`${targetDateRaw}T00:00:00`).toISOString() : ''
  );

  const categories = Object.entries(LilyCategory).filter(([key]) => isNaN(Number(key)));

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') open = false;
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm animate-fade-up"
    role="presentation"
    onclick={(e) => e.target === e.currentTarget && (open = false)}
  >
    <div
      class="relative bg-parchment border border-border rounded-sm p-5 sm:p-7 max-w-sm w-full shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wish-dialog-title"
      tabindex="-1"
    >
      <div class="grain-paper absolute inset-0 pointer-events-none"></div>
      
      <div class="mb-4 pl-2 sm:pl-3">
        <p class="text-[9px] uppercase tracking-[0.25em] text-sepia/60 font-sans">A new planting</p>
        <h2 id="wish-dialog-title" class="font-serif italic text-xl font-normal leading-tight text-pretty text-ink">
          Plant a Wish
        </h2>
        <p class="font-serif italic text-sepia/70 text-sm mt-0.5">
          Write it as a promise to yourself. A lily will rise from the soil tomorrow.
        </p>
      </div>

      <form
        method="POST"
        action="?/plantWish"
        use:enhance={() => {
          loading = true;
          errorMsg = null;
          return async ({ result, update }) => {
            loading = false;
            if (result.type === 'failure') {
              errorMsg = (result.data as any)?.error ?? 'Something went wrong.';
            } else if (result.type === 'success') {
              open = false;
              onPlanted?.();
            }
            await update();
          };
        }}
        class="space-y-3 mt-1 pl-2 sm:pl-3"
      >
        <input type="hidden" name="category" value={selectedCategory} />

        <div class="space-y-1.5">
          <label for="wishText" class="text-[9px] uppercase tracking-widest text-sepia/70 font-sans">The wish</label>
          <textarea
            id="wishText"
            name="wishText"
            required
            placeholder="I hope to…"
            class="w-full bg-card border border-border rounded-sm px-3 py-2 font-serif text-base italic text-ink outline-none focus:ring-2 focus:ring-sage min-h-14 transition-all"
          ></textarea>
        </div>

        <div class="space-y-1.5">
          <span class="block text-[9px] uppercase tracking-widest text-sepia/70 font-sans">Category</span>
          <div class="flex flex-wrap gap-1">
            {#each categories as [name, value]}
              <button
                type="button"
                onclick={() => selectedCategory = Number(value) as LilyCategory}
                class="px-2.5 py-1 rounded-full text-[11px] transition-all border font-sans 
                  {selectedCategory === Number(value) 
                    ? 'bg-ink text-parchment border-ink' 
                    : 'bg-card text-sepia border-border hover:border-sage/40'}"
              >
                {name}
              </button>
            {/each}
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="wishType" class="text-[9px] uppercase tracking-widest text-sepia/70 font-sans">What kind of wish is this?</label>
          <select id="wishType" name="type" bind:value={type} class="w-full bg-card border border-border rounded-sm px-3 py-1.5 text-sm text-ink font-serif outline-none focus:ring-2 focus:ring-sage transition-all">
            <option value={LilyType.GoalOriented}>A goal, with a date in mind</option>
            <option value={LilyType.Reflective}>A feeling, memory, or promise</option>
          </select>
        </div>

        {#if type === LilyType.GoalOriented}
          <div class="space-y-1.5">
            <label for="targetDate" class="text-[9px] uppercase tracking-widest text-sepia/70 font-sans">Target date</label>
            <input
              id="targetDate"
              type="date"
              bind:value={targetDateRaw}
              required
              class="w-full bg-card border border-border rounded-sm px-3 py-1.5 text-sm text-ink font-serif outline-none focus:ring-2 focus:ring-sage transition-all"
            />
            <input type="hidden" name="targetDate" value={targetDateUtc} />
          </div>
        {/if}

        {#if errorMsg}
          <p class="text-xs text-destructive font-sans">{errorMsg}</p>
        {/if}

        <div class="flex justify-end gap-2 pt-1">
          <button type="button" onclick={() => (open = false)} class="px-3 py-1.5 text-xs text-sepia hover:text-ink transition-colors font-sans rounded-full">
            Not yet
          </button>
          <button
            type="submit"
            disabled={loading}
            class="bg-ink text-parchment hover:bg-ink/85 rounded-full px-5 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors font-sans"
          >
            {loading ? 'Planting...' : 'Plant wish'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}