<!-- $lib/components/Sidebar.svelte -->
<script lang="ts">
  import lilyLogo from '$lib/assets/lily.png';
  import { page } from '$app/state';

  const navItems = [
    { href: '/', label: 'Home', icon: `<path d="M3 11.5L12 4l9 7.5" /><path d="M5 10v9.5A1.5 1.5 0 0 0 6.5 21H9v-6h6v6h2.5a1.5 1.5 0 0 0 1.5-1.5V10" />` },
    { href: '/journal', label: 'Journal', icon: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />` },
    { href: '/garden/', label: 'Garden', icon: `<path d="M3 19h18" /><path d="M12 19v-8" /><path d="M12 13c-1.8-.2-3-1.4-3.2-3.2 1.8 0 3.2 1 3.2 3.2z" fill="currentColor" fill-opacity="0.1" /><path d="M12 11c1.8-.2 3-1.4 3.2-3.2-1.8 0-3.2 1-3.2 3.2z" fill="currentColor" fill-opacity="0.1" /><circle cx="12" cy="6.5" r="1.6" fill="currentColor" fill-opacity="0.12" /><path d="M12 4.9v-1" /><path d="M13.4 5.7l.8-.8" /><path d="M10.6 5.7l-.8-.8" /><path d="M6.5 19v-4" /><path d="M6.5 15.5c-1.4 0-2.3-.9-2.5-2.2 1.4 0 2.5.8 2.5 2.2z" fill="currentColor" fill-opacity="0.1" /><path d="M17.5 19v-3" /><path d="M17.5 16c1.4 0 2.3-.9 2.5-2.2-1.4 0-2.5.8-2.5 2.2z" fill="currentColor" fill-opacity="0.1" />` },
    { href: '/notification', label: 'Notifications', icon: `<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />`, showDot: true },
    { href: '/explore', label: 'Explore', icon: `<circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />` }
  ];

  const bottomItems = [
    { href: '/create', label: 'Create', icon: `<circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />` },
    { href: '/profile', label: 'Profile', icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />` }
  ];

  const buttonClass =
    'relative flex items-center gap-3.5 border-none cursor-pointer py-3 px-3.5 rounded-2xl font-semibold text-[0.95rem] transition-colors w-full text-left [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 max-[1040px]:justify-center max-[1040px]:px-3 max-[1040px]:[&_span]:hidden max-[640px]:flex-col max-[640px]:gap-0.5 max-[640px]:py-1.5 max-[640px]:px-2.5 max-[640px]:rounded-xl';

  function isActive(href: string) {
    const path = page.url.pathname;
    if (href === '/') return path === '/';
    return path.startsWith(href);
  }
</script>

<!-- Mobile-only top bar: Create (left) · Stargazerr (center) · Profile (right) -->
<header class="hidden max-[640px]:flex fixed top-0 inset-x-0 z-100 h-14 items-center justify-between px-4 bg-white border-b border-border">
  <a
    href="/create"
    aria-label="Create"
    class="flex items-center justify-center w-9 h-9 rounded-full text-[#6b5b6b] hover:bg-pink-50 transition-colors [&_svg]:w-5 [&_svg]:h-5"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      {@html bottomItems[0].icon}
    </svg>
  </a>

  <span class="font-serif text-lg font-medium text-[#5b3a5b] tracking-wide">Stargazerr</span>

  <a
    href="/profile"
    aria-label="Profile"
    class="flex items-center justify-center w-9 h-9 rounded-full text-[#6b5b6b] hover:bg-pink-50 transition-colors [&_svg]:w-5 [&_svg]:h-5"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      {@html bottomItems[1].icon}
    </svg>
  </a>
</header>

<aside class="sticky top-0 h-screen py-8 flex flex-col max-[640px]:fixed max-[640px]:bottom-0 max-[640px]:left-0 max-[640px]:right-0 max-[640px]:top-auto max-[640px]:h-auto max-[640px]:bg-white max-[640px]:border-t max-[640px]:border-border max-[640px]:z-100 max-[640px]:py-1.5">
  <div class="flex flex-col h-full gap-1 max-[640px]:flex-row max-[640px]:items-center max-[640px]:justify-around">
    <div class="flex items-center gap-2 px-3 pb-8 max-[640px]:hidden">
      <img src={lilyLogo} alt="Lily Garden Logo" class="w-8 h-8" />
      <span class="font-serif text-2xl font-medium text-[#5b3a5b] tracking-wide max-[1040px]:hidden">Stargazerr</span>
    </div>

    <nav class="flex flex-col gap-1 max-[640px]:flex-row max-[640px]:gap-0">
      {#each navItems as item (item.href)}
        <a href={item.href}>
          <button
            aria-label={item.label}
            class="{buttonClass} {isActive(item.href) ? 'bg-pink-100 text-[#4a3050]' : 'text-[#6b5b6b] hover:bg-pink-50'}"
          >
            {#if item.showDot && page.data.hasNotifications}
              <span class="absolute top-2.5 left-6.5 w-2 h-2 bg-amber-400 rounded-full border-2 border-white"></span>
            {/if}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              {@html item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        </a>
      {/each}
    </nav>

    <!-- Create/Profile moved to the mobile top bar; keep them here for desktop & tablet only -->
    <div class="mt-auto flex flex-col gap-1 pb-3 max-[640px]:hidden">
      {#each bottomItems as item (item.href)}
        <a href={item.href}>
          <button
            aria-label={item.label}
            class="{buttonClass} {isActive(item.href) ? 'bg-pink-100 text-[#4a3050]' : 'text-[#6b5b6b] hover:bg-pink-50'}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              {@html item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        </a>
      {/each}
    </div>
  </div>
</aside>