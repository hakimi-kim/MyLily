<script lang="ts">
	import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import lilyLogo from "$lib/assets/lily.png";

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
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 max-[1040px]:grid-cols-[88px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-0">

    <!-- Left Sidebar -->
    <aside class="sticky top-0 h-screen py-8 flex flex-col max-[640px]:fixed max-[640px]:bottom-0 max-[640px]:left-0 max-[640px]:right-0 max-[640px]:top-auto max-[640px]:h-auto max-[640px]:bg-white max-[640px]:border-t max-[640px]:border-border max-[640px]:z-100 max-[640px]:py-1.5">
      <div class="flex flex-col h-full gap-1 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-around">
        <div class="flex items-center gap-2 px-3 pb-8">
          <img src={lilyLogo} alt="Lily Garden Logo" class="w-8 h-8" />
          <span class="font-serif text-2xl font-medium text-[#5b3a5b] tracking-wide max-[1040px]:hidden">Lily</span>
        </div>

        <nav class="flex flex-col gap-1 max-[640px]:flex-row max-[640px]:gap-0">
          <a href="/">
            <button class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11.5L12 4l9 7.5" />
                <path d="M5 10v9.5A1.5 1.5 0 0 0 6.5 21H9v-6h6v6h2.5a1.5 1.5 0 0 0 1.5-1.5V10" />
              </svg>
              <span>Home</span>
            </button>
          </a>

          <a href="/journal">
            <button class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Journal</span>
            </button>
          </a>

          <a href="/garden/">
            <button aria-label="Garden" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
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
              <span>Garden</span>
            </button>
          </a>

          <a href="/notification">
            <button aria-label="Notifications" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left bg-pink-100 text-[#4a3050] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              {#if page.data.hasNotifications}
                <span class="absolute top-2.5 left-6.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-white"></span>
              {/if}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Notifications</span>
            </button>
          </a>

          <a href="/explore">
            <button aria-label="Explore" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span>Explore</span>
            </button>
          </a>
        </nav>

        <div class="mt-auto flex flex-col gap-1 pb-3 max-[640px]:flex-row max-[640px]:mt-0 max-[640px]:gap-0 max-[640px]:pb-0">
          <a href="/create">
            <button aria-label="Create" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span>Create</span>
            </button>
          </a>

          <a href="/profile">
            <button aria-label="Profile" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profile</span>
            </button>
          </a>
        </div>
      </div>
    </aside>

    <!-- Center: Notifications -->
    <main class="min-w-0">
      <div class="flex flex-col gap-3 py-8 max-[640px]:pb-17.5">
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
                  <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-sm">
                    {(item.actor?.displayName ?? item.actor?.username ?? '?').charAt(0).toUpperCase()}
                  </div>
                </div>
              {/if}

              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#4a3050] leading-snug">
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
                      commented: <span class="text-muted-foreground">"{item.commentContent}"</span>
                    {/if}
                  {/if}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">{formatTime(item.createdAt)}</p>
              </div>

              {#if item.type === 'friend_request'}
                <div class="flex gap-2 shrink-0">
                  <form method="POST" action="?/respond" use:enhance>
                    <input type="hidden" name="requestId" value={item.requestId} />
                    <input type="hidden" name="accept" value="true" />
                    <button type="submit" class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">
                      Accept
                    </button>
                  </form>
                  <form method="POST" action="?/respond" use:enhance>
                    <input type="hidden" name="requestId" value={item.requestId} />
                    <input type="hidden" name="accept" value="false" />
                    <button type="submit" class="px-3 py-1.5 rounded-full bg-neutral-100 text-[#6b5b6b] text-xs font-semibold cursor-pointer hover:bg-neutral-200">
                      Decline
                    </button>
                  </form>
                </div>
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