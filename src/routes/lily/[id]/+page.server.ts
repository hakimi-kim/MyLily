import type { PageServerLoad, Actions } from './$types';
import { lilyAPI } from '$lib/services/api.server';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	const id = Number(params.id);

	try {
		// The backend has no single-lily GET endpoint yet — fetching the whole
		// garden and finding by id is a stopgap, not the final shape. Worth
		// adding a dedicated GET /lilies/{id} later to avoid the extra payload.
		const [allLilies, timeline] = await Promise.all([
			lilyAPI.getGarden(token),
			lilyAPI.getTimeline(token, id)
		]);

		const lily = allLilies.find((l) => l.id === id);
		if (!lily) throw error(404, 'Lily not found');

		return { lily, timeline };
	} catch (e) {
		throw error(500, 'Failed to load lily details');
	}
};

export const actions: Actions = {
	addProgress: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const form = await request.formData();
		const lilyId = Number(form.get('lilyId'));
		const note = form.get('note')?.toString().trim();

		if (!lilyId || !note) return fail(400, { error: 'A note is required.' });

		try {
			await lilyAPI.addProgress(token, lilyId, note);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not add this entry.'
			});
		}
	},

	confirmFulfilled: async ({ params, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		try {
			await lilyAPI.confirm(token, Number(params.id), true);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not confirm this wish.'
			});
		}
	},

	extend: async ({ request, params, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const form = await request.formData();
		const newTargetDate = form.get('newTargetDate')?.toString();

		if (!newTargetDate) {
			return fail(400, { error: 'Choose a new date to give this wish more time.' });
		}

		try {
			await lilyAPI.confirm(token, Number(params.id), false, newTargetDate);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not extend this wish.'
			});
		}
	}
};
