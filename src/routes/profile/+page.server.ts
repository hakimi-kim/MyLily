import { userAPI, postAPI, friendAPI, lilyAPI, APIError } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) {
		throw redirect(303, '/login');
	}

	try {
		const [me, posts, friends, lilies] = await Promise.all([
			userAPI.getMe(token),
			postAPI.getMine(token),
			friendAPI.getAll(token),
			lilyAPI.getGarden(token)
		]);

		const bloomedCount = lilies.filter((l) => l.stage === 4).length; // 4 = Bloom

		return {
			me,
			posts,
			mutualCount: friends.length,
			bloomedCount,
			success: true
		};
	} catch (error) {
		if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		return {
			me: null,
			posts: [],
			mutualCount: 0,
			bloomedCount: 0,
			success: false,
			error: error instanceof Error ? error.message : 'Failed to load profile'
		};
	}
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('token', { path: '/' });
		throw redirect(303, '/login');
	},

	updateAvatar: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const file = formData.get('file');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Please choose an image.' });
		}

		const uploadData = new FormData();
		uploadData.append('file', file);

		try {
			await userAPI.updateProfilePicture(token, uploadData);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Failed to update your picture.'
			});
		}
	}
};