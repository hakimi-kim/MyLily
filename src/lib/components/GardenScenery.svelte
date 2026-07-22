<script lang="ts">
  const trees = [{ x: -900, y: -100 }, { x: 800, y: -260 }, { x: -500, y: 320 }, { x: 650, y: 380 }];
  const stones = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2, r = 240 + (i % 3) * 18;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.6 + 60 };
  });
  const petals = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 73) % 1400 - 100, top: (i * 113) % 800 - 100, delay: (i * 0.9) % 12
  }));
  const grass = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 137) % 2200 - 1100, y: ((i * 211) % 1400) - 700, delay: (i % 7) * 0.4
  }));
</script>

<!-- Pond -->
<div class="absolute" style="left: calc(50% - 720px); top: calc(50% - 380px);" aria-hidden="true">
  <div class="relative h-44 w-72">
    <div class="absolute inset-0 rounded-[50%] bg-pond/60 ring-1 ring-inset ring-sage/15"></div>
    <div class="absolute inset-6 rounded-[50%] bg-pond/40"></div>
    <span class="absolute inset-10 rounded-[50%] border border-white/40 animate-ripple"></span>
    <span class="absolute inset-14 rounded-[50%] border border-white/30 animate-ripple" style="animation-delay: 1.5s;"></span>
    <span class="absolute left-8 top-10 size-4 rounded-[50%] bg-sage/40"></span>
    <span class="absolute right-10 bottom-8 size-3 rounded-[50%] bg-sage/50"></span>
    <p class="absolute -bottom-6 left-0 right-0 text-center text-[9px] uppercase tracking-[0.25em] text-sepia/50 font-serif italic">The reflection pond</p>
  </div>
</div>

<!-- Bench -->
<div class="absolute" style="left: calc(50% + 380px); top: calc(50% + 220px);" aria-hidden="true">
  <svg viewBox="0 0 160 70" width="180" class="opacity-80">
    <rect x="10" y="20" width="140" height="8" rx="2" fill="var(--color-sepia)" opacity="0.55" />
    <rect x="10" y="30" width="140" height="6" rx="2" fill="var(--color-sepia)" opacity="0.45" />
    <rect x="18" y="36" width="6" height="22" fill="var(--color-sepia)" opacity="0.55" />
    <rect x="136" y="36" width="6" height="22" fill="var(--color-sepia)" opacity="0.55" />
    <rect x="0" y="58" width="160" height="4" rx="2" fill="var(--color-moss)" opacity="0.25" />
  </svg>
  <p class="text-center text-[9px] uppercase tracking-[0.25em] text-sepia/50 font-serif italic mt-1">Reading bench</p>
</div>

{#each trees as p}
  <div class="absolute -translate-x-1/2 -translate-y-full opacity-70 animate-sway-soft" style="left: calc(50% + {p.x}px); top: calc(50% + {p.y}px);" aria-hidden="true">
    <svg viewBox="0 0 80 100" width="100">
      <ellipse cx="40" cy="40" rx="34" ry="36" fill="var(--color-sage)" opacity="0.55" />
      <ellipse cx="28" cy="36" rx="22" ry="22" fill="var(--color-moss)" opacity="0.4" />
      <rect x="36" y="70" width="8" height="28" fill="var(--color-sepia)" opacity="0.55" />
    </svg>
  </div>
{/each}

{#each stones as s, i (i)}
  <span class="absolute size-5 rounded-full bg-sepia/15 blur-[1px]" style="left: calc(50% + {s.x}px); top: calc(50% + {s.y}px);" aria-hidden="true"></span>
{/each}

{#each petals as p, i (i)}
  <span class="absolute size-2 bg-petal/70 animate-drift"
        style="left: {p.left}px; top: {p.top}px; animation-delay: {p.delay}s; border-radius: 99% 0 99% 50%;" aria-hidden="true"></span>
{/each}

{#each grass as g, i (i)}
  <span class="absolute h-3 w-px bg-moss/35 animate-sway"
        style="left: calc(50% + {g.x}px); top: calc(50% + {g.y}px); animation-delay: {g.delay}s;" aria-hidden="true"></span>
{/each}