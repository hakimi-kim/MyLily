import { postAPI } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const file = formData.get('file');
		const caption = formData.get('caption');

		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { error: 'Please choose an image or video.' });
		}

		// Auto-detect the content index directly on the server layer safely
		const isVideo = file.type.startsWith('video/');
		const isImage = file.type.startsWith('image/');

		if (!isImage && !isVideo) {
			return fail(400, { error: 'Invalid file format. Only images and videos are allowed.' });
		}

		const uploadData = new FormData();
		uploadData.append('File', file);
		uploadData.append('MediaType', isVideo ? '1' : '0');
		if (caption) uploadData.append('Caption', String(caption));

		try {
			await postAPI.create(token, uploadData);
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : 'Failed to create post' });
		}

		throw redirect(303, '/');
	}
};
