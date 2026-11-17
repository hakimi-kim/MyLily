import { redirect, type Handle } from '@sveltejs/kit';
import { isBlockedToken } from '$lib/blocked';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('token');
	if (token && isBlockedToken(token)) {
		event.cookies.delete('token', { path: '/' });
		if (event.url.pathname !== '/login') throw redirect(303, '/login?blocked=1');
	}
	return resolve(event);
};
