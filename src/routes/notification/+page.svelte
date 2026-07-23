<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import Sidebar from "$lib/components/Sidebar.svelte";

  let { data } = $props();

  let items = $derived(data.items ?? []);

  function formatTime(iso: string) {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      const days = Math.floor(hrs / 24);
      return `${days}d`;
    } catch {
      return "";
    }
  }
</script>

<div class="min-h-screen bg-neutral-100">
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 sm:px-6 md:px-8 max-[1040px]:grid-cols-[72px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-4">

    <Sidebar />

    <main class="min-w-0">
      <div class="flex flex-col gap-3 py-8 max-[640px]:pt-20 max-[640px]:pb-17.5">
        <h1 class="font-serif text-2xl text-[#4a3050] mb-2">Notifications</h1>

        {#if !data.success}
          <div class="text-center p-8 text-muted-foreground"><p>{data.error ?? 'Failed to load notifications.'}</p></div>
        {:else if items.length === 0}
          <div class="flex justify-center items-center min-h-50 w-full text-muted-foreground italic">
            <p class="m-0">Nothing here yet.</p>
          </div>
        {:else}
          {#each items as item (item.id)}
            <div class="bg-white rounded-2xl flex items-center gap-3 py-3 px-4 shadow-sm">
              {#if item.type === 'LilyConfirmation'}
                <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg shrink-0">🌷</div>
              {:else if item.type === 'LilyBloomed'}
                <div class="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-lg shrink-0">🌸</div>
              {:else}
                <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                  {#if item.actor?.profilePictureUrl}
                    <img
                      src={item.actor.profilePictureUrl}
                      alt={item.actor?.displayName ?? item.actor?.username ?? 'Avatar'}
                      class="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  {:else}
                    <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-sm">
                      {(item.actor?.displayName ?? item.actor?.username ?? '?').charAt(0).toUpperCase()}
                    </div>
                  {/if}
                </div>
              {/if}

              <div class="flex-1 min-w-0">
                <div class="text-sm text-[#4a3050] leading-snug">
                  {#if item.type === 'LilyConfirmation'}
                    Your wish <span class="italic">"{item.snippet}"</span> is ready — did it come true?
                  {:else if item.type === 'LilyBloomed'}
                    Your wish <span class="italic">"{item.snippet}"</span> has bloomed!
                  {:else if item.type === 'FriendRequestReceived'}
                    <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> wants to connect

                  <!-- Sent to Requester -->
                  {:else if item.type === 'FriendRequestAcceptedByReceiver'}
                    <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> accepted your friend request. You're now friends with <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> 🌸

                  <!-- Sent to Receiver -->
                  {:else if item.type === 'FriendRequestAccepted'}
                    You're now friends with <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> 🌸

                  {:else if item.type === 'FriendRequestDeclined'}
                    You declined <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span>'s request
                  {:else if item.type === 'Like'}
                    <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> bloomed your post
                    {#if item.snippet}<span class="text-muted-foreground">— "{item.snippet}"</span>{/if}
                  {:else if item.type === 'Comment'}
                    <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span> commented:
                    <span class="italic">"{item.snippet}"</span>
                    <form method="POST" action="?/deleteComment" use:enhance class="inline">
                      <input type="hidden" name="commentId" value={item.relatedCommentId} />
                      <button type="submit" class="text-xs text-muted-foreground hover:text-red-500 ml-1">(delete comment)</button>
                    </form>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">{formatTime(item.createdAt)}</p>
              </div>

              {#if item.type === 'FriendRequestReceived'}
                <div class="flex gap-2 shrink-0">
                  <form method="POST" action="?/respond" use:enhance>
                    <input type="hidden" name="requestId" value={item.relatedFriendRequestId} />
                    <input type="hidden" name="accept" value="true" />
                    <button type="submit" class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">Accept</button>
                  </form>
                  <form method="POST" action="?/respond" use:enhance>
                    <input type="hidden" name="requestId" value={item.relatedFriendRequestId} />
                    <input type="hidden" name="accept" value="false" />
                    <button type="submit" class="px-3 py-1.5 rounded-full bg-neutral-100 text-[#6b5b6b] text-xs font-semibold cursor-pointer hover:bg-neutral-200">Decline</button>
                  </form>
                </div>
              {:else if item.type === 'LilyConfirmation'}
                <a href="/lily/{item.relatedLilyId}">
                  <button class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">Review</button>
                </a>
              {/if}

              <form method="POST" action="?/deleteNotification" use:enhance>
                <input type="hidden" name="notificationId" value={item.id} />
                <button
                  type="submit"
                  aria-label="Dismiss notification"
                  class="ml-1 p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0 border-none bg-transparent cursor-pointer"
                >
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          {/each}
        {/if}
      </div>
    </main>
  </div>
</div>