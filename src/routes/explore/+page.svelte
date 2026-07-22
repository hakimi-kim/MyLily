<script lang="ts">
  import { enhance } from "$app/forms";
  import lilyLogo from "$lib/assets/lily.png";
  import { page } from '$app/state';

  let { data, form } = $props();

  let friends = $derived(data.friends ?? []);
  let results = $derived(data.results ?? []);
  let query = $derived(data.query ?? "");

</script>

<div class="min-h-screen bg-neutral-100">
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 max-[1040px]:grid-cols-[88px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-0">

    <!-- Left Sidebar -->
    <aside class="sticky top-0 h-screen py-8 flex flex-col max-[640px]:fixed max-[640px]:bottom-0 max-[640px]:left-0 max-[640px]:right-0 max-[640px]:top-auto max-[640px]:h-auto max-[640px]:bg-white max-[640px]:border-t max-[640px]:border-border max-[640px]:z-100 max-[640px]:py-1.5">
      <div class="flex flex-col h-full gap-1 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-around">
        <div class="flex items-center gap-2 px-3 pb-8">
          <img src={lilyLogo} alt="Lily Garden Logo" class="w-8 h-8" />
          <span class="font-serif text-2xl font-medium text-[#5b3a5b] tracking-wide max-[1040px]:hidden">Stargazerr</span>
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
            <button aria-label="Notifications" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left text-[#6b5b6b] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 hover:bg-pink-50 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
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
            <button aria-label="Explore" class="relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left bg-pink-100 text-[#4a3050] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl">
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

    <!-- Center: Search + results -->
    <main class="min-w-0">
      <div class="flex flex-col gap-4 py-8 max-[640px]:pb-17.5">
        <h1 class="font-serif text-2xl text-[#4a3050]">Explore</h1>

        <form method="GET" class="flex gap-2">
          <input
            type="text"
            name="q"
            value={query}
            placeholder="Search by username..."
            class="flex-1 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 outline-none focus:border-pink-300 text-sm"
          />
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#65a0a0] text-white text-sm font-semibold cursor-pointer hover:opacity-90">
            Search
          </button>
        </form>

        {#if form?.error}
          <p class="text-sm text-rose-500">{form.error}</p>
        {/if}

        {#if query}
          <!-- Search results -->
          {#if results.length === 0}
            <p class="text-center text-muted-foreground italic py-8">No one found for "{query}".</p>
          {:else}
            <ul class="list-none flex flex-col gap-1">
              {#each results as person (person.id)}
                <li class="flex items-center gap-3 p-3 rounded-2xl bg-white">
                  <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                    <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-sm">
                      {(person.displayName ?? person.username).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-[#4a3050]">{person.displayName ?? person.username}</p>
                    <p class="text-xs text-muted-foreground">@{person.username}</p>
                  </div>

                  {#if person.status === 3}
                    <a href="/garden/{person.id}">
                      <button class="px-3 py-1.5 rounded-full bg-neutral-100 text-[#6b5b6b] text-xs font-semibold cursor-pointer hover:bg-amber-50 hover:text-amber-500">
                        Visit garden
                      </button>
                    </a>
                  {:else if person.status === 1}
                    <button disabled class="px-3 py-1.5 rounded-full bg-neutral-100 text-muted-foreground text-xs font-semibold cursor-not-allowed">
                      Pending
                    </button>
                  {:else if person.status === 2}
                    <a href="/notification">
                      <button class="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold cursor-pointer hover:bg-amber-200">
                        Respond
                      </button>
                    </a>
                  {:else}
                    <form method="POST" action="?/connect" use:enhance>
                      <input type="hidden" name="addresseeId" value={person.id} />
                      <button type="submit" class="px-3 py-1.5 rounded-full bg-[#65a0a0] text-white text-xs font-semibold cursor-pointer hover:opacity-90">
                        Connect
                      </button>
                    </form>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <!-- Default view: current mutual friends -->
          <p class="text-xs font-bold tracking-widest uppercase text-violet-400 px-1">Your mutual friends</p>
          {#if friends.length === 0}
            <p class="text-center text-muted-foreground italic py-8">No mutual friends yet — search above to connect.</p>
          {:else}
            <ul class="list-none flex flex-col gap-1">
              {#each friends as friend (friend.id)}
                <li class="flex items-center gap-3 p-3 rounded-2xl bg-white">
                  <div class="w-10 h-10 rounded-full p-0.5 bg-linear-to-br from-pink-300 to-amber-300 shrink-0">
                    <div class="w-full h-full rounded-full bg-pink-300 flex items-center justify-center text-white font-bold border-2 border-white text-sm">{friend.displayName?.charAt(0).toUpperCase()}</div>
                  </div>
                  <span class="flex-1 text-sm font-semibold text-[#4a3050]">{friend.displayName}</span>
                  <a href="/garden/{friend.id}">
                    <button class="px-3 py-1.5 rounded-full bg-neutral-100 text-[#6b5b6b] text-xs font-semibold cursor-pointer hover:bg-amber-50 hover:text-amber-500">
                      Visit garden
                    </button>
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    </main>
  </div>
</div>