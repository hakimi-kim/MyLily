import { json } from '@sveltejs/kit';
import { postAPI } from '$lib/services/api.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const token = cookies.get('token');
	if (!token) return json({ error: 'Unauthorized' }, { status: 401 });

	const postId = Number(params.postId);
	if (!postId) return json({ error: 'Missing postId' }, { status: 400 });

	try {
		const comments = await postAPI.getComments(token, postId);
		return json(comments);
	} catch (error) {
		return json({ error: 'Failed to fetch comments' }, { status: 500 });
	}
};
