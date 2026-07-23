import { fetchAPI, APIError } from '$lib/services/api.server';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	register: async ({ request }) => {
		const form = await request.formData();
		const username = (form.get('username') as string)?.trim();
		const password = form.get('password') as string;
		const confirmPassword = form.get('confirmPassword') as string;
		const displayName = (form.get('displayName') as string)?.trim();

		const defaultErrors = {
			username: '',
			password: '',
			confirmPassword: '',
			form: ''
		};

		if (!username) {
			return fail(400, {
				username,
				displayName,
				errors: { ...defaultErrors, username: 'Username is required.' }
			});
		}

		if (!/^[a-z0-9_]{3,30}$/.test(username)) {
			return fail(400, {
				username,
				displayName,
				errors: {
					...defaultErrors,
					username:
						'Username must be 3–30 characters and contain only lowercase letters, numbers, or underscores.'
				}
			});
		}

		if (!password) {
			return fail(400, {
				username,
				displayName,
				errors: { ...defaultErrors, password: 'Password is required.' }
			});
		}

		if (password.length < 8) {
			return fail(400, {
				username,
				displayName,
				errors: { ...defaultErrors, password: 'Password must be at least 8 characters long.' }
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				username,
				displayName,
				errors: { ...defaultErrors, confirmPassword: 'Passwords do not match.' }
			});
		}

		try {
			await fetchAPI('/auth/register', {
				method: 'POST',
				body: JSON.stringify({ username, password, displayName: displayName || null })
			});
		} catch (error) {
			if (isRedirect(error)) throw error;

			return fail(409, {
				username,
				displayName,
				errors: {
					...defaultErrors,
					form: error instanceof APIError ? error.message : 'Registration failed.'
				}
			});
		}

		throw redirect(303, '/login');
	}
};
