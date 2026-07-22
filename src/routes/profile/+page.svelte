<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let preview = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);
	let uploading = $state(false);

	let editNameOpen = $state(false);
	let newDisplayName = $state('');
	let updatingName = $state(false);

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

	function openEditName() {
		newDisplayName = data.me?.displayName ?? data.me?.username ?? '';
		editNameOpen = true;
	}

	function closeEditName() {
		if (updatingName) return;
		editNameOpen = false;
	}
</script>

<div class="min-h-screen bg-neutral-100 mx-auto px-5 py-8">
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

    <div class="flex flex-col gap-5 mb-8">
      <div class="flex items-center justify-between gap-4">
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
            class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.75 bg-linear-to-br from-brand-pink to-brand-amber cursor-pointer border-none"
          >
            <div class="w-full h-full rounded-full bg-brand-pink flex items-center justify-center text-brand-pink-foreground font-bold text-2xl sm:text-3xl border-[3px] border-white overflow-hidden">
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
                class="text-xs px-3 py-1.5 rounded-lg bg-[#65a0a0] text-white font-semibold disabled:opacity-60 cursor-pointer"
              >
                {uploading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onclick={cancelPreview}
                disabled={uploading}
                class="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 text-muted-foreground font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          {/if}
        </form>

        <div class="flex gap-4 sm:gap-6 items-center justify-around flex-1 max-w-xs">
          <div class="flex flex-col items-center">
            <span class="text-base sm:text-lg font-bold text-brand-mauve">{data.posts.length}</span>
            <span class="text-[0.65rem] sm:text-[0.7rem] text-muted-foreground uppercase tracking-wider">Posts</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-base sm:text-lg font-bold text-brand-mauve">{data.mutualCount}</span>
            <span class="text-[0.65rem] sm:text-[0.7rem] text-muted-foreground uppercase tracking-wider">Mutuals</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-base sm:text-lg font-bold text-brand-mauve">{data.bloomedCount}</span>
            <span class="text-[0.65rem] sm:text-[0.7rem] text-muted-foreground uppercase tracking-wider">Bloomed</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-start gap-1">
        <h2 class="text-lg sm:text-xl font-bold text-brand-mauve leading-tight">
          {data.me.displayName ?? data.me.username}
        </h2>
        <span class="text-xs sm:text-sm text-muted-foreground">@{data.me.username}</span>

        <button
          type="button"
          onclick={openEditName}
          class="w-full sm:w-fit text-center text-xs px-4 py-2 mt-2 rounded-xl bg-neutral-200/60 text-[#6b5b6b] font-semibold hover:bg-pink-50 hover:text-[#4a3050] transition-colors cursor-pointer"
        >
          Update Name
        </button>
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

{#if editNameOpen}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs z-1100 flex items-center justify-center p-4"
    onclick={closeEditName}
    onkeydown={(e) => e.key === 'Escape' && closeEditName()}
    role="presentation"
  >
    <div
      class="bg-white w-full max-w-80 rounded-2xl p-6 shadow-xl flex flex-col gap-4"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="edit-name-title"
    >
      <h4 id="edit-name-title" class="text-base font-semibold text-[#4a3050]">Update your name</h4>

      <form
        method="POST"
        action="?/updateDisplayName"
        use:enhance={() => {
          updatingName = true;
          return async ({ update }) => {
            updatingName = false;
            editNameOpen = false;
            await update();
          };
        }}
        class="flex flex-col gap-3"
      >
        <input
          type="text"
          name="displayName"
          bind:value={newDisplayName}
          maxlength="50"
          required
          placeholder="New display name"
          class="text-sm px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300"
        />

        <div class="flex gap-3">
          <button
            type="button"
            onclick={closeEditName}
            disabled={updatingName}
            class="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updatingName || !newDisplayName.trim()}
            class="flex-1 py-2 px-4 rounded-xl bg-[#65a0a0] text-white text-sm font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {updatingName ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}