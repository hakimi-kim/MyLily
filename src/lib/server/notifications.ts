// src/lib/server/notifications.ts
import { friendAPI, postAPI, lilyAPI } from '$lib/services/api.server';

export type NotificationItem = {
	type: 'friend_request' | 'like' | 'comment' | 'lily_confirmation' | 'lily_bloomed';
	id: string;
	actor?: { id: number; username: string; displayName?: string };
	createdAt: string;
	requestId?: number;
	postId?: number;
	postCaption?: string;
	commentContent?: string;
	lilyId?: number;
	wishText?: string;
};

const LILY_STAGE_BLOOM = 4;
const REFLECTIVE = 1;

export async function getNotificationItems(token: string): Promise<NotificationItem[]> {
	const [pending, myPosts, needingConfirmation, myLilies] = await Promise.all([
		friendAPI.getAllPending(token),
		postAPI.getMine(token),
		lilyAPI.getNeedingConfirmation(token),
		lilyAPI.getGarden(token)
	]);

	const items: NotificationItem[] = [];

	for (const req of pending) {
		if (!req.requester || !req.id || !req.createdAt) continue;
		items.push({
			type: 'friend_request',
			id: `fr-${req.id}`,
			actor: req.requester,
			createdAt: req.createdAt,
			requestId: req.id
		});
	}

	for (const lily of needingConfirmation) {
		items.push({
			type: 'lily_confirmation',
			id: `lily-${lily.id}`,
			createdAt: lily.targetDate ?? new Date().toISOString(),
			lilyId: lily.id,
			wishText: lily.wishText
		});
	}

	for (const lily of myLilies) {
		if (lily.stage !== LILY_STAGE_BLOOM) continue;

		// GoalOriented lilies record a real FulfilledAt timestamp once confirmed.
		// Reflective lilies bloom automatically with no stored moment, so the
		// fixed 5-day schedule is used to derive when it actually happened.
		const bloomedAt =
			lily.type === REFLECTIVE
				? new Date(new Date(lily.plantedAt).getTime() + 5 * 86400000).toISOString()
				: (lily.fulfilledAt ?? lily.targetDate ?? lily.plantedAt);

		items.push({
			type: 'lily_bloomed',
			id: `bloom-${lily.id}`,
			createdAt: bloomedAt,
			lilyId: lily.id,
			wishText: lily.wishText
		});
	}

	// N+1 by design at this scale — see the note in the notifications page
	// about why a real production version would persist events instead.
	for (const post of myPosts) {
		if (!post.id) continue;

		const [likes, comments] = await Promise.all([
			postAPI.getLikes(token, post.id),
			postAPI.getComments(token, post.id)
		]);

		for (const like of likes) {
			if (like.user.id === post.author?.id) continue;
			items.push({
				type: 'like',
				id: `like-${post.id}-${like.user.id}`,
				actor: like.user,
				createdAt: like.createdAt,
				postId: post.id,
				postCaption: post.caption
			});
		}

		for (const comment of comments) {
			if (comment.author.id === post.author?.id) continue;
			items.push({
				type: 'comment',
				id: `comment-${comment.id}`,
				actor: comment.author,
				createdAt: comment.createdAt,
				postId: post.id,
				postCaption: post.caption,
				commentContent: comment.content
			});
		}
	}

	items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	return items;
}
