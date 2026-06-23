<script lang="ts">
  import "./layout.css";
  import type { Snippet } from "svelte";
  
  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lovable App</title>
  <meta name="description" content="Lovable Generated Project" />
  <meta name="author" content="Lovable" />
  <meta property="og:title" content="Lovable App" />
  <meta property="og:description" content="Lovable Generated Project" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@Lovable" />
</svelte:head>

{@render children()}