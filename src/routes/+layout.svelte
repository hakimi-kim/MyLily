<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import "./layout.css";
  import type { Snippet } from "svelte";
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { Toaster } from '$lib/components/ui/sonner';
  import { afterNavigate, invalidate } from '$app/navigation';

  let { children }: { children: Snippet } = $props();

  let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  let isFirstVisit = $state(
    typeof window !== 'undefined' ? !sessionStorage.getItem('seen_loading') : true
  );

  let showLoading = $state(true);
  let minTimePassed = $state(false);
  let dataReady = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;

    if (isFirstVisit) {
      // 1. Set minimum timer for the 4.8s bloom animation
      const timer = setTimeout(() => {
        minTimePassed = true;
      }, 4800);

      // 2. Track when page resources/data actually finish loading
      if (document.readyState === 'complete') {
        dataReady = true;
      } else {
        const handleLoad = () => { dataReady = true; };
        window.addEventListener('load', handleLoad);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('load', handleLoad);
        };
      }

      return () => clearTimeout(timer);
    } else {
      // Subsequent reloads: Dismiss as soon as page data is ready
      if (document.readyState === 'complete') {
        showLoading = false;
      } else {
        const handleLoad = () => { showLoading = false; };
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  });

  // For first visit: Close ONLY when BOTH 4.8s timer AND data fetch are complete!
  $effect(() => {
    if (isFirstVisit && minTimePassed && dataReady) {
      showLoading = false;
      sessionStorage.setItem('seen_loading', 'true');
    }
  });
</script>

<svelte:head>
  {@html webManifestLink}
  <link rel="apple-touch-icon" href="/icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="MyLily" />
</svelte:head>

{#if showLoading}
  <LoadingScreen />
{/if}

<div class="bg-neutral-100">
  {@render children()}
</div>

<Toaster richColors position="top-right" />