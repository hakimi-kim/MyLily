import { fetchAPI, APIError } from '$lib/services/api.server';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const actions: Actions = {
	register: async ({ request }) => {
		const form = await request.formData();
		const username = (form.get('username') as string)?.trim();
		const password = form.get('password') as string;
		const confirmPassword = form.get('confirmPassword') as string;
		const displayName = (form.get('displayName') as string)?.trim();

		if (!username || !password || !confirmPassword) {
			return fail(400, {
				username,
				displayName,
				error: 'Username, password, and password confirmation are required.'
			});
		}

		if (!EMAIL_REGEX.test(username)) {
			return fail(400, {
				username,
				displayName,
				error: 'Username must be a valid email address (e.g., user@example.com).'
			});
		}

		if (password.length < 8) {
			return fail(400, {
				username,
				displayName,
				error: 'Password must be at least 8 characters long.'
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				username,
				displayName,
				error: 'Passwords do not match.'
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
				error: error instanceof APIError ? error.message : 'Registration failed'
			});
		}

		throw redirect(303, '/login');
	}
};

// import { fetchAPI, APIError } from '$lib/services/api.server';
// import { fail, redirect, isRedirect } from '@sveltejs/kit';
// import type { Actions } from './$types';

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// export const actions: Actions = {
// 	register: async ({ request }) => {
// 		const form = await request.formData();
// 		const username = (form.get('username') as string)?.trim();
// 		const email = (form.get('email') as string)?.trim();
// 		const password = form.get('password') as string;
// 		const confirmPassword = form.get('confirmPassword') as string;
// 		const displayName = (form.get('displayName') as string)?.trim();

// 		if (!username || !email || !password || !confirmPassword) {
// 			return fail(400, {
// 				username,
// 				email,
// 				displayName,
// 				error: 'Username, email, password, and password confirmation are required.'
// 			});
// 		}

// 		if (!EMAIL_REGEX.test(email)) {
// 			return fail(400, {
// 				username,
// 				email,
// 				displayName,
// 				error: 'Please enter a valid email address (e.g., user@example.com).'
// 			});
// 		}

// 		if (password.length < 8) {
// 			return fail(400, {
// 				username,
// 				email,
// 				displayName,
// 				error: 'Password must be at least 8 characters long.'
// 			});
// 		}

// 		if (password !== confirmPassword) {
// 			return fail(400, {
// 				username,
// 				email,
// 				displayName,
// 				error: 'Passwords do not match.'
// 			});
// 		}

// 		try {
// 			await fetchAPI('/auth/register', {
// 				method: 'POST',
// 				body: JSON.stringify({
// 					username,
// 					email,
// 					password,
// 					displayName: displayName || null
// 				})
// 			});
// 		} catch (error) {
// 			if (isRedirect(error)) throw error;

// 			return fail(409, {
// 				username,
// 				email,
// 				displayName,
// 				error: error instanceof APIError ? error.message : 'Registration failed'
// 			});
// 		}

// 		throw redirect(303, '/login');
// 	}
// };
