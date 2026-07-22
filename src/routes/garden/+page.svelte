<script lang="ts">
  import type { PageData } from './$types';
  import { LilyStage, LilyCategory, type LilyDto } from '$lib/types';
  import GardenScenery from '$lib/components/GardenScenery.svelte';
  import LilyNode from '$lib/components/LilyNode.svelte';
  import PlantWishDialog from '$lib/components/PlantWishDialog.svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import lilyLogo from '$lib/assets/lily.png'; 
  import { Eye, EyeOff } from 'lucide-svelte';
	import { enhance } from '$app/forms';


  let { data } = $props<{ data: PageData }>();

  let showWishText = $derived(data.showWishText ?? true);

  let lilies = $derived(data.lilies ?? []);
  let query = $state('');

  const CATEGORY_NAMES = Object.entries(LilyCategory)
    .filter(([key]) => isNaN(Number(key)))
    .map(([name]) => name);
  type Filter = 'All' | 'Bloomed' | 'Fulfilled' | (typeof CATEGORY_NAMES)[number];
  const FILTERS: Filter[] = ['All', ...CATEGORY_NAMES, 'Bloomed', 'Fulfilled'];

  let filter = $state<Filter>('All');
  let plantOpen = $state(false);
  let highlightId = $state<number | null>(null);

  let pan = $state({ x: 0, y: 0 });
  let zoom = $state(1);
  let drag = $state({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0, moved: false });
  let pinch: { dist: number; zoom: number } | null = null;

  let visitorsOpen = $state(false);
  let visitors = $derived(data.visitors ?? []);

  function formatVisitTime(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function nextAutoPosition(i: number) {
    if (i === 0) return { x: 0, y: 0 };
    const g = 2.39996, r = 80 + Math.sqrt(i) * 95, a = i * g;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }

  let positions = $derived.by(() => {
    const map = new Map<number, { x: number; y: number }>();
    lilies.forEach((l: LilyDto, i: number) => map.set(l.id, nextAutoPosition(i)));
    return map;
  });

  function matches(l: LilyDto) {
    if (filter === 'Bloomed') return l.stage === LilyStage.Bloom;
    if (filter === 'Fulfilled') return l.isFulfilled;
    if (filter !== 'All' && LilyCategory[l.category] !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || l.wishText.toLowerCase().includes(q);
  }
  let visibleIds = $derived(new Set(lilies.filter(matches).map((l: LilyDto) => l.id)));

  $effect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      highlightId = null;
      return;
    }

    const hits = lilies.filter((l: LilyDto) => l.wishText.toLowerCase().includes(q));
    highlightId = hits.length === 1 ? hits[0].id : null;
  });

  function onMouseDown(e: MouseEvent) {
    drag = { active: true, startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y, moved: false };
  }
  function onMouseMove(e: MouseEvent) {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    pan = { x: drag.baseX + dx, y: drag.baseY + dy };
  }
  function endDrag() {
    drag.active = false;
  }
  function onWheel(e: WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom = Math.min(2, Math.max(0.4, zoom - e.deltaY * 0.0015));
  }
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      pinch = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      drag = { active: true, startX: t.clientX, startY: t.clientY, baseX: pan.x, baseY: pan.y, moved: false };
    }
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && pinch) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      zoom = Math.min(2, Math.max(0.4, (pinch.zoom * d) / pinch.dist));
    } else if (e.touches.length === 1 && drag.active) {
      const t = e.touches[0];
      const dx = t.clientX - drag.startX;
      const dy = t.clientY - drag.startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      pan = { x: drag.baseX + dx, y: drag.baseY + dy };
    }
  }
  function onTouchEnd() {
    pinch = null;
    drag.active = false;
  }

  function handleSelect(lily: LilyDto) {
    if (drag.moved) return;
    goto(`/lily/${lily.id}`);
  }
</script>

<main class="relative pt-20 h-screen w-full overflow-hidden bg-leaf/15">
  <div class="grain-paper absolute inset-0 pointer-events-none"></div>

  <div
    class="absolute inset-0 select-none"
    class:cursor-grabbing={drag.active}
    class:cursor-grab={!drag.active}
    onmousedown={onMouseDown}
    onmousemove={onMouseMove}
    onmouseup={endDrag}
    onmouseleave={endDrag}
    onwheel={onWheel}
    ontouchstart={onTouchStart}
    ontouchmove={onTouchMove}
    ontouchend={onTouchEnd}
    role="presentation"
  >
    <div
      class="absolute inset-0 will-change-transform"
      style="transform: translate({pan.x}px, {pan.y}px) scale({zoom}); transform-origin: center center; transition: {drag.active ? 'none' : 'transform 300ms ease-out'};"
    >
      <GardenScenery />
      {#each lilies as lily (lily.id)}
        <LilyNode
          {lily}
          position={positions.get(lily.id) ?? { x: 0, y: 0 }}
          highlighted={highlightId === lily.id}
          dimmed={!visibleIds.has(lily.id)}
          {showWishText}
          onSelect={handleSelect}
        />
      {/each}
    </div>
  </div>

  <!-- Top navbar -->
  <nav class="absolute top-0 inset-x-0 z-40 h-16 px-12 flex items-center justify-between bg-parchment/90 backdrop-blur-sm border-b border-border">
    <div class="flex items-center gap-2">
      <img src={lilyLogo} alt="Lily" class="w-7 h-7" />
      <span class="font-serif text-xl font-medium text-ink tracking-wide">Stargazerr</span>
    </div>

    <div class="flex items-center gap-6 text-sm">

      <form method="POST" action="?/toggleWishVisibility" use:enhance>
        <input type="hidden" name="visible" value={!showWishText} />
        <button type="submit" class="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60 hover:bg-card text-xs text-sepia hover:text-ink transition-colors">
          {#if showWishText}
            <Eye class="w-3.5 h-3.5 text-sage" /><span>Public Wishes</span>
          {:else}
            <EyeOff class="w-3.5 h-3.5 text-dusty-rose" /><span>Private Wishes</span>
          {/if}
        </button>
      </form>

      <a href="/" class="text-sepia hover:text-ink transition-colors">Home</a>
      <span class="text-sepia/50 cursor-default">Journal</span>

      <div class="relative">
        <button
          onclick={() => (visitorsOpen = !visitorsOpen)}
          class="text-sepia hover:text-ink transition-colors flex items-center gap-1"
        >
          Who visits
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform {visitorsOpen ? 'rotate-180' : ''}">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {#if visitorsOpen}
          <button
            class="fixed inset-0 z-40 cursor-default"
            onclick={() => (visitorsOpen = false)}
            aria-label="Close"
          ></button>

          <div class="absolute right-0 top-full mt-2 w-64 bg-card rounded-lg ring-1 ring-border shadow-lg p-3 z-50">
            {#if visitors.length === 0}
              <p class="text-xs text-sepia/50 italic text-center py-4">No one has visited yet.</p>
            {:else}
              <ul class="space-y-2 max-h-64 overflow-y-auto">
                {#each visitors as v (v.visitor?.id)}
                  <li class="flex items-center justify-between text-sm gap-3">
                    <span class="text-ink truncate">{v.visitor?.displayName ?? v.visitor?.username}</span>
                    <span class="text-[10px] text-sepia/50 shrink-0">{formatVisitTime(v.visitedAt)}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </nav>
  <div class="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-parchment/80 to-transparent pointer-events-none"></div>

  <!-- Search -->
  <div class="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-[min(420px,90vw)]">
    <div class="relative">
      <input
        bind:value={query}
        placeholder="Search the garden…"
        class="w-full pl-4 pr-10 py-2.5 rounded-full bg-card/85 backdrop-blur ring-1 ring-border focus:ring-sage outline-none text-sm font-serif italic placeholder:text-sepia/40"
      />
      {#if query}
        <button
          onclick={() => (query = '')}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-sepia/50 hover:text-ink"
          aria-label="Clear"
        >
          ✕
        </button>
      {/if}
    </div>
  </div>

  <!-- Filters + plant -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-[95vw]">
    <div class="flex items-center gap-1 bg-card/85 backdrop-blur-md ring-1 ring-border p-1.5 rounded-full shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] overflow-x-auto">
      {#each FILTERS as f}
        <button
          onclick={() => (filter = f)}
          class="shrink-0 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors font-sans
            {filter === f ? 'bg-ink text-parchment font-medium' : 'text-sepia hover:bg-leaf/40'}"
        >
          {f}
        </button>
      {/each}
      <div class="w-px h-5 bg-border mx-1 shrink-0"></div>
      <button
        onclick={() => (plantOpen = true)}
        aria-label="Plant a wish"
        class="shrink-0 size-9 rounded-full bg-dusty-rose/80 hover:bg-dusty-rose text-parchment flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>
    </div>
  </div>

  <p class="hidden sm:block absolute bottom-20 right-6 z-30 text-[10px] uppercase tracking-[0.2em] text-sepia/40 font-sans pointer-events-none">
    Drag to wander · ⌘ + scroll to zoom
  </p>

  <PlantWishDialog bind:open={plantOpen} onPlanted={() => invalidateAll()} />
</main>