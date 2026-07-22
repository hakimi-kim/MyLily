import { friendAPI, APIError, userAPI, postAPI } from '$lib/services/api.server';
import { getNotificationItems } from '$lib/server/notifications';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	try {
		const [items, friends] = await Promise.all([
			getNotificationItems(token),
			friendAPI.getAll(token)
		]);

		await userAPI.markNotificationsViewed(token);

		return { items, friends, success: true };
	} catch (error) {
		if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		return {
			items: [],
			friends: [],
			success: false,
			error: error instanceof Error ? error.message : 'Failed to load notifications'
		};
	}
};

export const actions: Actions = {
	respond: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const requestId = Number(data.get('requestId'));
		const accept = data.get('accept') === 'true';

		try {
			await friendAPI.createResponse(token, requestId, accept);
			return { success: true };
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : 'Failed to respond' });
		}
	},

	deleteComment: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');
		
		const data = await request.formData();
		const commentId = Number(data.get('commentId'));
		try {
			const success = await postAPI.deleteComment(token, commentId);
			if (!success) return fail(404, { error: 'Comment not found.' });
			return { success: true };
		} catch (error) {
			return fail(403, {
				error: error instanceof Error ? error.message : 'Could not delete this comment.'
			});
		}
	}
};
