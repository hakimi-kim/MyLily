// src/routes/api/feed/+server.ts

import { feedAPI } from '$lib/services/api.server';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const token = cookies.get('token');
	if (!token) {
		throw error(401, 'Not authenticated');
	}

	const cursor = url.searchParams.get('cursor') ?? undefined;

	try {
		const result = await feedAPI.getAll(token, cursor);
		return json({
			feeds: result.posts,
			nextCursor: result.nextCursor,
			hasMore: result.hasMore
		});
	} catch (e) {
		throw error(500, 'Failed to load feed');
	}
};
