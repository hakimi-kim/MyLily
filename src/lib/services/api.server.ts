import { API_BASE_URL } from '$env/static/private';

import type {
	CommentDto,
	CreateLetterDto,
	CreateLilyDto,
	FeedDto,
	FeedResponse,
	FriendResponse,
	GardenVisitResponse,
	LetterDto,
	LikeDto,
	LilyDto,
	LilyProgressUpdateDto,
	LoginRequest,
	LoginResponse,
	PendingResponse,
	PublicLilyDto,
	RegisterRequest,
	RegisterResponse,
	RequestResponse,
	RespondRequest,
	RespondResponse,
	UpdateLetterDto,
	UserSearchResultDto,
	UserSummaryDto
} from '$lib/types';

const API_BASE = API_BASE_URL;

export class APIError extends Error {
	constructor(
		public status: number,
		message: string,
		public data?: unknown
	) {
		super(message);
		this.name = 'APIError';
	}
}

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const isFormData = options.body instanceof FormData;

	const fetchOptions: RequestInit = {
		...options,
		headers: {
			...(isFormData ? {} : { 'Content-Type': 'application/json' }),
			...options.headers
		},
		credentials: options.credentials || 'include'
	};

	const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);

	if (!response.ok) {
		let errorMessage = `HTTP error ${response.status}`;
		let errorData;

		try {
			const text = await response.text();
			try {
				errorData = JSON.parse(text);
				errorMessage = errorData.message || errorData.error || errorData.title || errorMessage;
			} catch {
				errorMessage = text || errorMessage;
			}
		} catch (e) {
			console.error('Failed to read error response body:', e);
		}

		throw new APIError(response.status, errorMessage, errorData);
	}

	if (response.status === 204 || response.headers.get('content-length') === '0') {
		return null as T;
	}

	return response.json() as Promise<T>;
}

// ==========================================
// API Modules
// ==========================================

export const authAPI = {
	login: async (credentials: LoginRequest) => {
		return fetchAPI<LoginResponse>('/Auth/login', {
			method: 'POST',
			body: JSON.stringify(credentials)
		});
	},

	register: async (data: RegisterRequest) => {
		return fetchAPI<RegisterResponse>('/Auth/register', {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
};

export const userAPI = {
	getMe: async (token: string) => {
		return fetchAPI<{
			id: number;
			username: string;
			displayName?: string;
			profilePictureUrl?: string | null;
			showWishesToVisitors: boolean;
			lastNotificationsViewedAt?: string | null;
		}>('/Users/me', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	updateProfilePicture: async (token: string, formData: FormData) => {
		return fetchAPI<UserSummaryDto>('/Users/me/profile-picture', {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` },
			body: formData
		});
	},

	updateDisplayName: async (token: string, displayName: string) => {
		return fetchAPI('/Users/me/display-name', {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({ displayName })
		});
	},

	updateWishVisibility: async (token: string, visible: boolean) => {
		return fetchAPI(`/Users/me/wish-visibility?visible=${visible}`, {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	markNotificationsViewed: async (token: string) => {
		return fetchAPI<null>('/Users/me/notifications-viewed', {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};

export const friendAPI = {
	getAll: async (token: string) => {
		return fetchAPI<FriendResponse[]>('/Friends', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	getAllPending: async (token: string) => {
		return fetchAPI<PendingResponse[]>('/Friends/pending', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	createRequest: async (token: string, addresseeId: number) => {
		return fetchAPI<RequestResponse>(`/Friends/request/${addresseeId}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	createResponse: async (token: string, requestId: number, isAccept: boolean) => {
		return fetchAPI<RespondResponse>(`/Friends/respond/${requestId}?accept=${isAccept}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	removeFriend: async (token: string, friendId: number) => {
		return fetchAPI<null>(`/Friends/${friendId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	search: async (token: string, query: string) => {
		return fetchAPI<UserSearchResultDto[]>(`/Friends/search?q=${encodeURIComponent(query)}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};

export const gardenAPI = {
	getAllVisit: async (token: string) => {
		return fetchAPI<GardenVisitResponse[]>('/GardenVisits/mine', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	createVisit: async (token: string, gardenOwnerId: number) => {
		return fetchAPI<null>(`/GardenVisits/${gardenOwnerId}/visit`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};

export const lilyAPI = {
	create: async (token: string, dto: CreateLilyDto) => {
		return fetchAPI<LilyDto>('/Lilies', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(dto)
		});
	},

	getGarden: async (token: string) => {
		return fetchAPI<LilyDto[]>('/Lilies', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	getNeedingConfirmation: async (token: string) => {
		return fetchAPI<LilyDto[]>('/Lilies/needs-confirmation', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	confirm: async (token: string, lilyId: number, fulfilled: boolean, newTargetDate?: string) => {
		const params = new URLSearchParams({ fulfilled: String(fulfilled) });
		if (newTargetDate) params.set('newTargetDate', newTargetDate);

		return fetchAPI<LilyDto>(`/Lilies/${lilyId}/confirm?${params.toString()}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	addProgress: async (token: string, lilyId: number, note: string) => {
		return fetchAPI<LilyProgressUpdateDto>(`/Lilies/${lilyId}/progress`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(note)
		});
	},

	getTimeline: async (token: string, lilyId: number) => {
		return fetchAPI<LilyProgressUpdateDto[]>(`/Lilies/${lilyId}/timeline`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	getFriendGarden: async (token: string, ownerId: number) => {
		return fetchAPI<PublicLilyDto[]>(`/Lilies/garden/${ownerId}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	setVisibility: async (token: string, lilyId: number, visible: boolean) => {
		return fetchAPI<LilyDto>(`/Lilies/${lilyId}/visibility?visible=${visible}`, {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};

export const feedAPI = {
	getAll: async (token: string, cursor?: string, pageSize = 10) => {
		const params = new URLSearchParams({ pageSize: String(pageSize) });
		if (cursor) params.set('cursor', cursor);

		return fetchAPI<FeedResponse>(`/posts/feed?${params.toString()}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};

export const postAPI = {
	getMine: async (token: string) => {
		return fetchAPI<FeedDto[]>('/Posts/mine', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	create: async (token: string, formData: FormData) => {
		return fetchAPI<FeedDto>('/Posts', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formData
		});
	},

	delete: async (token: string, postId: number) => {
		return fetchAPI<null>(`/Posts/${postId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	
	getLikes: async (token: string, postId: number) => {
		return fetchAPI<LikeDto[]>(`/Posts/${postId}/likes`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	like: async (token: string, postId: number) => {
		return fetchAPI<null>(`/Posts/${postId}/like`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	unlike: async (token: string, postId: number) => {
		return fetchAPI<null>(`/Posts/${postId}/like`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	addComment: async (token: string, postId: number, content: string) => {
		return fetchAPI<CommentDto>(`/Posts/${postId}/comments`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(content)
		});
	},

	getComments: async (token: string, postId: number) => {
		return fetchAPI<CommentDto[]>(`/Posts/${postId}/comments`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	deleteComment: async (token: string, commentId: number) => {
		return fetchAPI<null>(`/Posts/comments/${commentId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		});
	},

};

export const letterAPI = {
	getAll: async (token: string) => {
		return fetchAPI<LetterDto[]>('/Letters', {
			headers: { Authorization: `Bearer ${token}` }
		});
	},

	create: async (token: string, dto: CreateLetterDto) => {
		return fetchAPI<LetterDto>('/Letters', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(dto)
		});
	},

	update: async (token: string, id: number, dto: UpdateLetterDto) => {
		return fetchAPI<LetterDto>(`/Letters/${id}`, {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(dto)
		});
	},

	delete: async (token: string, id: number) => {
		return fetchAPI<null>(`/Letters/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` }
		});
	}
};