export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user?: {
		id: string;
		username: string;
		name?: string;
	};
}

export interface UserSummaryDto {
	id: number;
	username: string;
	displayName?: string;
	profilePictureUrl?: string | null;
}

export interface RegisterRequest {
	username: string;
	password: string;
	displayName?: string | null;
}

export interface RegisterResponse {
	id: number;
	username: string;
	displayName?: string;
}

export interface FeedResponse {
	posts: FeedDto[];
	nextCursor?: string | null;
	hasMore: boolean;
}

export interface FeedDto {
	id?: number;
	author?: UserSummaryDto | null;
	mediaUrl?: string;
	mediaType?: number;
	caption?: string;
	createdAt?: string;
	likeCount?: number;
	commentCount?: number;
	likedByMe?: boolean;
}

export interface FriendResponse {
	id?: number;
	username?: string;
	displayName?: string;
	profilePictureUrl?: string | null;
}

export interface PendingResponse {
	id?: number;
	requester?: UserSummaryDto | null;
	createdAt?: string;
}

export enum ResponseStatus {
	Pending = 0,
	Accepted = 1,
	Declined = 2
}

export interface RequestRequest {
	addresseeId?: number;
}

export interface RequestResponse {
	id?: number;
	requesterId?: number;
	requester?: string | null;
	addresseeId?: number;
	addressee?: string | null;
	status?: ResponseStatus;
	createdAt?: string;
	respondedAt?: string;
}

export interface RespondRequest {
	requestId?: number;
	isAccept?: boolean;
}

export interface RespondResponse {
	id?: number;
	requesterId?: number;
	requester?: string | null;
	addresseeId?: number;
	addressee?: string | null;
	status?: ResponseStatus;
	createdAt?: string;
	respondedAt?: string;
}

export interface GardenVisitResponse {
	visitor?: UserSummaryDto;
	visitedAt?: string;
}

// ***************************************

export interface CommentDto {
	id: number;
	author: UserSummaryDto;
	content: string;
	createdAt: string;
}

export enum LilyCategory {
	Dream,
	Promise,
	Goal,
	Hope,
	PersonalGrowth,
	Memory
}

export enum LilyType {
	GoalOriented,
	Reflective
}

export enum LilyStage {
	Seedling,
	Sprout,
	Bud,
	AwaitingConfirmation,
	Bloom
}

export interface CreateLilyDto {
	wishText: string;
	category: LilyCategory;
	type: LilyType;
	targetDate?: string | null;
}

export interface LilyDto {
	id: number;
	wishText: string;
	category: LilyCategory;
	type: LilyType;
	plantedAt: string;
	targetDate?: string | null;
	stage: LilyStage;
	progressPercentage?: number | null;
	isFulfilled: boolean;
	needsConfirmation: boolean;
	stageProgressPercent?: number | null;
	nextStageAt?: string | null;
	isDescriptionVisible: boolean;
}

export interface PublicLilyDto {
	id: number;
	category: number;
	type: number;
	stage: number;
	stageProgressPercent?: number | null;
	nextStageAt?: string | null;
	isFulfilled: boolean;
	wishText?: string | null;
}

export interface LilyProgressUpdateDto {
	id: number;
	note: string;
	createdAt: string;
}

export interface CreateLetterDto {
	title: string;
	content: string;
	date: string; // yyyy-MM-dd
	recipientId?: number | null;
}

export interface UpdateLetterDto {
	title: string;
	content: string;
	date: string;
}

export interface LetterDto {
	id: number;
	title: string;
	content: string;
	date: string;
	createdAt: string;
	isFromSelf: boolean;
	sender: UserSummaryDto;
}

export interface LikeDto {
	user: UserSummaryDto;
	createdAt: string;
}

export enum RelationshipStatus {
	None = 0,
	PendingSentByMe = 1,
	PendingIncoming = 2,
	Friends = 3
}

export interface UserSearchResultDto {
	id: number;
	username: string;
	displayName?: string;
	status: RelationshipStatus;
	requestId?: number | null;
}