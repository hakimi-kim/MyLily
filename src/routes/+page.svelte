<script lang="ts">
  import { reportLovableError } from "$lib/lovable-error-reporting";
  import us from "/src/lib/assets/us.jpg"

  type Stage = "name" | "question" | "photo" | "home";

  // Svelte 5 State Runes
  let stage = $state<Stage>("name");
  let name = $state("");
  let error = $state("");
  let noPos = $state<{ x: number; y: number } | null>(null);

  function submitName(e: SubmitEvent) {
    e.preventDefault();
    const n = name.trim().toLowerCase();
    if (n === "amera" || n === "zahra") {
      stage = "question";
      error = "";
    } else {
      error = "Hmm, this site isn't for you ♡";
    }
  }

  function dodge() {
    const pad = 80;
    const x = Math.random() * (window.innerWidth - pad * 2) + pad;
    const y = Math.random() * (window.innerHeight - pad * 2) + pad;
    noPos = { x, y };
  }

  function confirm() {
    stage = "photo";
    setTimeout(() => {
      stage = "home";
    }, 3000);
  }

  // PRNG Generator
  function mulberry32(a: number) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Svelte Action to manage canvas lifecycle seamlessly inside the template
  function lilyCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawLily = (cx: number, cy: number, size: number, rot: number, hue: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Stem
      ctx.strokeStyle = `oklch(0.65 0.1 145)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.3, size * 1.2, size * 0.1, size * 2.5);
      ctx.stroke();

      // 6 petals
      const petals = 6;
      for (let p = 0; p < petals; p++) {
        const angle = (p / petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(angle);
        const grad = ctx.createRadialGradient(0, -size * 0.4, size * 0.05, 0, -size * 0.4, size * 0.6);
        grad.addColorStop(0, `oklch(0.92 0.08 ${hue})`);
        grad.addColorStop(1, `oklch(0.78 0.14 ${hue})`);
        ctx.fillStyle = grad;
        ctx.strokeStyle = `oklch(0.65 0.16 ${hue} / 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size * 0.3, -size * 0.2, size * 0.25, -size * 0.8, 0, -size);
        ctx.bezierCurveTo(-size * 0.25, -size * 0.8, -size * 0.3, -size * 0.2, 0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Stamens
      for (let s = 0; s < 6; s++) {
        const a = (s / 6) * Math.PI * 2;
        ctx.strokeStyle = `oklch(0.7 0.15 60)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const len = size * 0.22;
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
        ctx.fillStyle = `oklch(0.55 0.18 30)`;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * len, Math.sin(a) * len, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;

      const rand = mulberry32(42);
      const placements: Array<{ x: number; y: number; s: number; r: number; hue: number }> = [];
      const sides: Array<"left" | "right"> = isMobile ? ["left"] : ["left", "right"];

      sides.forEach((side) => {
        for (let i = 0; i < (isMobile ? 4 : 7); i++) {
          const baseX = side === "left" ? rand() * (w * 0.25) + 20 : w - rand() * (w * 0.25) - 20;
          const baseY = (i / (isMobile ? 4 : 7)) * h + rand() * 60;
          const s = 30 + rand() * 40;
          placements.push({
            x: baseX,
            y: baseY,
            s,
            r: rand() * Math.PI * 2,
            hue: 15 + rand() * 25,
          });
        }
      });

      placements.forEach((p) => drawLily(p.x, p.y, p.s, p.r, p.hue));
    };

    resize();
    render();

    window.addEventListener("resize", resize);
    window.addEventListener("resize", render);

    return {
      destroy() {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", render);
      }
    };
  }
</script>

<svelte:head>
  <title>For Amera ♡</title>
  <meta name="description" content="A little something made with love." />
</svelte:head>

<div class="min-h-screen w-full overflow-hidden relative">
  <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[oklch(0.97_0.025_85)] via-[oklch(0.95_0.03_75)] to-[oklch(0.93_0.04_25)]" />

  {#if stage === "home"}
    <div class="relative min-h-screen flex items-center justify-center p-6">
      <canvas use:lilyCanvas class="fixed inset-0 pointer-events-none"></canvas>
      <div class="relative z-10 bg-[oklch(0.98_0.015_85)] rounded-3xl px-10 py-12 max-w-xl w-full text-center shadow-[0_30px_80px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.03_60)]">
        <p class="font-serif italic text-sm tracking-widest uppercase text-[oklch(0.6_0.1_25)] mb-4">
          for my dearest
        </p>
        <h1 class="font-serif text-4xl md:text-5xl text-[oklch(0.35_0.06_25)] leading-tight mb-6">
          Good luck on your exams
        </h1>
        <p class="text-[oklch(0.45_0.04_30)] leading-relaxed">
          Every page you turn, every answer you write — I'm cheering for you.
          You've worked so hard and I'm endlessly proud of you. Breathe, trust
          yourself, and bloom like the lilies you love so much.
        </p>
        <p class="mt-8 font-serif text-lg text-[oklch(0.5_0.12_20)]">
          — Farish ♡
        </p>
      </div>
    </div>
  {/if}

  {#if stage === "name"}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.35)] backdrop-blur-sm p-6">
      <div class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.02_60)]">
        <h2 class="font-serif text-3xl text-[oklch(0.35_0.05_25)] mb-2">Who are you?</h2>
        <p class="text-sm text-[oklch(0.5_0.04_30)] mb-6">whisper your name, lovely</p>
        <form onsubmit={submitName} class="flex flex-col gap-3">
          <input
            autofocus
            bind:value={name}
            class="px-4 py-3 rounded-xl bg-[oklch(0.98_0.015_85)] border border-[oklch(0.85_0.03_30)] outline-none focus:border-[oklch(0.65_0.12_20)] text-center text-lg"
            placeholder="your name"
          />
          {#if error}
            <p class="text-sm text-[oklch(0.55_0.18_25)]">{error}</p>
          {/if}
          <button
            type="submit"
            class="mt-2 px-6 py-3 rounded-xl bg-[oklch(0.65_0.12_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.14_20)] transition cursor-pointer"
          >
            Enter ♡
          </button>
        </form>
      </div>
    </div>
  {/if}

  {#if stage === "question"}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.35)] backdrop-blur-sm p-6">
      <div class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.02_60)]">
        <h2 class="font-serif text-2xl text-[oklch(0.35_0.05_25)] mb-6 text-center">
          Is it true you are Farish's girlfriend?
        </h2>
        <div class="flex gap-4 justify-center relative">
          <button
            onclick={confirm}
            class="px-6 py-3 rounded-xl bg-[oklch(0.65_0.12_20)] text-[oklch(0.98_0.01_85)] font-medium hover:bg-[oklch(0.6_0.14_20)] transition cursor-pointer"
          >
            Definitely!
          </button>
          <button
            onmouseenter={dodge}
            ontouchstart={dodge}
            onfocus={dodge}
            onclick={dodge}
            style={noPos ? `position: fixed; left: ${noPos.x}px; top: ${noPos.y}px; transition: left 0.25s ease, top 0.25s ease; z-index: 60;` : undefined}
            class="px-6 py-3 rounded-xl bg-[oklch(0.92_0.02_85)] text-[oklch(0.4_0.05_30)] font-medium border border-[oklch(0.85_0.03_30)] cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if stage === "photo"}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.35)] backdrop-blur-sm p-6">
      <div class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.02_60)]">
        <img
          src={us}
          alt="lilies for you"
          width="1024"
          height="1024"
          class="w-72 h-72 object-cover rounded-2xl mx-auto"
        />
        <p class="mt-5 font-serif text-2xl text-center text-[oklch(0.4_0.08_20)]">
          We are so cute together!
        </p>
      </div>
    </div>
  {/if}
</div>