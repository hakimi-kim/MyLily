<script lang="ts">
  import { enhance } from "$app/forms";

  type Memory = {
    id: string;
    title: string;
    description: string;
    date: string;
    hue: number;
    createdAt: number;
  };

  type Stage = {
    name: string;
    emoji: string;
    min: number;
    next: number | null;
    message: string;
  };

  const STAGES: Stage[] = [
    { name: "Seedling",     emoji: "🌱", min: 0,  next: 1,    message: "Your garden has just begun ♡" },
    { name: "Sprout",       emoji: "🌿", min: 2,  next: 3,    message: "Look how it's reaching for the sun!" },
    { name: "Bud",          emoji: "🌷", min: 4,  next: 4,    message: "A little bud — almost ready to bloom." },
    { name: "Blooming Lily",emoji: "🌸", min: 5, next: null, message: "Full bloom. Beautiful, like you." },
  ];

  // Bind directly into data returned by server load functions
  let { data, form } = $props();

  let openForm = $state(false);
  let viewing = $state<Memory | null>(null);
  
  // Create form states
  let title = $state("");
  let description = $state("");
  let date = $state(new Date().toISOString().slice(0, 10));
  
  // Edit form states
  let editing = $state<Memory | null>(null);
  let editTitle = $state("");
  let editDescription = $state("");
  let editDate = $state("");

  let justPlantedId = $state<string | null>(null);
  let toast = $state<string | null>(null);
  let prevStageIdx = $state(0);

  // Ambient falling petals animation layer
  const petals = Array.from({ length: 14 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 10 + Math.random() * 12,
    size: 10 + Math.random() * 14,
    hue: 320 + Math.random() * 50,
    key: i,
  }));

  function getStage(count: number) {
    let idx = 0;
    for (let i = 0; i < STAGES.length; i++) if (count >= STAGES[i].min) idx = i;
    return { stage: STAGES[idx], idx };
  }

  // Compute stages globally from real-time database arrays
  let stageInfo = $derived(getStage(data.memories.length));
  let currentStage = $derived(stageInfo.stage);
  let stageIdx = $derived(stageInfo.idx);
  let nextStage = $derived(STAGES[stageIdx + 1] ?? null);
  let progress = $derived(
    nextStage
      ? Math.min(100, ((data.memories.length - currentStage.min) / (nextStage.min - currentStage.min)) * 100)
      : 100
  );

  // Initialize previous stage marker once server supplies data array
  $effect(() => {
    if (data.memories) {
      prevStageIdx = getStage(data.memories.length).idx;
    }
  });

  // Helper to open edit modal and pre-fill data
  function openEditModal(m: Memory) {
    editing = m;
    editTitle = m.title;
    editDescription = m.description;
    editDate = m.date;
    viewing = null; // Close viewing modal
  }

  // Intercept action completions for custom toast logic and visual bloom highlights
  function handleFormResult() {
    return async ({ result, update }: { result: any; update: any }) => {
      if (result.type === 'success') {
        const newPlantedId = result.data?.plantedId;
        if (newPlantedId) {
          justPlantedId = newPlantedId;
          setTimeout(() => (justPlantedId = null), 1400);
        }

        // Calculate if threshold passed globally
        const newIdx = getStage(data.memories.length + 1).idx; 
        if (newIdx > prevStageIdx) {
          const reached = STAGES[newIdx];
          toast = `${reached.emoji} ${reached.name} — ${reached.message}`;
          setTimeout(() => (toast = null), 4000);
        }
        prevStageIdx = newIdx;

        // Reset local input states
        title = "";
        description = "";
        date = new Date().toISOString().slice(0, 10);
        openForm = false;
      }
      
      // THIS is what seamlessly updates the data without refreshing the page!
      await update(); 
    };
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  // ... (drawFlowerCanvas, wrapText, and downloadBloomCard remain unchanged) ...
  function drawFlowerCanvas(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    hue: number
  ) {
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * Math.PI * 2);
      const grad = ctx.createRadialGradient(0, -size * 0.4, size * 0.05, 0, -size * 0.4, size * 0.6);
      grad.addColorStop(0, `oklch(0.92 0.08 ${hue})`);
      grad.addColorStop(1, `oklch(0.75 0.16 ${hue})`);
      ctx.fillStyle = grad;
      ctx.strokeStyle = `oklch(0.65 0.18 ${hue} / 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.32, -size * 0.2, size * 0.28, -size * 0.85, 0, -size);
      ctx.bezierCurveTo(-size * 0.28, -size * 0.85, -size * 0.32, -size * 0.2, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = `oklch(0.78 0.16 60)`;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(/\s+/);
    let line = "";
    let yy = y;
    for (let n = 0; n < words.length; n++) {
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, yy);
        line = words[n] + " ";
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), x, yy);
  }

  function downloadBloomCard(memory: Memory) {
    const canvas = document.createElement("canvas");
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fdf6ec");
    bg.addColorStop(1, "#f7e2e8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(140,80,80,0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    drawFlowerCanvas(ctx, W / 2, 380, 200, memory.hue);

    ctx.fillStyle = "#5a2b2b";
    ctx.textAlign = "center";
    ctx.font = "italic 28px Georgia, serif";
    ctx.fillText("a memory from", W / 2, 640);

    ctx.font = "bold 56px Georgia, serif";
    wrapText(ctx, memory.title, W / 2, 720, W - 200, 64);

    ctx.font = "26px Georgia, serif";
    ctx.fillStyle = "#7a4848";
    ctx.fillText(formatDate(memory.date), W / 2, 820);

    ctx.font = "28px Georgia, serif";
    ctx.fillStyle = "#5a3838";
    wrapText(ctx, memory.description || "—", W / 2, 900, W - 200, 40);

    ctx.font = "italic 22px Georgia, serif";
    ctx.fillStyle = "#9a5a6a";
    ctx.fillText("planted in Our Memory Garden ♡", W / 2, H - 80);

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `bloom-${memory.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
    a.click();
  }
</script>

<svelte:head>
  <title>Our Memory Garden ♡</title>
  <meta name="description" content="Plant your special moments and watch your lily garden bloom over time." />
</svelte:head>

<div class="fixed inset-0 pointer-events-none -z-[1] overflow-hidden">
  {#each petals as p (p.key)}
    <div
      style="
        position: absolute;
        left: {p.left}%;
        top: 0;
        width: {p.size}px;
        height: {p.size}px;
        background: oklch(0.88 0.1 {p.hue});
        border-radius: 60% 0 60% 0;
        opacity: 0.7;
        animation: petal-fall {p.duration}s linear {p.delay}s infinite;
      "
    ></div>
  {/each}
</div>

<div class="relative min-h-screen w-full overflow-hidden">
  <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[oklch(0.97_0.025_85)] via-[oklch(0.95_0.04_350)] to-[oklch(0.93_0.05_25)]" />

  <header class="relative z-10 max-w-5xl mx-auto px-6 pt-8 flex items-center justify-between">
    <a href="/" class="text-sm text-[oklch(0.45_0.06_25)] hover:underline">← back home</a>
    <p class="font-serif italic text-xs tracking-[0.3em] uppercase text-[oklch(0.55_0.08_25)]">MyLily</p>
  </header>

  <main class="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-24">
    <section class="text-center mb-10">
      <p class="font-serif italic text-xs tracking-[0.3em] uppercase text-[oklch(0.55_0.1_25)] mb-3">
        for the moments you hold dear
      </p>
      <h1 class="font-serif text-4xl md:text-5xl text-[oklch(0.32_0.06_25)] leading-tight">
        Our Memory Garden
      </h1>
      <p class="mt-4 text-[oklch(0.45_0.04_30)] max-w-xl mx-auto">
        Plant a memory, watch a lily bloom. Every moment you treasure grows this little garden a little more.
      </p>
    </section>

    <section class="relative rounded-3xl bg-[oklch(0.98_0.015_85)]/80 backdrop-blur-sm border border-[oklch(0.9_0.03_60)] shadow-[0_30px_80px_-30px_oklch(0.4_0.1_25/0.25)] p-8 md:p-10 mb-8">
      <div class="grid md:grid-cols-[auto_1fr] gap-8 items-center">
        <div class="text-center">
          <div class="text-7xl md:text-8xl select-none" style="animation: lily-float 4s ease-in-out infinite">
            {currentStage.emoji}
          </div>
          <p class="mt-2 font-serif text-lg text-[oklch(0.4_0.08_20)]">{currentStage.name}</p>
        </div>
        <div>
          <div class="flex items-baseline justify-between mb-2">
            <p class="text-sm text-[oklch(0.5_0.05_30)]">
              <span class="font-serif text-2xl text-[oklch(0.35_0.08_25)]">{data.memories.length}</span>
              {data.memories.length === 1 ? "memory" : "memories"} planted
            </p>
            {#if nextStage}
              <p class="text-xs text-[oklch(0.55_0.06_30)]">
                {nextStage.min - data.memories.length} until {nextStage.emoji} {nextStage.name}
              </p>
            {:else}
              <p class="text-xs text-[oklch(0.55_0.06_30)]">Full bloom ♡</p>
            {/if}
          </div>
          <div class="h-3 rounded-full bg-[oklch(0.93_0.02_60)] overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-[oklch(0.78_0.14_350)] to-[oklch(0.7_0.16_20)] transition-all duration-700"
              style="width: {progress}%"
            ></div>
          </div>
          <p class="mt-3 text-sm italic text-[oklch(0.5_0.06_25)]">{currentStage.message}</p>
          <button
            onclick={() => (openForm = true)}
            class="mt-5 px-5 py-3 rounded-xl bg-[oklch(0.65_0.14_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.16_20)] transition shadow-md cursor-pointer"
          >
            ✿ Plant a memory
          </button>
        </div>
      </div>
    </section>

    {#if data.memories.length === 0}
      <div class="text-center py-16">
        <p class="text-5xl mb-3">🌱</p>
        <p class="text-[oklch(0.5_0.05_30)] italic">Your garden is waiting. Plant your first memory.</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {#each data.memories as m (m.id)}
          <button
            onclick={() => (viewing = m)}
            class="group text-left rounded-2xl p-5 bg-[oklch(0.98_0.015_85)] border border-[oklch(0.9_0.03_60)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer {justPlantedId === m.id ? 'animate-bloom' : ''}"
            style={justPlantedId === m.id ? `box-shadow: 0 0 0 4px oklch(0.85 0.1 ${m.hue} / 0.4)` : undefined}
          >
            <svg viewBox="-50 -50 100 100" class="w-16 h-16 mx-auto" aria-hidden="true">
              {#each Array.from({ length: 6 }) as _, i}
                <g transform="rotate({(i / 6) * 360})">
                  <path
                    d="M 0 0 C 14 -8 12 -34 0 -42 C -12 -34 -14 -8 0 0 Z"
                    fill="oklch(0.85 0.12 {m.hue})"
                    stroke="oklch(0.7 0.16 {m.hue})"
                    stroke-width="1"
                  />
                </g>
              {/each}
              <circle r="6" fill="oklch(0.78 0.16 60)" />
            </svg>
            <p class="mt-3 font-serif text-[oklch(0.35_0.06_25)] line-clamp-1 text-center">{m.title}</p>
            <p class="text-xs text-[oklch(0.55_0.05_30)] text-center mt-1">{formatDate(m.date)}</p>
          </button>
        {/each}
      </div>
    {/if}
  </main>
</div>

{#if openForm}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.45)] backdrop-blur-sm p-4"
    onclick={() => (openForm = false)}
    role="dialog"
    aria-modal="true"
  >
    <form
      method="POST"
      action="?/plant"
      use:enhance={handleFormResult}
      onclick={(e) => e.stopPropagation()}
      class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-7 max-w-md w-full border border-[oklch(0.9_0.03_60)] shadow-2xl"
    >
      <h2 class="font-serif text-2xl text-[oklch(0.35_0.06_25)] mb-1">Plant a memory</h2>
      <p class="text-sm text-[oklch(0.5_0.05_30)] mb-5">A new lily will bloom in your garden.</p>

      <label for="title" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Title</label>
      <input id="title" name="title" autofocus bind:value={title} required class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-4" placeholder="Our first sunset" />

      <label for="description" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Description</label>
      <textarea id="description" name="description" bind:value={description} rows="4" class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-4 resize-none" placeholder="Tell the story of this moment..."></textarea>

      <label for="date" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Date</label>
      <input id="date" name="date" type="date" bind:value={date} class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-6" />

      <div class="flex gap-2 justify-end">
        <button type="button" onclick={() => (openForm = false)} class="px-5 py-2.5 rounded-xl text-[oklch(0.45_0.05_30)] hover:bg-[oklch(0.95_0.02_60)] cursor-pointer">Cancel</button>
        <button type="submit" class="px-5 py-2.5 rounded-xl bg-[oklch(0.65_0.14_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.16_20)] cursor-pointer">Plant ✿</button>
      </div>
    </form>
  </div>
{/if}

{#if editing}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.45)] backdrop-blur-sm p-4"
    onclick={() => (editing = null)}
    role="dialog"
    aria-modal="true"
  >
    <form
      method="POST"
      action="?/edit"
      use:enhance={() => {
        return async ({ update }) => {
          await update(); // Automatically fetches fresh data
          editing = null;
        };
      }}
      onclick={(e) => e.stopPropagation()}
      class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-7 max-w-md w-full border border-[oklch(0.9_0.03_60)] shadow-2xl"
    >
      <input type="hidden" name="id" value={editing.id} />
      
      <h2 class="font-serif text-2xl text-[oklch(0.35_0.06_25)] mb-1">Tend to this memory</h2>
      <p class="text-sm text-[oklch(0.5_0.05_30)] mb-5">Update the details of your lily.</p>

      <label for="editTitle" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Title</label>
      <input id="editTitle" name="title" bind:value={editTitle} required class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-4" />

      <label for="editDescription" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Description</label>
      <textarea id="editDescription" name="description" bind:value={editDescription} rows="4" class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-4 resize-none"></textarea>

      <label for="editDate" class="block text-xs uppercase tracking-wider text-[oklch(0.5_0.05_30)] mb-1">Date</label>
      <input id="editDate" name="date" type="date" bind:value={editDate} class="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.97_0.015_85)] border border-[oklch(0.88_0.03_30)] outline-none focus:border-[oklch(0.65_0.14_20)] mb-6" />

      <div class="flex gap-2 justify-end">
        <button type="button" onclick={() => (editing = null)} class="px-5 py-2.5 rounded-xl text-[oklch(0.45_0.05_30)] hover:bg-[oklch(0.95_0.02_60)] cursor-pointer">Cancel</button>
        <button type="submit" class="px-5 py-2.5 rounded-xl bg-[oklch(0.65_0.14_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.16_20)] cursor-pointer">Save Changes</button>
      </div>
    </form>
  </div>
{/if}

{#if viewing}
  {@const m = viewing}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.45)] backdrop-blur-sm p-4"
    onclick={() => (viewing = null)}
    role="dialog"
    aria-modal="true"
  >
    <div
      onclick={(e) => e.stopPropagation()}
      class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-7 max-w-md w-full border border-[oklch(0.9_0.03_60)] shadow-2xl max-h-[90vh] overflow-y-auto"
    >
      <svg viewBox="-50 -50 100 100" class="w-24 h-24 mx-auto" aria-hidden="true">
        {#each Array.from({ length: 6 }) as _, i}
          <g transform="rotate({(i / 6) * 360})">
            <path
              d="M 0 0 C 14 -8 12 -34 0 -42 C -12 -34 -14 -8 0 0 Z"
              fill="oklch(0.85 0.12 {m.hue})"
              stroke="oklch(0.7 0.16 {m.hue})"
              stroke-width="1"
            />
          </g>
        {/each}
        <circle r="6" fill="oklch(0.78 0.16 60)" />
      </svg>

      <p class="text-xs uppercase tracking-widest text-center text-[oklch(0.55_0.08_25)] mt-3">
        {formatDate(m.date)}
      </p>
      <h2 class="font-serif text-3xl text-center text-[oklch(0.32_0.06_25)] mt-1">{m.title}</h2>
      {#if m.description}
        <p class="mt-4 text-[oklch(0.4_0.04_30)] leading-relaxed whitespace-pre-wrap text-center">
          {m.description}
        </p>
      {/if}

      <div class="mt-6 flex flex-wrap gap-2 justify-center">
        <button
          onclick={() => downloadBloomCard(m)}
          class="px-4 py-2.5 rounded-xl bg-[oklch(0.65_0.14_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.16_20)] cursor-pointer"
        >
          ⬇ Download
        </button>
        <button
          onclick={() => openEditModal(m)}
          class="px-4 py-2.5 rounded-xl text-[oklch(0.45_0.05_30)] hover:bg-[oklch(0.95_0.02_60)] cursor-pointer"
        >
          Edit
        </button>
        <form method="POST" action="?/remove" use:enhance={() => { 
            return async ({ update }) => { 
              await update(); // Added update() here to refresh automatically
              viewing = null; 
            }; 
        }}>
          <input type="hidden" name="id" value={m.id} />
          <button
            type="submit"
            class="px-4 py-2.5 rounded-xl text-[oklch(0.5_0.12_25)] hover:bg-[oklch(0.95_0.04_25)] text-sm cursor-pointer"
          >
            Remove
          </button>
        </form>
        <button
          onclick={() => (viewing = null)}
          class="px-4 py-2.5 rounded-xl text-[oklch(0.45_0.05_30)] hover:bg-[oklch(0.95_0.02_60)] cursor-pointer"
        >
          Close
        </button>
        
      </div>
    </div>
  </div>
{/if}

{#if toast}
  <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-[oklch(0.35_0.06_25)] text-[oklch(0.98_0.015_85)] px-5 py-3 rounded-full shadow-2xl text-sm">
    {toast}
  </div>
{/if}

<style>
  @keyframes lily-float {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-8px) rotate(2deg); }
  }
  @keyframes bloom {
    0% { transform: scale(0.4) rotate(-20deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  :global(.animate-bloom) {
    animation: bloom 1.2s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes petal-fall {
    0% { transform: translateY(-10vh) translateX(0) rotate(0); opacity: 0; }
    10% { opacity: 0.7; }
    100% { transform: translateY(110vh) translateX(40px) rotate(360deg); opacity: 0; }
  }
</style>