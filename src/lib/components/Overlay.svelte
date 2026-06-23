<script lang="typescript">
  import type { Snippet } from "svelte";
  let { children }: { children: Snippet } = $props();
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.3_0.04_30/0.35)] backdrop-blur-sm p-6">
  {@render children()}
</div>