import { lilyAPI, APIError, gardenAPI, userAPI } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './[id]/$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	try {
		const [lilies, visitors, me] = await Promise.all([
			lilyAPI.getGarden(token),
			gardenAPI.getAllVisit(token),
			userAPI.getMe(token)
		]);
		return { lilies, visitors, showWishText: me.showWishesToVisitors };
	} catch (error) {
		if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		return {
			lilies: [],
			error: error instanceof Error ? error.message : 'Failed to load garden'
		};
	}
};

export const actions: Actions = {
	plantWish: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const form = await request.formData();
		const wishText = form.get('wishText')?.toString().trim();
		const category = Number(form.get('category'));
		const type = Number(form.get('type'));
		const targetDateRaw = form.get('targetDate')?.toString();

		if (!wishText) {
			return fail(400, { error: 'A wish needs words.' });
		}

		const targetDate = type === 0 ? targetDateRaw || null : null;
		if (type === 0 && !targetDate) {
			return fail(400, { error: 'Goal-oriented wishes need a target date.' });
		}

		try {
			await lilyAPI.create(token, { wishText, category, type, targetDate });
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not plant this wish.'
			});
		}
	},

	toggleWishVisibility: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');
		
		const form = await request.formData();
		const visible = form.get('visible') === 'true';
		try {
			await userAPI.updateWishVisibility(token, visible);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Could not update visibility.'
			});
		}
	}
};
