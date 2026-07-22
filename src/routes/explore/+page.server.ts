import { friendAPI, APIError } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	const q = url.searchParams.get('q') ?? '';

	try {
		const friends = await friendAPI.getAll(token);
		const results = q.trim() ? await friendAPI.search(token, q.trim()) : [];
		return { friends, results, query: q, success: true };
	} catch (error) {
		if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		return {
			friends: [],
			results: [],
			query: q,
			success: false,
			error: error instanceof Error ? error.message : 'Failed to load'
		};
	}
};

export const actions: Actions = {
	connect: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const addresseeId = Number(data.get('addresseeId'));

		try {
			await friendAPI.createRequest(token, addresseeId);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Failed to send request'
			});
		}
	}
};
