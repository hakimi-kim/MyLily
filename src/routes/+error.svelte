<script lang="ts">
  import { page } from "$app/state";
  import { reportLovableError } from "$lib/lovable-error-reporting";
  import { onMount } from "svelte";

  onMount(() => {
    if (page.error) {
      reportLovableError(page.error, { boundary: "sveltekit_root_error_boundary" });
    }
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
  <div class="max-w-md text-center">
    <h1 class="text-7xl font-bold text-foreground">{page.status}</h1>
    <h2 class="mt-4 text-xl font-semibold text-foreground">
      {page.status === 404 ? "Page not found" : "This page didn't load"}
    </h2>
    <p class="mt-2 text-sm text-muted-foreground">
      {page.status === 404 
        ? "The page you're looking for doesn't exist or has been moved." 
        : "Something went wrong on our end. You can try refreshing or head back home."}
    </p>
    <div class="mt-6 flex flex-wrap justify-center gap-2">
      <button
        onclick={() => window.location.reload()}
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
      >
        Try again
      </button>
      <a
        href="/"
        class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Go home
      </a>
    </div>
  </div>
</div>