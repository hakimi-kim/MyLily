<script lang="ts">
  import "./layout.css";
  import type { Snippet } from "svelte";
  import { Toaster } from '$lib/components/ui/sonner';
  import { afterNavigate, invalidate } from '$app/navigation';
  
  let { children }: { children: Snippet } = $props();

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



<div class="bg-neutral-100">
  {@render children()}
</div>

<Toaster richColors position="top-right" />