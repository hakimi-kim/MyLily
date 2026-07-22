<!-- <script lang="ts">
  import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Sheet from "$lib/components/ui/sheet/index.js";
  import { buttonVariants } from "$lib/components/ui/button/index.js";
  import { cn } from '$lib/utils.js';
  import { page } from '$app/stores';
  import Home from '@lucide/svelte/icons/home';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import Calculator from '@lucide/svelte/icons/calculator';
  import Activity from '@lucide/svelte/icons/activity';
  import FileCheck from '@lucide/svelte/icons/file-check';
  import HelpCircle from '@lucide/svelte/icons/circle-help';
  import { Menu } from 'lucide-svelte';

  let open = $state(false); 
  let innerWidth = $state(0);

  const currentPath = $derived($page.url.pathname);

  $effect(() => {
    if (innerWidth >= 768) {
      open = false;
    }
  });

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/guidelines', label: 'Guidelines', icon: BookOpen },
    { path: '/dosage_calculator', label: 'Dosage Calculator', icon: Calculator },
    { path: '/case_studies', label: 'Case Studies', icon: Activity },
    // { path: '/review_forms', label: 'Review Forms', icon: FileCheck },
    { path: '/faq', label: 'FAQ', icon: HelpCircle }
  ];
</script>

<svelte:window bind:innerWidth />

<nav class="sticky top-0 z-50 border-b border-border bg-card shadow-card">
  <div class="container mx-auto px-4">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center space-x-2">
        <Activity class="h-8 w-8 text-primary" />
        <span class="text-xl font-bold text-primary"> ICU Antibiotic Compass </span>
      </div>

      <div class="hidden space-x-1 md:flex">
        <NavigationMenu.Root>
          <NavigationMenu.List>
						{#each navItems as item}
							{@const isActive = currentPath === item.path}
							{@const Icon = item.icon} <NavigationMenu.Item>
								<NavigationMenu.Link href={item.path}>
									{#snippet child()}
        						<a href={item.path} class={cn(
                        'flex items-center space-x-2 rounded-lg px-4 py-2 transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}>
												<Icon class="h-4 w-4" /> <span class="text-sm font-medium">{item.label}</span>
											</a>
										{/snippet}
									</NavigationMenu.Link>
								</NavigationMenu.Item>
							{/each}						
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
      
      <div class="md:hidden">
        <Sheet.Root bind:open>
          <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>
            <Menu class="text-primary"/>
          </Sheet.Trigger>
          <Sheet.Content side="right">
            <Sheet.Header>
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground"
              >
                <Activity class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium text-primary">ICU Antibiotic Compass</span>
              </div>
            </Sheet.Header>

            <div class="mt-8 flex flex-col space-y-3">
							{#each navItems as item}
								{@const isActive = currentPath === item.path}
								{@const Icon = item.icon} <a
									href={item.path}
									onclick={() => (open = false)}
									class={cn(
                    'flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  )}
								>
									<Icon class="h-5 w-5" /> <span>{item.label}</span>
								</a>
							{/each}
            </div>

          </Sheet.Content>
        </Sheet.Root>
      </div>
    </div>
  </div>
</nav> -->