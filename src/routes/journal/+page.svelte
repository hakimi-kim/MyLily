<script lang="ts">
  import { enhance } from "$app/forms";
  import lilyLogo from '$lib/assets/lily.png';

  type Sender = { id: number; username: string; displayName?: string };
  type Friend = { id: number; username: string; displayName?: string };
  type Letter = {
    id: number;
    title: string;
    content: string;
    date: string;
    createdAt: string;
    isFromSelf: boolean;
    sender: Sender;
  };

  let { data, form } = $props();

  let openForm = $state(false);
  let viewing = $state<Letter | null>(null);

  let title = $state("");
  let description = $state("");
  let date = $state(new Date().toISOString().slice(0, 10));
  let recipientId = $state("");

  let editing = $state<Letter | null>(null);
  let editTitle = $state("");
  let editDescription = $state("");
  let editDate = $state("");

  let justPlantedId = $state<number | null>(null);
  let toast = $state<string | null>(null);

  let searchQuery = $state("");
  let isDownloading = $state(false);

  let isConfirmingRemove = $state(false);

  const petals = Array.from({ length: 10 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 10,
    size: 8 + Math.random() * 10,
    hue: 320 + Math.random() * 50,
    key: i,
  }));

  function hueFor(id: number) { return 320 + (id * 37) % 60; }
  function senderLabel(l: Letter) { return l.isFromSelf ? "yourself" : (l.sender.displayName ?? l.sender.username); }

  function openEditModal(m: Letter) {
    editing = m;
    editTitle = m.title;
    editDescription = m.content;
    editDate = m.date;
    viewing = null;
  }

  function handleFormResult() {
    return async ({ result, update }: { result: any; update: any }) => {
      if (result.type === "success") {
        const newPlantedId = result.data?.plantedId;
        if (newPlantedId) {
          justPlantedId = newPlantedId;
          setTimeout(() => (justPlantedId = null), 1400);
          toast = "🌸 Planted successfully.";
          setTimeout(() => (toast = null), 3000);
        }
        title = ""; description = ""; recipientId = "";
        date = new Date().toISOString().slice(0, 10);
        openForm = false;
      }
      await update();
    };
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch { return iso; }
  }

  function drawFlowerCanvas(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, hue: number) {
    ctx.save(); ctx.translate(cx, cy);
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate((i / 6) * Math.PI * 2);
      const grad = ctx.createRadialGradient(0, -size * 0.4, size * 0.05, 0, -size * 0.4, size * 0.6);
      grad.addColorStop(0, `oklch(0.92 0.08 ${hue})`);
      grad.addColorStop(1, `oklch(0.75 0.16 ${hue})`);
      ctx.fillStyle = grad;
      ctx.strokeStyle = `oklch(0.65 0.18 ${hue} / 0.4)`;
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.32, -size * 0.2, size * 0.28, -size * 0.85, 0, -size);
      ctx.bezierCurveTo(-size * 0.28, -size * 0.85, -size * 0.32, -size * 0.2, 0, 0);
      ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = `oklch(0.78 0.16 60)`; ctx.beginPath(); ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(/\s+/); let line = ""; let yy = y;
    for (let n = 0; n < words.length; n++) {
      const test = line + words[n] + " ";
      if (ctx.measureText(test).width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, yy); line = words[n] + " "; yy += lineHeight;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, yy);
  }

  function downloadBloomCard(letter: Letter) {
    isDownloading = true;

    setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        const W = 800; const H = 1000; canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d"); if (!ctx) return;

        ctx.fillStyle = "#fdf6ec"; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(140,80,80,0.15)"; ctx.lineWidth = 3; ctx.strokeRect(25, 25, W - 50, H - 50);

        drawFlowerCanvas(ctx, W / 2, 280, 140, hueFor(letter.id));
        ctx.fillStyle = "#5a2b2b"; ctx.textAlign = "center";

        ctx.font = "italic 22px Georgia, serif";
        ctx.fillText(letter.isFromSelf ? "a memory from yourself" : `a letter from ${senderLabel(letter)}`, W / 2, 480);
        ctx.font = "bold 42px Georgia, serif"; wrapText(ctx, letter.title, W / 2, 540, W - 140, 50);
        ctx.font = "20px Georgia, serif"; ctx.fillStyle = "#7a4848"; ctx.fillText(formatDate(letter.date), W / 2, 620);
        ctx.font = "22px Georgia, serif"; ctx.fillStyle = "#5a3838"; wrapText(ctx, letter.content || "—", W / 2, 680, W - 140, 32);
        ctx.font = "italic 18px Georgia, serif"; ctx.fillStyle = "#9a5a6a"; ctx.fillText("planted in Our Memory Garden ♡", W / 2, H - 50);

        const a = document.createElement("a"); 
        a.href = canvas.toDataURL("image/png");
        a.download = `bloom-${letter.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        isDownloading = false;
      }
    }, 50);
  }
</script>

<style>
  @keyframes bloom {
    0% { transform: scale(0.6) rotate(-10deg); opacity: 0; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  :global(.animate-bloom) { animation: bloom 0.6s cubic-bezier(.34,1.3,.64,1); }
  @keyframes petal-fall {
    0% { transform: translateY(-5vh) translateX(0) rotate(0); opacity: 0; }
    15% { opacity: 0.5; }
    100% { transform: translateY(105vh) translateX(30px) rotate(180deg); opacity: 0; }
  }
</style>

{#if toast}
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-ink text-white px-4 py-2 rounded-full shadow-md text-xs tracking-wide">
    {toast}
  </div>
{/if}

<!-- Petals layer -->
<div class="fixed inset-0 pointer-events-none -z-1 overflow-hidden">
  {#each petals as p (p.key)}
    <div style="position: absolute; left: {p.left}%; top: 0; width: {p.size}px; height: {p.size}px; background: oklch(0.88 0.1 {p.hue}); border-radius: 60% 0 60% 0; opacity: 0.5; animation: petal-fall {p.duration}s linear {p.delay}s infinite;"></div>
  {/each}
</div>

<div class="relative min-h-screen w-full pb-12">
  <div class="fixed inset-0 -z-10 bg-linear-to-br from-[oklch(0.98_0.015_85)] via-[oklch(0.96_0.02_350)] to-[oklch(0.95_0.03_25)]"></div>

  <nav class="h-14 px-12 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-black/5">
    <div class="flex items-center gap-1.5">
      <img src={lilyLogo} alt="Lily" class="w-5 h-5" />
      <span class="font-serif text-lg font-medium text-ink tracking-wide">Stargazerr</span>
    </div>
    <a href="/" class="text-xs text-sepia hover:text-ink transition-colors">Home</a>
  </nav>

  <main class="max-w-4xl mx-auto px-4 pt-6">
    <section class="text-center mb-6">
      <p class="font-serif italic text-[10px] tracking-widest uppercase text-[oklch(0.55_0.1_25)] mb-1">for the moments you hold dear</p>
      <h1 class="font-serif text-3xl text-[oklch(0.32_0.06_25)]">Memory Garden</h1>
      <p class="mt-4 text-[oklch(0.45_0.04_30)] max-w-xl mx-auto text-xs">
        Write to yourself, or send a letter to someone you love. Every moment grows this little garden a little more.
      </p>
    </section>

    <section class="rounded-2xl bg-white/40 border border-black/5 shadow-sm p-4 mb-6 flex items-center justify-between max-w-xl mx-auto">
      <p class="text-xs text-[oklch(0.5_0.05_30)]">
        <span class="font-serif text-lg font-bold text-ink">{data.letters.length}</span> {data.letters.length === 1 ? "entry" : "entries"} planted
      </p>
      <button onclick={() => (openForm = true)} class="px-3.5 py-1.5 text-xs rounded-lg bg-[oklch(0.65_0.14_20)] text-white hover:bg-[oklch(0.6_0.16_20)] transition shadow-sm cursor-pointer">
        ✿ Plant a memory
      </button>
    </section>

    {#if data.letters.length === 0}
      <div class="text-center py-12">
        <p class="text-3xl mb-1">🌱</p>
        <p class="text-xs text-[oklch(0.5_0.05_30)] italic">Your garden is waiting.</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {#each data.letters as m (m.id)}
          <button onclick={() => (viewing = m)} class="group text-left rounded-xl p-3 bg-white/80 border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer {justPlantedId === m.id ? 'animate-bloom' : ''}">
            <svg viewBox="-50 -50 100 100" class="w-10 h-10 mx-auto" aria-hidden="true">
              {#each Array.from({ length: 6 }) as _, i}
                <g transform="rotate({(i / 6) * 360})">
                  <path d="M 0 0 C 10 -6 8 -24 0 -30 C -8 -24 -10 -6 0 0 Z" fill="oklch(0.88 0.1 {hueFor(m.id)})" stroke="oklch(0.75 0.12 {hueFor(m.id)} / 0.5)" stroke-width="1" />
                </g>
              {/each}
              <circle r="4" fill="oklch(0.78 0.16 60)" />
            </svg>
            <p class="mt-2 font-serif text-xs text-[oklch(0.35_0.06_25)] line-clamp-1 text-center">{m.title}</p>
            <p class="text-[10px] text-[oklch(0.55_0.05_30)] text-center">{formatDate(m.date)}</p>
            <p class="text-[9px] uppercase tracking-wider text-[oklch(0.6_0.06_25)] text-center opacity-70">
              {m.isFromSelf ? "yourself" : `from ${senderLabel(m)}`}
            </p>
          </button>
        {/each}
      </div>
    {/if}
  </main>
</div>

{#if openForm || editing || viewing}
  <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-xs p-4" 
      onclick={() => { openForm = false; editing = null; viewing = null; searchQuery = ""; isConfirmingRemove = false; }} 
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          openForm = false; editing = null; viewing = null; searchQuery = ""; isConfirmingRemove = false;
        }
      }}
      role="button"
      tabindex="-1"
      aria-label="Close dialog overlay"
    >
    <div 
      onclick={(e) => e.stopPropagation()} 
      onkeydown={(e) => e.stopPropagation()}
      role="dialog" 
      aria-modal="true"
      tabindex="-1"
      class="bg-white/95 backdrop-blur-md rounded-2xl p-5 max-w-sm w-full border border-black/10 shadow-xl max-h-[95vh] overflow-y-auto outline-none"
    >
      
      {#if openForm}
        <h2 class="font-serif text-lg text-ink mb-2">Plant a memory</h2>
        <form method="POST" action="?/plant" use:enhance={handleFormResult} class="space-y-3 text-xs">
          
        <!-- Searchable Friend Dropdown / Combobox -->
        <div>
          <label for="friend-search" class="block text-[10px] uppercase text-sepia/70 mb-0.5">Write to</label>
          <div class="relative">
            <input
              id="friend-search"
              type="text"
              placeholder="Search friend or type 'Yourself'..."
              bind:value={searchQuery}
              class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white focus:border-[oklch(0.65_0.14_20)]"
            />
            <input type="hidden" name="recipientId" bind:value={recipientId} />
            
            {#if searchQuery.trim() !== "" && searchQuery !== "Yourself (private diary)" && !data.friends.some(f => (f.displayName ?? f.username) === searchQuery)}
              {@const matches = data.friends.filter(f => 
                (f.displayName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                (f.username ?? '').toLowerCase().includes(searchQuery.toLowerCase())
              )}
              <div class="absolute z-50 left-0 right-0 mt-1 max-h-32 overflow-y-auto bg-white border border-black/10 rounded-lg shadow-lg text-left">
                <button 
                  type="button" 
                  onclick={() => { 
                    recipientId = ""; 
                    searchQuery = "Yourself (private diary)"; 
                  }}
                  class="w-full px-3 py-1.5 text-left hover:bg-black/5 block text-sepia font-medium"
                >
                  Yourself (private diary)
                </button>
                {#each matches as friend (friend.id)}
                  <button
                    type="button"
                    onclick={() => {
                      recipientId = String(friend.id);
                      searchQuery = friend.displayName ?? friend.username ?? '';
                    }}
                    class="w-full px-3 py-1.5 text-left hover:bg-black/5 block font-medium {recipientId === String(friend.id) ? 'bg-[oklch(0.95_0.02_60)] text-[oklch(0.65_0.14_20)]' : 'text-ink'}"
                  >
                    {friend.displayName ?? friend.username} <span class="text-[10px] opacity-40">@{friend.username}</span>
                  </button>
                {/each}
                {#if matches.length === 0 && !"yourself".includes(searchQuery.toLowerCase())}
                  <div class="px-3 py-2 text-[11px] text-sepia/50 italic">No matching friends found</div>
                {/if}
              </div>
            {/if}
          </div>
          
          {#if recipientId && searchQuery === ""}
            {@const selected = data.friends.find(f => String(f.id) === recipientId)}
            <p class="text-[10px] text-sepia/60 mt-1 pl-1">
              Selected: <span class="font-medium text-ink">{selected?.displayName ?? selected?.username}</span>
              <button type="button" onclick={() => { recipientId = ""; searchQuery = ""; }} class="text-rose-600 ml-1 underline">Clear</button>
            </p>
          {/if}
        </div>

          {#if recipientId && searchQuery !== ""}
            <p class="text-[10px] italic text-[oklch(0.55_0.08_25)] -mt-1 leading-tight">
              Once sent, this letter leaves your garden — only {data.friends.find(f => String(f.id) === recipientId)?.displayName ?? "they"} will see it.
            </p>
          {/if}

          <input name="title" bind:value={title} required class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white focus:border-[oklch(0.65_0.14_20)]" placeholder="Title" />
          
          <textarea name="description" bind:value={description} rows="6" class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white focus:border-[oklch(0.65_0.14_20)] resize-none" placeholder="Tell the story of this moment..."></textarea>
          
          <input name="date" type="date" bind:value={date} class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white focus:border-[oklch(0.65_0.14_20)]" />
          
          <div class="flex gap-1.5 justify-end pt-1">
            <button type="button" onclick={() => { openForm = false; searchQuery = ""; }} class="px-3 py-1.5 rounded-md text-sepia hover:bg-black/5">Cancel</button>
            <button type="submit" class="px-3 py-1.5 rounded-md bg-[oklch(0.65_0.14_20)] text-white">{recipientId ? "Send ✿" : "Plant ✿"}</button>
          </div>
        </form>

        {:else if editing}
          <h2 class="font-serif text-lg text-ink mb-3">Tend to memory</h2>
          <form 
            method="POST" 
            action="?/edit" 
            use:enhance={() => {
              return async ({ result, update }) => {
                if (result.type === "success") {
                  toast = "🌸 Memory updated.";
                  setTimeout(() => (toast = null), 3000);
                  editing = null;
                }
                await update();
              };
            }} 
            class="space-y-3 text-xs"
          >
            <input type="hidden" name="id" value={editing.id} />
            <input name="title" bind:value={editTitle} required class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white" />
            
            <textarea name="description" bind:value={editDescription} rows="6" class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none final-resize-none focus:bg-white"></textarea>
            
            <input name="date" type="date" bind:value={editDate} class="w-full p-2 rounded-lg bg-black/5 border border-transparent outline-none focus:bg-white" />
            <div class="flex gap-1.5 justify-end pt-2">
              <button type="button" onclick={() => (editing = null)} class="px-3 py-1.5 rounded-md text-sepia hover:bg-black/5">Cancel</button>
              <button type="submit" class="px-3 py-1.5 rounded-md bg-[oklch(0.65_0.14_20)] text-white">Save</button>
            </div>
          </form>

          {:else if viewing}
            {@const m = viewing}
            <svg viewBox="-50 -50 100 100" class="w-14 h-14 mx-auto mb-2" aria-hidden="true">
              {#each Array.from({ length: 6 }) as _, i}
                <g transform="rotate({(i / 6) * 360})">
                  <path d="M 0 0 C 10 -6 8 -24 0 -30 C -8 -24 -10 -6 0 0 Z" fill="oklch(0.85 0.12 {hueFor(m.id)})" stroke="oklch(0.7 0.16 {hueFor(m.id)} / 0.4)" stroke-width="1" />
                </g>
              {/each}
              <circle r="4" fill="oklch(0.78 0.16 60)" />
            </svg>
            <p class="text-[10px] text-center text-sepia/70">{formatDate(m.date)} · {m.isFromSelf ? "diary" : `from ${senderLabel(m)}`}</p>
            <h2 class="font-serif text-xl text-center text-ink mt-0.5 mb-2">{m.title}</h2>
            <p class="text-xs text-ink/80 leading-relaxed max-h-48 overflow-y-auto text-center whitespace-pre-wrap px-2 mb-4">{m.content || "—"}</p>
            
            <div class="border-t border-black/5 pt-3 text-xs space-y-2">
              
              {#if isConfirmingRemove}
                <div class="py-1">
                  <p class="text-center text-sepia/80 mb-3 italic">Are you sure you want to uproot this memory?</p>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button onclick={() => (isConfirmingRemove = false)} class="px-2 py-2 rounded-md bg-black/5 hover:bg-black/10 text-sepia text-center font-medium">
                      Cancel
                    </button>
                    <form 
                      method="POST" 
                      action="?/remove" 
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === "success") {
                            toast = "🗑️ Memory removed from garden.";
                            setTimeout(() => (toast = null), 3000);
                            viewing = null;
                            isConfirmingRemove = false;
                          }
                          await update();
                        };
                      }} 
                      class="w-full"
                    >
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" class="w-full px-2 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-center font-medium">
                        Yes, remove it
                      </button>
                    </form>
                  </div>
                </div>
              {:else}
                <div class="grid gap-1.5 {m.isFromSelf ? 'grid-cols-3' : 'grid-cols-2'}">
                  <button 
                    onclick={() => downloadBloomCard(m)} 
                    disabled={isDownloading}
                    class="px-2 py-2 rounded-md bg-[oklch(0.65_0.14_20)] text-white disabled:opacity-70 text-center font-medium"
                  >
                    {isDownloading ? "..." : "Download"}
                  </button>
                  
                  {#if m.isFromSelf}
                    <button onclick={() => openEditModal(m)} class="px-2 py-2 rounded-md bg-black/5 hover:bg-black/10 text-sepia text-center font-medium">
                      Edit
                    </button>
                  {/if}
                  
                  <button 
                    type="button" 
                    onclick={() => (isConfirmingRemove = true)} 
                    class="w-full px-2 py-2 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-center font-medium"
                  >
                    Remove
                  </button>
                </div>

                <button onclick={() => { viewing = null; isConfirmingRemove = false; }} class="w-full px-2 py-2 rounded-md bg-black/5 hover:bg-black/10 text-sepia text-center font-medium">
                  Close
                </button>
              {/if}
            </div>
          {/if}

    </div>
  </div>
{/if}



