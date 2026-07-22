import { lilyAPI, gardenAPI, APIError } from '$lib/services/api.server';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	const ownerId = Number(params.id);

	try {
		// Records/updates the visit timestamp — a no-op server-side if this is your own garden.
		await gardenAPI.createVisit(token, ownerId);

		const lilies = await lilyAPI.getFriendGarden(token, ownerId);
		return { lilies, ownerId };
	} catch (e) {
		if (e instanceof APIError && e.status === 403) {
			throw error(403, "You can only view a mutual friend's garden.");
		}
		if (e instanceof APIError && e.status === 401) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		throw error(500, 'Failed to load this garden.');
	}
};
