import { letterAPI, friendAPI, APIError } from '$lib/services/api.server';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('token');
	if (!token) throw redirect(303, '/login');

	try {
		const [letters, friends] = await Promise.all([
			letterAPI.getAll(token),
			friendAPI.getAll(token)
		]);
		return { letters, friends };
	} catch (error) {
		if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
			cookies.delete('token', { path: '/' });
			throw redirect(303, '/login');
		}
		return {
			letters: [],
			friends: [],
			error: error instanceof Error ? error.message : 'Failed to load journal'
		};
	}
};

export const actions: Actions = {
	plant: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || '';
		const date = formData.get('date')?.toString() || new Date().toISOString().slice(0, 10);
		const recipientRaw = formData.get('recipientId')?.toString();
		const recipientId = recipientRaw && recipientRaw !== '' ? Number(recipientRaw) : null;

		if (!title) {
			return fail(400, { error: 'A title is required to plant a memory.' });
		}

		try {
			const letter = await letterAPI.create(token, {
				title,
				content: description,
				date,
				recipientId
			});
			return { success: true, plantedId: letter.id };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not plant this memory.';
			return fail(400, { error: message });
		}
	},

	edit: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const data = await request.formData();
		const id = Number(data.get('id'));
		const title = data.get('title')?.toString().trim();
		const description = data.get('description')?.toString().trim() || '';
		const date = data.get('date')?.toString();

		if (!id || !title || !date) {
			return fail(400, { error: 'Missing fields.' });
		}

		try {
			await letterAPI.update(token, id, { title, content: description, date });
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not update this memory.';
			return fail(400, { error: message });
		}
	},

	remove: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token) throw redirect(303, '/login');

		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) return fail(400, { error: 'Missing memory ID' });

		try {
			await letterAPI.delete(token, id);
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not remove this memory.';
			return fail(400, { error: message });
		}
	}
};
