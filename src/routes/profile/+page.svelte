<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let preview = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let uploading = $state(false);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			preview = null;
			return;
		}
		preview = URL.createObjectURL(file);
	}

	function cancelPreview() {
		preview = null;
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="max-w-160 mx-auto px-5 py-8">
  {#if !data.success}
    <div class="flex flex-col items-center justify-center min-h-87.5 p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-xs">
      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
      </div>
      
      <h3 class="text-base font-semibold text-brand-mauve mb-1">Failed to load profile</h3>
      <p class="text-xs text-muted-foreground max-w-xs mb-6">
        {data.error ?? "We couldn't retrieve your profile data right now."}
      </p>

      <button 
        type="button" 
        onclick={() => location.reload()} 
        class="text-xs px-4 py-2 rounded-lg bg-brand-mauve text-white font-medium hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  {:else if data.me}
    <div class="flex justify-between mb-5">
      <button class="bg-none border-none text-muted-foreground cursor-pointer text-sm p-2 hover:underline" onclick={() => history.back()}>← Back</button>

      <form method="POST" action="?/logout">
        <button type="submit" class="bg-none border-none text-destructive cursor-pointer text-sm p-2 hover:underline">Logout</button>
      </form>
    </div>

    <div class="flex items-center gap-5 mb-8">
      <form
        method="POST"
        action="?/updateAvatar"
        enctype="multipart/form-data"
        class="shrink-0"
        use:enhance={() => {
          uploading = true;
          return async ({ update }) => {
            await update();
            uploading = false;
            preview = null;
          };
        }}
      >
        <button
          type="button"
          onclick={() => fileInput?.click()}
          class="relative w-21 h-21 rounded-full p-0.75 bg-linear-to-br from-brand-pink to-brand-amber cursor-pointer border-none"
        >
          <div class="w-full h-full rounded-full bg-brand-pink flex items-center justify-center text-brand-pink-foreground font-bold text-3xl border-[3px] border-white overflow-hidden">
            {#if preview}
              <img src={preview} alt="Preview" class="w-full h-full object-cover" />
            {:else if data.me.profilePictureUrl}
              <img src={data.me.profilePictureUrl} alt="" class="w-full h-full object-cover" />
            {:else}
              {(data.me.displayName ?? data.me.username).charAt(0).toUpperCase()}
            {/if}
          </div>

          <span class="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 text-white text-[0.65rem] font-semibold uppercase tracking-wide">
            Edit
          </span>
        </button>

        <input
          bind:this={fileInput}
          type="file"
          name="file"
          accept="image/*"
          onchange={handleFileChange}
          class="hidden"
        />

        {#if preview}
          <div class="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={uploading}
              class="text-xs px-3 py-1.5 rounded-lg bg-[#65a0a0] text-white font-semibold disabled:opacity-60"
            >
              {uploading ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onclick={cancelPreview}
              disabled={uploading}
              class="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 text-muted-foreground font-semibold"
            >
              Cancel
            </button>
          </div>
        {/if}
      </form>

      <div class="flex flex-col flex-1">
        <span class="text-xl font-bold text-brand-mauve">{data.me.displayName ?? data.me.username}</span>
        <span class="text-sm text-muted-foreground">@{data.me.username}</span>
      </div>

      <div class="flex gap-5">
        <div class="flex flex-col items-center">
          <span class="text-lg font-bold text-brand-mauve">{data.posts.length}</span>
          <span class="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Posts</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-lg font-bold text-brand-mauve">{data.mutualCount}</span>
          <span class="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Mutuals</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-lg font-bold text-brand-mauve">{data.bloomedCount}</span>
          <span class="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Bloomed</span>
        </div>
      </div>
    </div>

    <div>
      {#if data.posts.length > 0}
        <div class="grid grid-cols-3 gap-1">
          {#each data.posts as post (post.id)}
            <div class="aspect-square overflow-hidden bg-neutral-100">
              {#if post.mediaType === 1}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video src={post.mediaUrl} class="w-full h-full object-cover"></video>
              {:else}
                <img src={post.mediaUrl} alt={post.caption ?? ''} class="w-full h-full object-cover" />
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex justify-center items-center min-h-50 text-muted-foreground italic border-t border-border mt-5">
          <p>No posts created yet.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>