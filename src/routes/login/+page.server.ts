import { authAPI, APIError } from '$lib/services/api.server';
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (token) throw redirect(303, '/');

	return {};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string)?.trim();
		const password = data.get('password') as string;

		if (!username || !password) {
			return fail(400, {
				username,
				error: 'Username and password are required.'
			});
		}

		// if (!EMAIL_REGEX.test(username)) {
		// 	return fail(400, {
		// 		username,
		// 		error: 'Username must be a valid email address.'
		// 	});
		// }

		try {
			const response = await authAPI.login({ username, password });

			cookies.set('token', response.token, {
				path: '/',
				httpOnly: true,
				secure: !dev,
				maxAge: 60 * 60 * 24 * 3, // 3 days
				sameSite: 'lax'
			});

			throw redirect(303, '/');
		} catch (error) {
			if (isRedirect(error)) throw error;

			if (error instanceof APIError) {
				return fail(error.status || 400, {
					username,
					error: error.message
				});
			}

			return fail(500, {
				username,
				error: 'An unexpected error occurred during login.'
			});
		}
	}
};
