<script lang="ts">
	import { enhance } from '$app/forms';

	let { lilyId, open = $bindable(false) }: { lilyId: number; open: boolean } = $props();

	let loading = $state(false);
	let errorMsg = $state<string | null>(null);
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm animate-fade-up"
		role="dialog"
		aria-modal="true"
		onclick={(e) => e.target === e.currentTarget && (open = false)}
	>
		<div class="relative bg-parchment border border-border rounded-sm p-8 sm:p-12 max-w-md w-full shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)] overflow-hidden">
  		<div class="grain-paper absolute inset-0 pointer-events-none"></div>
			<div class="mb-6 pl-4 sm:pl-6">
				<p class="text-[10px] uppercase tracking-[0.25em] text-sepia/60 font-sans">A new entry</p>
				<h2 class="font-serif italic text-2xl font-normal text-ink leading-tight">Add to this journey</h2>
				<p class="font-serif italic text-sepia/70 mt-1">What happened? Small steps count too.</p>
			</div>

			<form
				method="POST"
				action="?/addProgress"
				use:enhance={() => {
					loading = true;
					errorMsg = null;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'failure') {
							errorMsg = (result.data as any)?.error ?? 'Could not save this entry.';
						} else if (result.type === 'success') {
							open = false;
						}
						await update();
					};
				}}
				class="space-y-4 mt-2 pl-4 sm:pl-6"
			>
				<input type="hidden" name="lilyId" value={lilyId} />

				<div class="space-y-2">
					<label class="text-[10px] uppercase tracking-widest text-sepia/70 font-sans">Notes</label>
					<textarea
						name="note"
						placeholder="How did it feel?"
						class="w-full bg-card border border-border rounded-sm px-4 py-3 font-serif text-ink outline-none focus:ring-2 focus:ring-sage min-h-24 transition-all"
						required
					></textarea>
				</div>

				{#if errorMsg}
					<p class="text-sm text-destructive font-sans">{errorMsg}</p>
				{/if}

				<div class="flex justify-end gap-2 pt-2">
					<button type="button" onclick={() => (open = false)} class="px-4 py-2 text-sm text-sepia hover:text-ink transition-colors font-sans rounded-full">
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						class="bg-ink text-parchment hover:bg-ink/85 rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50 transition-colors font-sans"
					>
						{loading ? 'Saving...' : 'Add entry'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}