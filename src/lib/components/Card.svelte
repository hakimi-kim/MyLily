<script lang="typescript">
  import type { Snippet } from "svelte";
  let { children }: { children: Snippet } = $props();
</script>

<div class="bg-[oklch(0.98_0.015_85)] rounded-3xl p-8 max-w-md w-full shadow-[0_30px_60px_-20px_oklch(0.4_0.1_25/0.3)] border border-[oklch(0.9_0.02_60)]">
  {@render children()}
</div>