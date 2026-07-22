import { getNotificationItems } from '$lib/server/notifications';
import { userAPI } from '$lib/services/api.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, depends }) => {
	depends('app:notifications');

	const token = cookies.get('token');
	if (!token) return { hasNotifications: false };

	try {
		const [items, me] = await Promise.all([getNotificationItems(token), userAPI.getMe(token)]);

		const lastViewed = me.lastNotificationsViewedAt
			? new Date(me.lastNotificationsViewedAt).getTime()
			: 0;

		const hasNotifications = items.some((item) => new Date(item.createdAt).getTime() > lastViewed);

		return { hasNotifications };
	} catch {
		return { hasNotifications: false };
	}
};
