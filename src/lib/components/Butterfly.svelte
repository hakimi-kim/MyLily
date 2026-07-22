<script lang="ts">
  let { class: className = '' }: { class?: string } = $props();
</script>

<svg viewBox="0 0 24 24" width="22" height="22" class="animate-butterfly {className}" aria-hidden="true">
  <path d="M12 12 C 8 6, 2 6, 4 12 C 2 18, 8 18, 12 12 Z" fill="var(--color-dusty-rose)" opacity="0.85" />
  <path d="M12 12 C 16 6, 22 6, 20 12 C 22 18, 16 18, 12 12 Z" fill="var(--color-lavender)" opacity="0.85" />
  <ellipse cx="12" cy="12" rx="0.8" ry="3" fill="var(--color-ink)" />
</svg>