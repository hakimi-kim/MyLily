// src/routes/garden/+page.server.ts
import { sql } from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Fetch shared memories sorted newest first from Neon
		const memories = await sql`
      SELECT id, title, description, date, hue, created_at as "createdAt" 
      FROM memories 
      ORDER BY created_at DESC
    `;
		return { memories };
	} catch (error) {
		console.error('Failed to load shared memory garden:', error);
		return { memories: [] };
	}
};

export const actions: Actions = {
	plant: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || '';
		const date = formData.get('date')?.toString() || new Date().toISOString().slice(0, 10);

		if (!title) {
			return fail(400, { error: 'A title is required to plant a memory.' });
		}

		// Generate random layout metrics natively on the server before database write
		const id = crypto.randomUUID();
		const hue = 320 + Math.floor(Math.random() * 60) - 30;

		try {
			await sql`
        INSERT INTO memories (id, title, description, date, hue) 
        VALUES (${id}, ${title}, ${description}, ${date}, ${hue})
      `;
			return { success: true, plantedId: id };
		} catch (error) {
			console.error('Neon insert failed:', error);
			return fail(500, { error: 'Database rejected the seed.' });
		}
	},

	edit: async ({ request }) => {
        const data = await request.formData();
        const id = data.get('id');
        const title = data.get('title');
        const description = data.get('description');
        const date = data.get('date');

        // Update the database where the ID matches
        await sql`
            UPDATE memories 
            SET title = ${title}, description = ${description}, date = ${date}
            WHERE id = ${id}
        `;

        return { success: true };
    },

	remove: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) return fail(400, { error: 'Missing memory ID' });

		try {
			await sql`DELETE FROM memories WHERE id = ${id}`;
			return { success: true };
		} catch (error) {
			console.error('Neon delete failed:', error);
			return fail(500, { error: 'Could not remove memory from database.' });
		}
	}
};
