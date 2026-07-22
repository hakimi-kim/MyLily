<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import lilyLogo from "$lib/assets/lily.png";
  import Sidebar from "$lib/components/Sidebar.svelte";

  let { data } = $props();

  let items = $derived(data.items ?? []);
  let justAcceptedId = $state<string | null>(null);

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

    <!-- Center: Notifications -->
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
              {#if item.type === 'lily_confirmation'}
                <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg shrink-0">🌷</div>
              {:else if item.type === 'lily_bloomed'}
                <div class="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-lg shrink-0">🌸</div>
              {:else}
                <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                  {#if item.actor?.profilePictureUrl}
                    <img
                      src={item.actor.profilePictureUrl}
                      alt={item.actor?.displayName ?? item.actor?.username ?? 'Actor avatar'}
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
                  {#if item.type === 'lily_confirmation'}
                    Your wish <span class="italic">"{item.wishText}"</span> is ready — did it come true?
                  {:else if item.type === 'lily_bloomed'}
                    Your wish <span class="italic">"{item.wishText}"</span> has bloomed!
                  {:else}
                    <span class="font-semibold">{item.actor?.displayName ?? item.actor?.username}</span>
                    {#if item.type === 'friend_request'}
                      wants to connect
                    {:else if item.type === 'like'}
                      bloomed your post
                      {#if item.postCaption}<span class="text-muted-foreground">— "{item.postCaption}"</span>{/if}
                    {:else if item.type === 'comment'}
                      <form method="POST" action="?/deleteComment" use:enhance>
                        <input type="hidden" name="commentId" value={item.commentId} />
                        <button type="submit" class="text-xs text-muted-foreground hover:text-red-500">Delete</button>
                      </form>
                    {/if}
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground mt-0.5">{formatTime(item.createdAt)}</p>
              </div>

              {#if item.type === 'friend_request'}
                {#if justAcceptedId === item.id}
                  <span class="text-xs text-sage font-medium px-3 py-1.5">You're now friends 🌸</span>
                {:else}
                  <div class="flex gap-2 shrink-0">
                    <form method="POST" action="?/respond" use:enhance={() => {
                      return async ({ result, update }) => {
                        if (result.type === 'success') {
                          justAcceptedId = item.id;
                          setTimeout(async () => {
                            justAcceptedId = null;
                            await update();
                          }, 1500);
                        } else {
                          await update();
                        }
                      };
                    }}>
                      <input type="hidden" name="requestId" value={item.requestId} />
                      <input type="hidden" name="accept" value="true" />
                      <button type="submit" class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">Accept</button>
                    </form>
                    <form method="POST" action="?/respond" use:enhance>
                      <input type="hidden" name="requestId" value={item.requestId} />
                      <input type="hidden" name="accept" value="false" />
                      <button type="submit" class="px-3 py-1.5 rounded-full bg-neutral-100 text-[#6b5b6b] text-xs font-semibold cursor-pointer hover:bg-neutral-200">Decline</button>
                    </form>
                  </div>
                {/if}
              {:else if item.type === 'lily_confirmation'}
                <a href="/lily/{item.lilyId}">
                  <button class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">
                    Review
                  </button>
                </a>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </main>
  </div>
</div>