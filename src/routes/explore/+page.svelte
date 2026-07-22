<script lang="ts">
  import { enhance } from "$app/forms";
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { data, form } = $props();

  let friends = $derived(data.friends ?? []);
  let results = $derived(data.results ?? []);
  let query = $derived(data.query ?? "");

</script>

<div class="min-h-screen bg-neutral-100">
  <div class="grid grid-cols-[1fr_2fr] gap-8 max-w-280 mx-auto items-start px-5 sm:px-6 md:px-8 max-[1040px]:grid-cols-[72px_minmax(0,1fr)] max-[640px]:grid-cols-1 max-[640px]:px-4">

    <Sidebar />

    <!-- Center: Search + results -->
    <main class="min-w-0">
      <div class="flex flex-col gap-4 py-8 max-[640px]:pt-20 max-[640px]:pb-17.5">
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