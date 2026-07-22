<script lang="ts">
  import type { PageData } from './$types';
  import GardenScenery from '$lib/components/GardenScenery.svelte';
  import PublicLilyNode from '$lib/components/PublicLilyNode.svelte';
  import lilyLogo from '$lib/assets/lily.png'; 

  let { data } = $props<{ data: PageData }>();
  let lilies = $derived(data.lilies ?? []);
  
  let pan = $state({ x: 0, y: 0 });
  let zoom = $state(1);
  let drag = $state({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  let pinch: { dist: number; zoom: number } | null = null;

  function nextAutoPosition(i: number) {
    if (i === 0) return { x: 0, y: 0 };
    const g = 2.39996, r = 80 + Math.sqrt(i) * 95, a = i * g;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }

  function onMouseDown(e: MouseEvent) {
    drag = { active: true, startX: e.clientX, startY: e.clientY, baseX: pan.x, baseY: pan.y };
  }
  function onMouseMove(e: MouseEvent) {
    if (!drag.active) return;
    pan = { x: drag.baseX + (e.clientX - drag.startX), y: drag.baseY + (e.clientY - drag.startY) };
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
      drag = { active: true, startX: t.clientX, startY: t.clientY, baseX: pan.x, baseY: pan.y };
    }
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && pinch) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      zoom = Math.min(2, Math.max(0.4, (pinch.zoom * d) / pinch.dist));
    } else if (e.touches.length === 1 && drag.active) {
      const t = e.touches[0];
      pan = { x: drag.baseX + (t.clientX - drag.startX), y: drag.baseY + (t.clientY - drag.startY) };
    }
  }
  function onTouchEnd() {
    pinch = null;
    drag.active = false;
  }
</script>

<main class="relative pt-16 sm:pt-20 h-screen w-full overflow-hidden bg-leaf/15">
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
      {#each lilies as lily, i (lily.id)}
        <PublicLilyNode {lily} position={nextAutoPosition(i)} />
      {/each}
    </div>
  </div>

  <!-- Top navbar -->
  <nav class="absolute top-0 inset-x-0 z-40 h-14 sm:h-16 px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between bg-parchment/90 backdrop-blur-sm border-b border-border">
    <div class="flex items-center gap-2">
      <img src={lilyLogo} alt="Lily" class="w-6 h-6 sm:w-7 sm:h-7" />
      <span class="font-serif text-lg sm:text-xl font-medium text-ink tracking-wide">Stargazerr</span>
    </div>
    <button onclick={() => history.back()} class="text-sm text-sepia hover:text-ink transition-colors">Home</button>
  </nav>

  <div class="absolute bottom-0 inset-x-0 h-32 bg-linear-to-t from-parchment/80 to-transparent pointer-events-none"></div>

  {#if lilies.length === 0}
    <div class="absolute inset-0 flex items-center justify-center">
      <p class="font-serif italic text-sepia/50">Nothing planted here yet.</p>
    </div>
  {/if}

  <p class="hidden sm:block absolute bottom-6 right-6 z-30 text-[10px] uppercase tracking-[0.2em] text-sepia/40 font-sans pointer-events-none">
    Drag to wander · ⌘ + scroll to zoom
  </p>
</main>