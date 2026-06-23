<script lang="typescript">
  import { reportLovableError } from "$lib/lovable-error-reporting";

  let canvasRef = $state<HTMLCanvasElement | null>(null);

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

  $effect(() => {
    const canvas = canvasRef;
    if (!canvas) return;
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

      // Petals
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

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", render);
    };
  });
</script>

<div class="relative min-h-screen flex items-center justify-center p-6">
  <canvas bind:this={canvasRef} class="fixed inset-0 pointer-events-none"></canvas>
  <div class="relative z-10 bg-[oklch(0.98_0.015_85)] rounded-3xl px-10 py-12 max-w-xl w-full text-center shadow-[0_30px_80px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.03_60)]">
    <p class="font-serif italic text-sm tracking-widest uppercase text-[oklch(0.6_0.1_25)] mb-4">
      for my dearest
    </p>
    <h1 class="font-serif text-4xl md:text-5xl text-[oklch(0.35_0.06_25)] leading-tight mb-6">
      Good luck on your exams, my love
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