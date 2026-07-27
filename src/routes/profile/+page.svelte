<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { enhance } from '$app/forms';
  import { LogOut, ArrowLeft, Camera, User, Key, Settings } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let preview = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);

  let editProfileOpen = $state(false);
  let newDisplayName = $state('');
  let updatingProfile = $state(false);

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

  function openEditProfile() {
    newDisplayName = data.me?.displayName ?? data.me?.username ?? '';
    editProfileOpen = true;
  }

  function closeEditProfile() {
    if (updatingProfile) return;
    editProfileOpen = false;
  }
</script>

<div class="min-h-screen bg-neutral-100 mx-auto px-5 py-8 max-w-2xl">
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
    <!-- Aligned Header Controls -->
    <div class="flex items-center justify-between mb-6">
      <button 
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 transition-colors cursor-pointer"
        onclick={() => history.back()}
      >
        <ArrowLeft class="size-4" />
        <span>Back</span>
      </button>

      <form method="POST" action="?/logout" class="flex items-center">
        <button 
          type="submit" 
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <LogOut class="size-4" />
          <span>Logout</span>
        </button>
      </form>
    </div>

    <!-- Profile Header -->
    <div class="flex flex-col gap-6 mb-8">
      <div class="flex items-center justify-between gap-4">
        <form
          method="POST"
          action="?/updateAvatar"
          enctype="multipart/form-data"
          class="shrink-0 flex flex-col items-center gap-1.5"
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
            class="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.75 bg-linear-to-br from-brand-pink to-brand-amber cursor-pointer border-none focus:outline-none"
            aria-label="Change profile picture"
          >
            <div class="w-full h-full rounded-full bg-brand-pink flex items-center justify-center text-brand-pink-foreground font-bold text-2xl sm:text-3xl border-[3px] border-white overflow-hidden relative">
              {#if preview}
                <img src={preview} alt="Preview" class="w-full h-full object-cover" />
              {:else if data.me.profilePictureUrl}
                <img src={data.me.profilePictureUrl} alt="" class="w-full h-full object-cover" />
              {:else}
                {(data.me.displayName ?? data.me.username).charAt(0).toUpperCase()}
              {/if}

              <!-- Subtle Overlay Icon -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera class="size-5 sm:size-6" />
              </div>
            </div>
          </button>

          <span class="text-[0.65rem] text-muted-foreground font-medium tracking-tight">Click photo to edit</span>

          <input
            bind:this={fileInput}
            type="file"
            name="file"
            accept="image/*"
            onchange={handleFileChange}
            class="hidden"
          />

          {#if preview}
            <div class="flex gap-2 mt-1">
              <button
                type="submit"
                disabled={uploading}
                class="text-xs px-3 py-1 rounded-md bg-[#65a0a0] text-white font-semibold disabled:opacity-60 cursor-pointer"
              >
                {uploading ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onclick={cancelPreview}
                disabled={uploading}
                class="text-xs px-3 py-1 rounded-md bg-neutral-200 text-neutral-700 font-semibold cursor-pointer"
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

      <div class="flex flex-col items-start gap-2">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-brand-mauve leading-tight">
            {data.me.displayName ?? data.me.username}
          </h2>
          <span class="text-xs sm:text-sm text-muted-foreground">@{data.me.username}</span>
        </div>

        <button
          type="button"
          onclick={openEditProfile}
          class="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-neutral-200/80 text-[#544354] font-semibold hover:bg-pink-100/70 hover:text-[#4a3050] transition-colors cursor-pointer mt-1"
        >
          <Settings class="size-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Posts Grid -->
    <div>
      {#if data.posts.length > 0}
        <div class="grid grid-cols-3 gap-1">
          {#each data.posts as post (post.id)}
            <div class="aspect-square overflow-hidden bg-neutral-100 rounded-sm">
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
        <div class="flex justify-center items-center min-h-50 text-muted-foreground italic border-t border-neutral-200 mt-5">
          <p>No posts created yet.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Consolidated Edit Profile Modal -->
{#if editProfileOpen}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs z-1100 flex items-center justify-center p-4"
    onclick={closeEditProfile}
    onkeydown={(e) => e.key === 'Escape' && closeEditProfile()}
    role="presentation"
  >
    <div
      class="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 id="edit-profile-title" class="text-base font-semibold text-[#4a3050]">Edit Profile Settings</h3>
        <button 
          type="button" 
          onclick={closeEditProfile}
          class="text-neutral-400 hover:text-neutral-600 text-lg leading-none cursor-pointer"
        >
          &times;
        </button>
      </div>

      {#if form?.passwordError}
        <p class="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100">
          {form.passwordError}
        </p>
      {/if}

      <!-- Display Name Form -->
      <form
        method="POST"
        action="?/updateDisplayName"
        use:enhance={() => {
          updatingProfile = true;
          return async ({ update }) => {
            updatingProfile = false;
            await update();
          };
        }}
        class="flex flex-col gap-2"
      >
        <label for="displayName" class="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
          <User class="size-3.5 text-neutral-400" />
          <span>Display Name</span>
        </label>
        <div class="flex gap-2">
          <input
            id="displayName"
            type="text"
            name="displayName"
            bind:value={newDisplayName}
            maxlength="50"
            required
            placeholder="New display name"
            class="flex-1 text-sm px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300"
          />
          <button
            type="submit"
            disabled={updatingProfile || !newDisplayName.trim()}
            class="px-3.5 py-2 rounded-xl bg-[#65a0a0] text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            Update Name
          </button>
        </div>
      </form>

      <hr class="border-neutral-100" />

      <!-- Password Change Form -->
      <form
        method="POST"
        action="?/updatePassword"
        use:enhance={() => {
          updatingProfile = true;
          return async ({ result, update }) => {
            updatingProfile = false;
            if (result.type === 'success') editProfileOpen = false;
            await update({ reset: false });
          };
        }}
        class="flex flex-col gap-3"
      >
        <label for="currentPassword" class="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
          <Key class="size-3.5 text-neutral-400" />
          <span>Change Password</span>
        </label>

        <input
          id="currentPassword"
          type="password"
          name="currentPassword"
          required
          placeholder="Current password"
          class="text-sm px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300"
        />
        <input
          type="password"
          name="newPassword"
          required
          minlength={8}
          placeholder="New password (min 8 chars)"
          class="text-sm px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300"
        />
        <input
          type="password"
          name="confirmNewPassword"
          required
          placeholder="Confirm new password"
          class="text-sm px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-pink-300"
        />

        <div class="flex gap-2 justify-end mt-1">
          <button
            type="button"
            onclick={closeEditProfile}
            disabled={updatingProfile}
            class="py-2 px-4 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={updatingProfile}
            class="py-2 px-4 rounded-xl bg-[#65a0a0] text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {updatingProfile ? 'Updating…' : 'Save Password'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}