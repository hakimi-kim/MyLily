import { authAPI } from '$lib/services/api.server';
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';
import { BLOCKED_MESSAGE, isBlockedUsername } from '$lib/blocked';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('token');
	if (token) throw redirect(303, '/');
	return { blockedMessage: url.searchParams.has('blocked') ? BLOCKED_MESSAGE : '' };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string)?.trim();
		const password = data.get('password') as string;

		if (!username) {
			return fail(400, {
				username,
				errors: { username: 'Username is required.', password: '', form: '' }
			});
		}

		if (isBlockedUsername(username)) {
			return fail(403, { blockedMessage: BLOCKED_MESSAGE });
		}

		if (!password) {
			return fail(400, {
				username,
				errors: { username: '', password: 'Password is required.', form: '' }
			});
		}

		try {
			const response = await authAPI.login({ username, password });

			cookies.set('token', response.token, {
				path: '/',
				httpOnly: true,
				secure: !dev,
				maxAge: 60 * 60 * 24 * 3,
				sameSite: 'lax'
			});

			throw redirect(303, '/');
		} catch (error) {
			if (isRedirect(error)) throw error;

			return fail(401, {
				username,
				errors: { username: '', password: '', form: 'Incorrect username or password.' }
			});
		}
	}
};
