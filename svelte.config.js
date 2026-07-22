import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Tells Svelte how to process styles and TypeScript in components
	preprocess: vitePreprocess(),

	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in Svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},

	kit: {
		adapter: adapter()
	}

	// Add this block to quiet down a11y checks temporarily
	// compilerOptions: {
	// 	warningFilter: (warning) => !warning.code.startsWith('a11y_')
	// }
};

export default config;
