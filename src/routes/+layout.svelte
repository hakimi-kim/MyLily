<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import "./layout.css";
  import type { Snippet } from "svelte";
  import { Toaster } from '$lib/components/ui/sonner';
  import { afterNavigate, invalidate } from '$app/navigation';
  
  let { children }: { children: Snippet } = $props();

  let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  if (typeof window !== 'undefined') {
    window.addEventListener('submit', (e) => {
      const formElement = e.target as HTMLFormElement;

      if (formElement.dataset.submitted === 'true') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      formElement.dataset.submitted = 'true';

      setTimeout(() => {
        delete formElement.dataset.submitted;
      }, 0);
    }, true);
  }

	afterNavigate(() => {
		invalidate('app:notifications');
	});
</script>

<svelte:head>
	{@html webManifestLink}
	<link rel="apple-touch-icon" href="/icon-192.png" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="MyLily" />
</svelte:head>

<div class="bg-neutral-100">
  {@render children()}
</div>

<Toaster richColors position="top-right" />