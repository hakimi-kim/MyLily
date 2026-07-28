<script lang="ts">
  import { enhance, applyAction } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { untrack } from 'svelte';
  import type { ActionData, PageData } from './$types';
  import type { CommentDto, FeedDto, UserSummaryDto } from '$lib/types';
  import { 
    LogOut, ArrowLeft, Camera, User, Key, Settings, 
    MoreVertical, Trash2, Send, MessageCircle, AlertTriangle, X 
  } from 'lucide-svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let preview = $state<string | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  let uploading = $state(false);

  let editProfileOpen = $state(false);
  let newDisplayName = $state('');
  let updatingName = $state(false);
  let updatingPassword = $state(false);

  let showDeleteAccountModal = $state(false);
  let typedUsername = $state('');
  let typedConfirmText = $state('');
  let deletingAccount = $state(false);

  let posts = $state<FeedDto[]>(untrack(() => data.feeds ?? data.posts ?? []));
  let nextCursor = $state(untrack(() => data.nextCursor));
  let hasMore = $state(untrack(() => data.hasMore ?? false));
  let friends = $state<UserSummaryDto[]>(untrack(() => data.friends ?? []));

  let loading = $state(false);
  let sentinel = $state<HTMLElement | null>(null);

  let selectedPost = $state<FeedDto | null>(null);
  let postMenuOpen = $state(false);
  let showDeletePostConfirm = $state(false);
  let postToDelete = $state<FeedDto | null>(null);
  let deletingPost = $state(false);

  let activeComments = $state<CommentDto[]>([]);
  let isFetchingComments = $state(false);
  let commentText = $state('');
  let commentToDelete = $state<number | null>(null);

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
    if (updatingName || updatingPassword) return;
    editProfileOpen = false;
  }

  function openDeleteAccountModal() {
    typedUsername = '';
    typedConfirmText = '';
    showDeleteAccountModal = true;
  }

  function closeDeleteAccountModal() {
    if (deletingAccount) return;
    showDeleteAccountModal = false;
  }

  let isDeleteAccountValid = $derived(
    typedUsername.trim() === data.me?.username && typedConfirmText.trim() === 'DELETE'
  );

  function promptDeleteGridPost(e: Event, post: FeedDto) {
    e.stopPropagation();
    postToDelete = post;
  }

  async function refreshComments(postId: number | undefined) {
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        activeComments = (await res.json()) as CommentDto[];
      }
    } catch (e) {
      console.error('Failed to reload comments', e);
    }
  }

  async function openPostModal(post: FeedDto) {
    selectedPost = post;
    postMenuOpen = false;
    showDeletePostConfirm = false;
    document.body.style.overflow = 'hidden';

    isFetchingComments = true;
    try {
      await refreshComments(post.id);
    } finally {
      isFetchingComments = false;
    }
  }

  function closePostModal() {
    selectedPost = null;
    activeComments = [];
    commentToDelete = null;
    postMenuOpen = false;
    showDeletePostConfirm = false;
    document.body.style.overflow = '';
  }

  function confirmDelete(commentId: number) {
    commentToDelete = commentId;
  }

  function cancelDelete() {
    commentToDelete = null;
  }

  $effect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPost) closePostModal();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });

  async function loadMore() {
    if (loading || !hasMore || !nextCursor) return;
    loading = true;

    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) throw new Error('Failed to load more');
      const json = await res.json();

      posts = [...posts, ...json.feeds];
      nextCursor = json.nextCursor;
      hasMore = json.hasMore;
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  function formatTime(dateString: string | undefined): string {
    if (!dateString) return 'Recently';
    const diffInSeconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
</script>

<div class="min-h-screen bg-neutral-100 mx-auto px-5 py-8 max-w-2xl">
  {#if !data.success}
    <div class="flex flex-col items-center justify-center min-h-87.5 p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-xs">
      <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
        <AlertTriangle class="size-6" />
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
              {:else if data.me?.profilePictureUrl}
                <img src={data.me.profilePictureUrl} alt="" class="w-full h-full object-cover" />
              {:else}
                {(data.me?.displayName ?? data.me?.username ?? 'U').charAt(0).toUpperCase()}
              {/if}

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
            <span class="text-base sm:text-lg font-bold text-brand-mauve">{posts.length}</span>
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

    <div>
      {#if posts.length > 0}
        <div class="grid grid-cols-3 gap-1 sm:gap-2">
          {#each posts as post (post.id)}
            <div class="aspect-square overflow-hidden bg-neutral-200 rounded-sm relative group cursor-pointer">
              <button
                type="button"
                onclick={() => openPostModal(post)}
                class="w-full h-full border-none p-0 bg-transparent cursor-pointer"
              >
                {#if post.mediaType === 1}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={post.mediaUrl} class="w-full h-full object-cover"></video>
                {:else}
                  <img src={post.mediaUrl} alt={post.caption ?? ''} class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                {/if}
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-semibold">
                  <MessageCircle class="size-4 fill-white" />
                  <span>{post.commentCount ?? post.comments?.length ?? 0}</span>
                </div>
              </button>

              <button
                type="button"
                onclick={(e) => promptDeleteGridPost(e, post)}
                class="hidden sm:flex absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all cursor-pointer z-10"
                title="Delete Post"
              >
                <MoreVertical class="size-3.5" />
              </button>
            </div>
          {/each}
        </div>

        <div bind:this={sentinel} class="h-10 my-4 flex items-center justify-center">
          {#if loading}
            <span class="text-xs text-muted-foreground">Loading more posts…</span>
          {/if}
        </div>
      {:else}
        <div class="flex justify-center items-center min-h-50 text-muted-foreground italic border-t border-neutral-200 mt-5">
          <p>No posts created yet.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if editProfileOpen}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    onclick={closeEditProfile}
    onkeydown={(e) => e.key === 'Escape' && closeEditProfile()}
    role="presentation"
  >
    <div
      class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
    >
      <div class="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 class="text-base font-semibold text-[#4a3050]">Edit Profile Settings</h3>
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

      <form
        method="POST"
        action="?/updateDisplayName"
        use:enhance={() => {
          updatingName = true;
          return async ({ result, update }) => {
            updatingName = false;
            if (result.type === 'success') {
              editProfileOpen = false;
            }
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
            disabled={updatingName || !newDisplayName.trim()}
            class="px-3.5 py-2 rounded-xl bg-[#65a0a0] text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            {updatingName ? 'Updating…' : 'Update Name'}
          </button>
        </div>
      </form>

      <hr class="border-neutral-100" />

      <form
        method="POST"
        action="?/updatePassword"
        use:enhance={() => {
          updatingPassword = true;
          return async ({ result, update }) => {
            updatingPassword = false;
            if (result.type === 'success') {
              editProfileOpen = false;
            }
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
            type="submit"
            disabled={updatingPassword}
            class="py-2 px-4 rounded-xl bg-[#65a0a0] text-white text-xs font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {updatingPassword ? 'Saving…' : 'Save Password'}
          </button>
        </div>
      </form>

      <hr class="border-neutral-100" />

      <div class="flex flex-col gap-2 pt-1">
        <span class="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
          <AlertTriangle class="size-3.5 text-rose-500" />
          <span>Danger Zone</span>
        </span>
        <p class="text-[0.75rem] text-muted-foreground leading-snug">
          Permanently delete your account, posts, and all associated garden data.
        </p>
        <button
          type="button"
          onclick={openDeleteAccountModal}
          class="mt-1 w-full py-2 px-4 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
{/if}

{#if postToDelete}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
    onclick={() => !deletingPost && (postToDelete = null)}
    onkeydown={(e) => e.key === 'Escape' && !deletingPost && (postToDelete = null)}
    role="presentation"
  >
    <div
      class="bg-white max-w-xs w-full rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-center"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
    >
      <div class="size-10 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center">
        <Trash2 class="size-5" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-neutral-800">Delete Post?</h4>
        <p class="text-xs text-muted-foreground mt-1">
          Are you sure you want to delete this post? This cannot be undone.
        </p>
      </div>

      <div class="flex gap-2 mt-1">
        <button
          type="button"
          onclick={() => (postToDelete = null)}
          disabled={deletingPost}
          class="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <form
          method="POST"
          action="?/deletePost"
          use:enhance={() => {
            deletingPost = true;
            return async ({ update }) => {
              deletingPost = false;
              postToDelete = null;
              await update();
            };
          }}
          class="flex-1"
        >
          <input type="hidden" name="postId" value={postToDelete.id} />
          <button
            type="submit"
            disabled={deletingPost}
            class="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-60"
          >
            {deletingPost ? 'Deleting…' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if selectedPost}
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-0 sm:p-4"
    onclick={closePostModal}
    onkeydown={(e) => e.key === 'Escape' && closePostModal()}
    role="presentation"
  >
    <div
      class="bg-white w-full h-full sm:h-[85vh] sm:max-h-225 sm:max-w-4xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row relative"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
    >
      <button
        type="button"
        onclick={closePostModal}
        class="absolute top-3 right-3 z-20 text-white sm:text-neutral-500 hover:text-neutral-800 bg-black/40 sm:bg-neutral-100 p-1.5 rounded-full transition-colors cursor-pointer"
      >
        <X class="size-5" />
      </button>

      <div class="w-full sm:w-3/5 bg-black flex items-center justify-center h-[40vh] sm:h-full shrink-0">
        {#if selectedPost.mediaType === 1}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video src={selectedPost.mediaUrl} controls class="w-full h-full object-contain max-h-full"></video>
        {:else}
          <img src={selectedPost.mediaUrl} alt={selectedPost.caption ?? ''} class="w-full h-full object-contain max-h-full" />
        {/if}
      </div>

      <div class="w-full sm:w-2/5 flex flex-col bg-white h-[60vh] sm:h-full">
        <div class="flex items-center justify-between p-3.5 border-b border-neutral-100 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-brand-pink flex items-center justify-center text-xs font-bold overflow-hidden text-brand-pink-foreground border border-neutral-200">
              {#if data.me?.profilePictureUrl}
                <img src={data.me.profilePictureUrl} alt="" class="w-full h-full object-cover" />
              {:else}
                {(data.me?.displayName ?? data.me?.username ?? 'U').charAt(0).toUpperCase()}
              {/if}
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-neutral-800 leading-tight">{data.me?.displayName ?? data.me?.username}</span>
              <span class="text-[0.65rem] text-muted-foreground">@{data.me?.username}</span>
            </div>
          </div>

          <div class="relative">
            <button
              type="button"
              onclick={() => (postMenuOpen = !postMenuOpen)}
              class="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <MoreVertical class="size-4" />
            </button>

            {#if postMenuOpen}
              <div class="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-30">
                <button
                  type="button"
                  onclick={() => {
                    postMenuOpen = false;
                    showDeletePostConfirm = true;
                  }}
                  class="w-full text-left px-3 py-2 text-xs text-rose-600 font-medium hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 class="size-3.5" />
                  <span>Delete Post</span>
                </button>
              </div>
            {/if}
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3.5 flex flex-col gap-4">
          {#if selectedPost.caption}
            <div class="flex gap-3 items-start border-b border-neutral-100 pb-3">
              <div class="w-8 h-8 rounded-full bg-linear-to-br from-brand-pink to-brand-amber p-[1.5px] shrink-0">
                <div class="w-full h-full rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {#if data.me?.profilePictureUrl}
                    <img src={data.me.profilePictureUrl} alt="" class="w-full h-full object-cover" />
                  {:else}
                    {(data.me?.displayName ?? data.me?.username ?? 'U').charAt(0).toUpperCase()}
                  {/if}
                </div>
              </div>
              <div class="flex-1 text-xs leading-snug flex flex-col">
                <span class="font-bold text-[#4a3050]">
                  {data.me?.displayName ?? data.me?.username}
                </span>
                <p class="text-neutral-700 mt-0.5 whitespace-pre-line">{selectedPost.caption}</p>
              </div>
            </div>
          {/if}

          {#if isFetchingComments}
            <div class="text-center text-muted-foreground text-xs py-8">Loading comments…</div>
          {:else if activeComments.length > 0}
            {#each activeComments as comment (comment.id)}
              <div class="flex gap-3 items-start">
                <div class="w-8 h-8 rounded-full bg-linear-to-br from-brand-pink to-brand-amber p-[1.5px] shrink-0">
                  <div class="w-full h-full rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {#if comment.author?.profilePictureUrl}
                      <img src={comment.author.profilePictureUrl} alt="" class="w-full h-full object-cover" />
                    {:else}
                      {(comment.author?.displayName ?? comment.author?.username ?? 'U').charAt(0).toUpperCase()}
                    {/if}
                  </div>
                </div>

                <div class="flex-1 text-xs leading-snug flex flex-col">
                  <div>
                    <span class="font-semibold text-[#4a3050]">
                      {comment.author?.displayName ?? comment.author?.username ?? 'User'}
                    </span>
                    <p class="text-[#4a3050] mt-0.5 whitespace-pre-line">{comment.content}</p>
                  </div>

                  <div class="flex items-center gap-2 text-[0.65rem] text-muted-foreground mt-1">
                    <span>{formatTime(comment.createdAt)}</span>

                    {#if data.me && (comment.author?.id === data.me.id || selectedPost?.author?.id === data.me.id)}
                      <span class="text-neutral-300">•</span>
                      <button
                        type="button"
                        onclick={() => confirmDelete(comment.id)}
                        class="text-[0.65rem] font-medium text-rose-500 hover:text-rose-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        Delete
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <div class="text-center text-muted-foreground text-xs py-8">
              <p>No comments yet. Start the conversation!</p>
            </div>
          {/if}
        </div>

        <form
          method="POST"
          action="?/addComment"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === 'success') {
                await refreshComments(selectedPost?.id);
                commentText = '';
              }
              await update({ reset: false });
            };
          }}
          class="p-3 border-t border-neutral-100 flex items-center gap-2 shrink-0 bg-neutral-50 sticky bottom-0"
        >
          <input type="hidden" name="postId" value={selectedPost.id} />
          <input
            type="text"
            name="content"
            bind:value={commentText}
            placeholder="Add a comment…"
            class="flex-1 text-xs sm:text-sm px-3.5 py-2.5 sm:py-2 rounded-xl bg-white border border-neutral-200 outline-none focus:border-pink-300"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            class="p-2.5 text-[#65a0a0] hover:text-[#4d7e7e] disabled:opacity-40 cursor-pointer"
          >
            <Send class="size-4 sm:size-5" />
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if commentToDelete}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
    onclick={cancelDelete}
    onkeydown={(e) => e.key === 'Escape' && cancelDelete()}
    role="presentation"
  >
    <div
      class="bg-white max-w-xs w-full rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-center"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
    >
      <div class="size-10 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center">
        <Trash2 class="size-5" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-neutral-800">Delete Comment?</h4>
        <p class="text-xs text-muted-foreground mt-1">
          Are you sure you want to delete this comment?
        </p>
      </div>

      <div class="flex gap-2 mt-1">
        <button
          type="button"
          onclick={cancelDelete}
          class="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <form
          method="POST"
          action="?/deleteComment"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === 'success') {
                await refreshComments(selectedPost?.id);
                cancelDelete();
              }
              await update({ reset: false });
            };
          }}
          class="flex-1"
        >
          <input type="hidden" name="commentId" value={commentToDelete} />
          <button
            type="submit"
            class="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if showDeletePostConfirm}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
    onclick={() => !deletingPost && (showDeletePostConfirm = false)}
    onkeydown={(e) => e.key === 'Escape' && !deletingPost && (showDeletePostConfirm = false)}
    role="presentation"
  >
    <div
      class="bg-white max-w-xs w-full rounded-2xl p-5 shadow-xl flex flex-col gap-4 text-center"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
    >
      <div class="size-10 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center">
        <Trash2 class="size-5" />
      </div>
      <div>
        <h4 class="text-sm font-bold text-neutral-800">Delete Post?</h4>
        <p class="text-xs text-muted-foreground mt-1">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
      </div>

      <div class="flex gap-2 mt-1">
        <button
          type="button"
          onclick={() => (showDeletePostConfirm = false)}
          disabled={deletingPost}
          class="flex-1 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <form
          method="POST"
          action="?/deletePost"
          use:enhance={() => {
            deletingPost = true;
            return async ({ update }) => {
              deletingPost = false;
              showDeletePostConfirm = false;
              closePostModal();
              await update();
            };
          }}
          class="flex-1"
        >
          <input type="hidden" name="postId" value={selectedPost?.id} />
          <button
            type="submit"
            disabled={deletingPost}
            class="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-60"
          >
            {deletingPost ? 'Deleting…' : 'Delete'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if showDeleteAccountModal}
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-xs z-60 flex items-center justify-center p-4"
    onclick={closeDeleteAccountModal}
    onkeydown={(e) => e.key === 'Escape' && closeDeleteAccountModal()}
    role="presentation"
  >
    <div
      class="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
    >
      <div class="flex items-center gap-3">
        <div class="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle class="size-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-rose-600">Delete Account Permanently</h3>
          <p class="text-[0.7rem] text-muted-foreground">This action is completely irreversible.</p>
        </div>
      </div>

      <p class="text-xs text-neutral-600 leading-relaxed">
        Please confirm by typing your username <strong class="text-neutral-900">@{data.me?.username}</strong> and the word <strong class="text-rose-600">DELETE</strong> below.
      </p>

      <form
        method="POST"
        action="?/deleteAccount"
        use:enhance={() => {
          deletingAccount = true;
          return async ({ update }) => {
            deletingAccount = false;
            await update();
          };
        }}
        class="flex flex-col gap-3"
      >
        <div class="flex flex-col gap-1">
          <label for="typeUsername" class="text-[0.7rem] font-semibold text-neutral-500">Your Username</label>
          <input
            id="typeUsername"
            type="text"
            bind:value={typedUsername}
            placeholder={data.me?.username}
            class="text-xs px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-rose-400"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="typeDelete" class="text-[0.7rem] font-semibold text-neutral-500">Type "DELETE"</label>
          <input
            id="typeDelete"
            type="text"
            bind:value={typedConfirmText}
            placeholder="DELETE"
            class="text-xs px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 outline-none focus:border-rose-400"
          />
        </div>

        <div class="flex gap-2 justify-end mt-2">
          <button
            type="button"
            onclick={closeDeleteAccountModal}
            disabled={deletingAccount}
            class="py-2 px-4 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isDeleteAccountValid || deletingAccount}
            class="py-2 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deletingAccount ? 'Deleting…' : 'Permanently Delete'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}