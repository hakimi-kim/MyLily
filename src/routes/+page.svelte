<script lang="ts">
  import { enhance } from '$app/forms';
  import type { CommentDto, FeedDto, FriendResponse } from '$lib/types';
  import type { PageData } from './$types';
  import lilyLogo from '$lib/assets/lily.png';
  import { applyAction } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import { invalidateAll } from '$app/navigation';
	import Sidebar from '$lib/components/Sidebar.svelte';

  let { data }: { data: PageData } = $props();

  let posts = $state<FeedDto[]>(untrack(() => data.feeds ?? []));
  let nextCursor = $state(untrack(() => data.nextCursor));
  let hasMore = $state(untrack(() => data.hasMore ?? false));
  let friends = $state<FriendResponse[]>(untrack(() => data.friends ?? []));

  let activeCommentPost = $state<FeedDto | null>(null);
  let commentText = $state('');
  let activeComments = $state<CommentDto[]>([]);
  let isFetchingComments = $state(false);
  let commentsContainer = $state<HTMLDivElement | null>(null);

  let commentError = $state<string | null>(null);
  let deleteError = $state<string | null>(null);

  let loading = $state(false);
  let sentinel = $state<HTMLElement | null>(null);

  async function refreshComments(postId: number | undefined) {
    if (!postId) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        activeComments = (await res.json()) as CommentDto[];
      }
    } catch (e) {
      console.error("Failed to reload comments", e);
    }
  }

  async function openComments(post: FeedDto) {
    activeCommentPost = post;
    document.body.style.overflow = 'hidden';

    isFetchingComments = true;
    try {
      await refreshComments(post.id);
    } finally {
      isFetchingComments = false;
    }
  }

  function closeComments() {
    activeCommentPost = null;
    commentText = '';
    document.body.style.overflow = ''; 
  }

  let commentToDelete = $state<number | null>(null);

  function confirmDelete(commentId: number) {
    commentToDelete = commentId;
  }

  function cancelDelete() {
    commentToDelete = null;
  }

  $effect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCommentPost) closeComments();
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

  function likeEnhance(post: FeedDto): SubmitFunction {
    return () => {
      const wasLiked = post.likedByMe ?? false;
      const previousCount = post.likeCount ?? 0;

      post.likedByMe = !wasLiked;
      post.likeCount = previousCount + (post.likedByMe ? 1 : -1);

      return async ({ result, update }) => {
        if (result.type === 'error' || result.type === 'failure') {
          post.likedByMe = wasLiked;
          post.likeCount = previousCount;
          await applyAction(result);
        } else if (result.type === 'success') {
          await update({ reset: false });
        }
      };
    };
  }
</script>

<div class="min-h-screen bg-neutral-100">
  <div class="grid grid-cols-[240px_minmax(0,480px)_280px] justify-center gap-8 max-w-280 mx-auto items-start px-5 sm:px-6 md:px-8 max-[1040px]:grid-cols-[72px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-4">  
    <Sidebar />

    <!-- Center Feed -->
    <main class="min-w-0">
      <div class="flex flex-col gap-6 pt-8 pb-8 max-[640px]:pt-20 max-[640px]:pb-17.5">
        {#if !data.success}
          <div class="text-center p-8 text-muted-foreground"><p>{data.error ?? 'Failed to load feed.'}</p></div>
        {:else if posts.length === 0}
          <div class="flex justify-center items-center min-h-50 w-full text-muted-foreground italic">
            <p class="m-0">No posts created yet.</p>
          </div>
        {:else}
          {#each posts as post, index (post.id)}
            <article
              class="bg-white rounded-2xl overflow-hidden shadow-sm opacity-0 animate-fade-up"
              style="animation-delay: {(index % 10) * 0.1}s"
            >
              <div class="flex items-center justify-between py-4 px-5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                    {#if post.author?.profilePictureUrl}
                      <img
                        src={post.author.profilePictureUrl}
                        alt={post.author?.displayName ?? post.author?.username ?? 'User avatar'}
                        class="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    {:else}
                      <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-[1.1rem]">
                        {post.author?.displayName?.charAt(0).toUpperCase() ??
                          post.author?.username?.charAt(0).toUpperCase() ??
                          'U'}
                      </div>
                    {/if}
                  </div>
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm text-[#4a3050]">{post.author?.displayName ?? post.author?.username ?? 'Unknown'}</span>
                    <span class="text-xs text-muted-foreground">{formatTime(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div class="relative w-full aspect-square overflow-hidden bg-neutral-100">
                {#if post.mediaType === 1}
                  <!-- svelte-ignore a11y_media_has_caption -->
                  <video src={post.mediaUrl} controls class="w-full h-full object-cover"></video>
                {:else}
                  <img
                    src={post.mediaUrl ||
                      'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=600&fit=crop'}
                    alt={post.caption ?? 'Post'}
                    class="w-full h-full object-cover"
                  />
                {/if}
                <div class="absolute bottom-0 left-0 right-0 h-15 bg-linear-to-b from-transparent to-white/30 pointer-events-none"></div>
              </div>

              <div class="flex items-center py-3 px-5 pb-2 gap-1">
                <form method="POST" action={post.likedByMe ? '?/unlike' : '?/like'} use:enhance={likeEnhance(post)}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    class="border-none cursor-pointer p-2 rounded-full transition-all flex items-center justify-center hover:bg-pink-50 hover:scale-110 {post.likedByMe ? 'text-amber-400 animate-bloom' : 'text-[#6b5b6b]'}"
                  >
                    <span class="text-3xl leading-none flex items-center justify-center w-8 h-8 select-none">❀</span>
                  </button>
                </form>

                <button
                  type="button"
                  aria-label="Open comments"
                  onclick={() => openComments(post)}
                  class="border-none cursor-pointer p-2 rounded-full transition-all flex items-center justify-center text-[#6b5b6b] hover:bg-pink-50 [&_svg]:size-5.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </button>
              </div>

              <div class="py-0 px-5 pb-1.5 text-sm font-semibold text-[#4a3050] flex items-center gap-1.5">
                <span class="text-amber-400 text-sm">❀</span>
                <span>{(post.likeCount ?? 0).toLocaleString()} blooms</span>
              </div>

              {#if post.caption}
                <div class="py-0 px-5 pb-2 text-sm leading-relaxed text-[#4a3050]">
                  <span class="font-semibold mr-1.5">{post.author?.displayName ?? post.author?.username ?? 'Unknown'}</span>
                  <span>{post.caption}</span>
                </div>
              {/if}

              {#if post.commentCount && post.commentCount > 0}
                <button
                  class="border-none cursor-pointer py-0 px-5 pb-4 text-[0.78rem] text-muted-foreground hover:text-[#6b5b6b]"
                  onclick={() => openComments(post)}
                >
                  View all {post.commentCount} comments
                </button>
              {/if}
            </article>
          {/each}
        {/if}

        <div bind:this={sentinel} class="h-px" aria-hidden="true"></div>

        {#if loading}
          <div class="text-center p-8 text-muted-foreground"><p>Loading more blooms...</p></div>
        {/if}

        {#if !hasMore && posts.length > 0}
          <div class="text-center p-8 text-muted-foreground"><p>You've reached the end of the garden.</p></div>
        {/if}
      </div>
    </main>

    <!-- Right Column: Mutuals -->
    <aside class="sticky top-0 h-screen py-8 max-[1040px]:hidden">
      <div class="flex flex-col gap-4">
        <div class="text-xs font-bold tracking-widest uppercase text-violet-400 px-1">
          <span>Mutual friends</span>
        </div>
        <ul class="list-none flex flex-col gap-1">
          {#if !data.success}
            <div class="text-center p-8 text-muted-foreground"><p>{data.error ?? 'Failed to load friends.'}</p></div>
          {:else if friends.length === 0}
            <div class="flex justify-center items-center min-h-50 w-full text-muted-foreground italic">
              <p class="m-0">No mutual friends at this time.</p>
            </div>
          {:else}
            {#each friends as friend (friend.id)}
              <li class="flex items-center gap-3 p-2 rounded-2xl transition-colors hover:bg-white">
                <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                  {#if friend.profilePictureUrl}
                    <img
                      src={friend.profilePictureUrl}
                      alt={friend.displayName}
                      class="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  {:else}
                    <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-sm">
                      {friend.displayName?.charAt(0).toUpperCase()}
                    </div>
                  {/if}
                </div>
                <span class="flex-1 text-sm font-semibold text-[#4a3050] whitespace-nowrap overflow-hidden text-ellipsis">{friend.displayName}</span>
                <a
                  href="/garden/{friend.id}"
                  aria-label={`Visit ${friend.displayName}'s garden`}
                  class="cursor-pointer p-1.5 rounded-full text-[#6b5b6b] flex items-center justify-center shrink-0 transition-all hover:bg-amber-50 hover:text-amber-500 hover:scale-[1.08] [&_svg]:w-5 [&_svg]:h-5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 19h18" />
                    <path d="M12 19v-8" />
                    <path d="M12 13c-1.8-.2-3-1.4-3.2-3.2 1.8 0 3.2 1 3.2 3.2z" fill="currentColor" fill-opacity="0.1" />
                    <path d="M12 11c1.8-.2 3-1.4 3.2-3.2-1.8 0-3.2 1-3.2 3.2z" fill="currentColor" fill-opacity="0.1" />
                    <circle cx="12" cy="6.5" r="1.6" fill="currentColor" fill-opacity="0.12" />
                    <path d="M12 4.9v-1" />
                    <path d="M13.4 5.7l.8-.8" />
                    <path d="M10.6 5.7l-.8-.8" />
                    <path d="M6.5 19v-4" />
                    <path d="M6.5 15.5c-1.4 0-2.3-.9-2.5-2.2 1.4 0 2.5.8 2.5 2.2z" fill="currentColor" fill-opacity="0.1" />
                    <path d="M17.5 19v-3" />
                    <path d="M17.5 16c1.4 0 2.3-.9 2.5-2.2-1.4 0-2.5.8-2.5 2.2z" fill="currentColor" fill-opacity="0.1" />
                  </svg>
                </a>
              </li>
            {/each}
          {/if}
        </ul>
      </div>
    </aside>
  </div>
</div>

{#if activeCommentPost}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs z-1000 flex items-center justify-center max-[640px]:items-end"
    onclick={closeComments}
    onkeydown={(e) => e.key === 'Escape' && closeComments()}
    role="presentation"
  >
    <div
      class="bg-white w-full max-w-120 h-[80vh] max-h-175 rounded-4xl flex flex-col shadow-xl overflow-hidden max-[640px]:h-[90vh] max-[640px]:max-h-none max-[640px]:rounded-b-none max-[640px]:mt-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-label="Comments modal"
    >
      <div class="flex items-center justify-between py-4 px-5 border-b border-border bg-white z-2">
        <h3 class="text-lg font-semibold text-[#4a3050]">Comments</h3>
        <button
          type="button"
          aria-label="Close comments"
          onclick={closeComments}
          class="border-none cursor-pointer text-muted-foreground p-1 rounded-full flex items-center justify-center transition-colors hover:bg-pink-50 hover:text-[#4a3050] [&_svg]:size-5"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4" bind:this={commentsContainer}>
        <div class="flex gap-3">
          <div class="w-9 h-9 rounded-full bg-linear-to-br from-brand-pink to-brand-amber p-0.5 shrink-0">
            <div class="w-full h-full rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
              {#if activeCommentPost.author?.profilePictureUrl}
                <img src={activeCommentPost.author.profilePictureUrl} alt="" class="w-full h-full object-cover" />
              {:else}
                {(activeCommentPost.author?.displayName ?? activeCommentPost.author?.username ?? 'U').charAt(0).toUpperCase()}
              {/if}
            </div>
          </div>
          <div class="flex-1 text-sm leading-snug">
            <span class="font-semibold text-[#4a3050] mr-1.5">
              {activeCommentPost.author?.displayName ?? activeCommentPost.author?.username ?? 'Unknown'}
            </span>
            <span class="text-[#4a3050]">{activeCommentPost.caption ?? ''}</span>
            <div class="text-xs text-muted-foreground mt-1">{formatTime(activeCommentPost.createdAt)}</div>
          </div>
        </div>

        <hr class="border-t border-slate-200 dark:border-slate-800 my-2" />

        {#if isFetchingComments}
          <div class="text-center text-muted-foreground text-sm py-8">Loading comments…</div>
        {:else}
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

              <div class="flex-1 text-sm leading-snug">
                <span class="font-semibold text-[#4a3050] mr-1.5">
                  {comment.author?.displayName ?? comment.author?.username ?? 'User'}
                </span>
                <span class="text-[#4a3050]">{comment.content}</span>
                
                <!-- Action Row: Time + Delete Button -->
                <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatTime(comment.createdAt)}</span>

                  {#if data.me && (comment.author?.id === data.me.id || activeCommentPost?.author?.id === data.me.id)}
                    <span class="text-neutral-300">•</span>
                    <button
                      type="button"
                      onclick={() => confirmDelete(comment.id)}
                      class="text-xs font-medium text-rose-500 hover:text-rose-600 hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Delete
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          {:else}
            <div class="text-center text-muted-foreground text-sm py-8">
              <p>No comments yet. Start the conversation!</p>
            </div>
          {/each}
        {/if}
      </div>

      <div class="py-4 px-5 border-t border-border bg-white">
        <form
          method="POST"
          action="?/addComment"
          class="flex flex-col"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === 'success') {
                commentText = '';
                if (activeCommentPost) {
                  await refreshComments(activeCommentPost.id);
                }

                if (commentsContainer) {
                  const container = commentsContainer;
                  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
                }
              }
              update({ reset: false });
            };
          }}
        >
          <input type="hidden" name="postId" value={activeCommentPost.id} />

          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-pink-300 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {#if data.me?.profilePictureUrl}
                <img src={data.me.profilePictureUrl} alt="Me" class="w-full h-full object-cover" />
              {:else}
                {(data.me?.displayName ?? data.me?.username ?? 'M').charAt(0).toUpperCase()}
              {/if}
            </div>

            <input
              type="text"
              name="content"
              placeholder="Add a comment..."
              bind:value={commentText}
              autocomplete="off"
              required
              class="flex-1 bg-transparent border-none outline-none font-[inherit] text-sm text-[#4a3050] placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              class="border-none font-[inherit] font-semibold cursor-pointer text-sm transition-colors text-amber-500 hover:text-amber-600 disabled:text-muted-foreground disabled:cursor-default disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if commentToDelete !== null}
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs z-1100 flex items-center justify-center p-4"
    onclick={cancelDelete}
    onkeydown={(e) => e.key === 'Escape' && cancelDelete()}
    role="presentation"
  >
    <div
      class="bg-white w-full max-w-80 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div class="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </div>

      <div>
        <h4 id="delete-dialog-title" class="text-base font-semibold text-[#4a3050]">Delete Comment?</h4>
        <p class="text-xs text-muted-foreground mt-1">Are you sure you want to delete this comment? This action cannot be undone.</p>
      </div>

      {#if deleteError}
        <p class="text-xs text-red-500 mt-2">{deleteError}</p>
      {/if}

      <div class="flex items-center gap-3 w-full mt-2">
        <button
          type="button"
          onclick={cancelDelete}
          class="flex-1 py-2 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <form
          method="POST"
          action="?/deleteComment"
          class="flex-1"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                const deletedId = commentToDelete;
                commentToDelete = null;
                deleteError = null;

                if (deletedId !== null) {
                  activeComments = activeComments.filter((c) => c.id !== deletedId);
                }
                if (activeCommentPost) {
                  await refreshComments(activeCommentPost.id);
                }
              } else if (result.type === 'failure') {
                deleteError = (result.data as { error?: string })?.error ?? 'Could not delete this comment.';
              }
            };
          }}
        >
          <input type="hidden" name="commentId" value={commentToDelete} />
          <button
            type="submit"
            class="w-full py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer border-none"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}