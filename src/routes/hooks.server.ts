import type { HandleServerError } from '@sveltejs/kit';
import { renderErrorPage } from '$lib/error-page';

export const handleError: HandleServerError = ({ error, event }) => {
	console.error('Catastrophic SSR Error Captured:', error);

	// Return standard error shape
	return {
		message: 'Something went wrong on our end. You can try refreshing or head back home.',
		code: 'SSR_CATASTROPHIC_FAILURE'
	};
};
