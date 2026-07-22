import { APIError, feedAPI, friendAPI, postAPI, userAPI } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url }) => {
  const token = cookies.get('token');
  if (!token) {
    throw redirect(303, '/login');
  }

  const cursor = url.searchParams.get('cursor') ?? undefined;

  try {

		const [feedResult, friendResult, meResult] = await Promise.all([
			feedAPI.getAll(token, cursor),
			friendAPI.getAll(token),
			userAPI.getMe(token),
		])

    return {
			me: meResult,
      feeds: feedResult.posts,
      nextCursor: feedResult.nextCursor,
      hasMore: feedResult.hasMore,
      friends: friendResult,
      success: true
    };
  } catch (error) {
    if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
      cookies.delete('token', { path: '/' });
      throw redirect(303, '/login');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      feeds: [],
      nextCursor: null,
      hasMore: false,
      friends: [],
      success: false,
      error: errorMessage
    };
  }
};

export const actions: Actions = {
	like: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const postId = Number(data.get('postId'));

		try {
			await postAPI.like(token, postId);
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to like post';
			return fail(500, { error: message });
		}
	},

	unlike: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const postId = Number(data.get('postId'));

		try {
			await postAPI.unlike(token, postId);
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to unlike post';
			return fail(500, { error: message });
		}
	},

	addComment: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const postId = Number(data.get('postId'));
		const content = data.get('content') as string;

		if (!postId || !content || content.trim() === '') {
			return fail(400, { error: 'Invalid post or comment content' });
		}

		try {
			await postAPI.addComment(token, postId, content);
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to unlike post';
			return fail(500, { error: message });
		}
	},

	deleteComment: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const form = await request.formData();
		const commentId = Number(form.get('commentId'));

		try {
			await postAPI.deleteComment(token, commentId);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not delete this comment.'
			});
		}
	}
};

