import { authAxios } from '../axiosInstance';

export interface PaginatedResponse<T> {
	count: number;
	next?: string | null;
	previous?: string | null;
	results: T[];
}

export interface User {
	id: number;
	username: string;
	email: string;
	first_name?: string;
	last_name?: string;
	is_staff?: boolean;
	is_superuser?: boolean;
	date_joined?: string;
	last_login?: string | null;
}

export interface UserRole {
	id: number;
	name: string;
	description?: string;
}

export interface QueueUser {
	id: number;
	user: number;
	role: number;
	is_active: boolean;
	created_at?: string;
}

export interface QueueGroup {
	id: number;
	name: string;
	description?: string;
	is_active?: boolean;
	created_at?: string;
}

export interface ServingPoint {
	id: number;
	name: string;
	/** Single id from older responses, or list when the API links a point to multiple queues. */
	queue: number | number[];
	description?: string;
	status?: string;
	is_available?: boolean;
	is_active?: boolean;
	created_at?: string;
	/** Present when the API includes staff assignments (ids or nested user refs). */
	assigned_users?: number[] | Array<{ id: number }>;
}

export interface Queue {
	id: number;
	name: string;
	description?: string;
	group?: number;
	group_name?: string;
	limit?: number;
	grace_period_minutes?: number;
	allow_postpone?: boolean;
	is_reporting_enabled?: boolean;
	is_active?: boolean;
	serving_points?: ServingPoint[];
	created_at?: string;
	updated_at?: string;
}

/** GET /api/queues/{id}/statistics/ */
export interface QueueStatistics {
	queue_id: number;
	queue_name: string;
	total_tokens: number;
	today_tokens?: number;
	completed: number;
	cancelled: number;
	/** Tokens that have checked in (replaces legacy `waiting`). */
	reported: number;
	serving: number;
	current_count?: number;
	/** Optional legacy or extended stats */
	no_show?: number;
	avg_wait_time?: string;
	avg_service_time?: string;
	current_serving?: Array<{
		token_number: string;
		customer_name: string;
		wait_time?: string;
	}>;
}

export type TokenStatus =
	| 'registred'
	| 'reported'
	| 'serving'
	| 'completed'
	| 'cancelled'
	| 'postponed'
	| 'no_show';

export interface TokenUser {
	id?: number;
	name: string;
	email?: string;
	phone?: string;
	age?: number | string;
	place?: string;
	remarks?: string;
	created_at?: string;
	updated_at?: string;
}

/** GET /api/queues/{id}/currently_serving/ — rows for “currently serving” UI (shape may vary; map in the component). */
export interface CurrentlyServingEntry {
	id?: number;
	token_number?: string | number;
	token_display?: string;
	token?: string | number;
	customer_name?: string;
	customer?: string;
	token_user?: TokenUser;
	queue_name?: string;
	schedule?: number;
	status?: string;
	created_at?: string;
	started_serving_at?: string | null;
	completed_at?: string | null;
	cancelled_at?: string | null;
	parent_token?: string | number | null;
	notes?: string | null;
	wait_time?: string | null;
	wait?: string | null;
	service_time?: string | null;
	is_priority_queued?: boolean;
	counter?: string;
	serving_point_name?: string;
	counter_name?: string;
	serving_point?: string | { name?: string };
}

export interface TokenQueueRef {
	id: number;
	name: string;
}

export interface Token {
	id: number;
	token_number: string;
	token_user?: TokenUser;
	queue: number | TokenQueueRef;
	/** Schedule id this token belongs to */
	schedule?: number | null;
	queue_name?: string;
	status: TokenStatus;
	priority?: number;
	is_vip?: boolean;
	created_at?: string;
	started_serving_at?: string | null;
	completed_at?: string | null;
	cancelled_at?: string | null;
	notes?: string;
	wait_time?: string;
	service_time?: string | null;
}

export interface QueueStatus {
	queue_id: number | string;
	/** Checked-in tokens (replaces legacy `waiting`). */
	reported: number;
	serving: number;
	completed_today: number;
	total: number;
}

/** POST /api/tokens/create-token/ — flat body per backend */
export interface CreateTokenPayload {
	schedule_id: number;
	name: string;
	email?: string;
	phone?: string;
	age?: number;
	place?: string;
	remarks?: string;
	priority?: number;
	is_vip?: boolean;
}

/** Nested `token_user` body for PATCH — mirrors GET token response shape. */
export interface PatchTokenUserPayload {
	id?: number;
	name?: string;
	email?: string;
	phone?: string;
	age?: number | null;
	place?: string;
	remarks?: string;
}

/** PATCH /api/tokens/{id}/ — send customer fields under `token_user` like the list/detail response. */
export interface PatchTokenPayload {
	token_user?: PatchTokenUserPayload;
	notes?: string | null;
	priority?: number;
	is_vip?: boolean;
}

export interface CreateQueuePayload {
	name: string;
	description?: string;
	limit?: number;
	grace_period_minutes?: number;
	allow_postpone?: boolean;
	is_reporting_enabled?: boolean;
	serving_points?: number[];
}

export interface UpdateQueuePayload {
	name?: string;
	description?: string;
	limit?: number;
	grace_period_minutes?: number;
	allow_postpone?: boolean;
	is_reporting_enabled?: boolean;
	serving_points?: number[];
}

export interface CreateServingPointPayload {
	name: string;
	queue: number[];
	description?: string;
	is_active?: boolean;
	assigned_users?: number[];
}

export interface UpdateServingPointPayload {
	name?: string;
	queue?: number[];
	description?: string;
	status?: string;
	is_available?: boolean;
	is_active?: boolean;
	assigned_users?: number[];
}

export interface CreateUserPayload {
	username: string;
	email: string;
	password: string;
	first_name?: string;
	last_name?: string;
}

export type ScheduleApiStatus = string;

export interface QueueSchedule {
	id: number;
	queue: number;
	queue_name?: string;
	from_datetime: string | null;
	to_datetime: string | null;
	description?: string;
	current_token?: number | null;
	current_token_number?: string | null;
	status: ScheduleApiStatus;
	limit?: number;
	token_from?: number;
	token_to?: number;
	available_serving_points?: number[];
	allow_postpone?: boolean;
	/** From schedule detail API; gates registered → reported in schedule token UI. */
	is_reporting_enabled?: boolean;
	serving_point_windows?: ScheduleServingPoint[];
	created_at?: string;
	updated_at?: string;
}

export interface CreateSchedulePayload {
	queue: number;
	from_datetime: string;
	to_datetime: string;
	description?: string;
	status?: string;
	limit?: number;
	token_from?: number;
	token_to?: number;
}

export interface PatchSchedulePayload {
	from_datetime?: string;
	to_datetime?: string;
	description?: string;
	status?: string;
	limit?: number;
	token_from?: number;
	token_to?: number;
}

export interface ScheduleServingPoint {
	id: number;
	queue_schedule: number;
	queue_schedule_queue_id?: number;
	serving_point: number;
	serving_point_name?: string;
	serving_point_status?: string;
	from_datetime: string;
	to_datetime: string;
	status?: string;
	schedule_status?: string;
	current_token?: number | Token | null;
	current_token_number?: string | null;
	current_token_status?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface CreateScheduleServingPointPayload {
	queue_schedule: number;
	serving_point: number;
	from_datetime: string;
	to_datetime: string;
}

export interface PatchScheduleServingPointPayload {
	from_datetime?: string;
	to_datetime?: string;
	status?: string;
}

/** POST /api/queues/schedule-serving-points/{id}/set_status/ */
export interface SetScheduleServingPointStatusPayload {
	status: string;
}

export interface SetScheduleServingPointsPayload {
	serving_point_ids: number[];
}

export interface QueryParams {
	[key: string]: string | number | boolean | undefined;
	search?: string;
	ordering?: string;
	page?: number;
	page_size?: number;
	/** DRF LimitOffsetPagination — used by `api/tokens/` */
	limit?: number;
	/** DRF LimitOffsetPagination — used by `api/tokens/` */
	offset?: number;
	queue?: number | string;
	queue_id?: number | string;
	schedule?: number | string;
	status?: TokenStatus | string;
	group?: number | string;
	is_available?: boolean | string;
	/** Schedules list: single calendar day `YYYY-MM-DD` if the backend supports it. */
	date?: string;
	/** Schedules list: window overlaps local day — `to_datetime >= dayStart` (ISO 8601). */
	to_datetime__gte?: string;
	/** Schedules list: window overlaps local day — `from_datetime <= dayEnd` (ISO 8601). */
	from_datetime__lte?: string;
}

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

export const usersApi = {
	list: (params?: QueryParams) => unwrap<PaginatedResponse<User>>(authAxios.get('api/users/', { params })),
	get: (id: number) => unwrap<User>(authAxios.get(`api/users/${id}/`)),
	me: () => unwrap<User>(authAxios.get('api/users/me/')),
	create: (payload: CreateUserPayload) => unwrap<User>(authAxios.post('api/users/', payload)),
	setPassword: (id: number, payload: { old_password: string; password: string }) =>
		unwrap<{ detail: string }>(authAxios.post(`api/users/${id}/set-password/`, payload)),
	roles: () => unwrap<PaginatedResponse<UserRole>>(authAxios.get('api/users/roles/')),
	queueUsers: () => unwrap<PaginatedResponse<QueueUser>>(authAxios.get('api/users/queue-users/')),
};

export const queuesApi = {
	list: (params?: QueryParams) =>
		unwrap<PaginatedResponse<Queue>>(authAxios.get('api/queues/', { params })),
	get: (id: number) => unwrap<Queue>(authAxios.get(`api/queues/${id}/`)),
	create: (payload: CreateQueuePayload) => unwrap<Queue>(authAxios.post('api/queues/', payload)),
	update: (id: number, payload: UpdateQueuePayload) =>
		unwrap<Queue>(authAxios.patch(`api/queues/${id}/`, payload)),
	statistics: (id: number) =>
		unwrap<QueueStatistics>(authAxios.get(`api/queues/${id}/statistics/`)),
	/** GET /api/queues/{id}/currently_serving/ */
	currentlyServing: (id: number) =>
		unwrap<CurrentlyServingEntry[] | PaginatedResponse<CurrentlyServingEntry>>(
			authAxios.get(`api/queues/${id}/currently_serving/`),
		),
	activate: (id: number) => unwrap<Queue>(authAxios.post(`api/queues/${id}/activate/`)),
	deactivate: (id: number) => unwrap<Queue>(authAxios.post(`api/queues/${id}/deactivate/`)),
	groups: (params?: QueryParams) =>
		unwrap<PaginatedResponse<QueueGroup>>(authAxios.get('api/queues/groups/', { params })),
	servingPoints: (params?: QueryParams) =>
		unwrap<PaginatedResponse<ServingPoint>>(authAxios.get('api/queues/serving-points/', { params })),
	getServingPoint: (id: number) =>
		unwrap<ServingPoint>(authAxios.get(`api/queues/serving-points/${id}/`)),
	createServingPoint: (payload: CreateServingPointPayload) =>
		unwrap<ServingPoint>(authAxios.post('api/queues/serving-points/', payload)),
	updateServingPoint: (id: number, payload: UpdateServingPointPayload) =>
		unwrap<ServingPoint>(authAxios.patch(`api/queues/serving-points/${id}/`, payload)),
};

export const schedulesApi = {
	list: (params?: QueryParams) =>
		unwrap<PaginatedResponse<QueueSchedule>>(authAxios.get('api/queues/schedules/', { params })),
	get: (id: number) => unwrap<QueueSchedule>(authAxios.get(`api/queues/schedules/${id}/`)),
	create: (payload: CreateSchedulePayload) =>
		unwrap<QueueSchedule>(authAxios.post('api/queues/schedules/', payload)),
	update: (id: number, payload: CreateSchedulePayload) =>
		unwrap<QueueSchedule>(authAxios.put(`api/queues/schedules/${id}/`, payload)),
	patch: (id: number, payload: PatchSchedulePayload) =>
		unwrap<QueueSchedule>(authAxios.patch(`api/queues/schedules/${id}/`, payload)),
	delete: (id: number) => unwrap<void>(authAxios.delete(`api/queues/schedules/${id}/`)),
	refreshCurrentToken: (id: number) =>
		unwrap<QueueSchedule>(authAxios.post(`api/queues/schedules/${id}/refresh-current-token/`)),
	setAvailableServingPoints: (id: number, payload: SetScheduleServingPointsPayload) =>
		unwrap<unknown>(authAxios.post(`api/queues/schedules/${id}/set-available-serving-points/`, payload)),
};

export const scheduleServingPointsApi = {
	list: (params?: QueryParams) =>
		unwrap<PaginatedResponse<ScheduleServingPoint>>(
			authAxios.get('api/queues/schedule-serving-points/', { params }),
		),
	get: (id: number) => unwrap<ScheduleServingPoint>(authAxios.get(`api/queues/schedule-serving-points/${id}/`)),
	create: (payload: CreateScheduleServingPointPayload) =>
		unwrap<ScheduleServingPoint>(authAxios.post('api/queues/schedule-serving-points/', payload)),
	update: (id: number, payload: CreateScheduleServingPointPayload) =>
		unwrap<ScheduleServingPoint>(authAxios.put(`api/queues/schedule-serving-points/${id}/`, payload)),
	patch: (id: number, payload: PatchScheduleServingPointPayload) =>
		unwrap<ScheduleServingPoint>(authAxios.patch(`api/queues/schedule-serving-points/${id}/`, payload)),
	startServing: (id: number) =>
		unwrap<ScheduleServingPoint>(
			authAxios.post(`api/queues/schedule-serving-points/${id}/start-serving/`),
		),
	complete: (id: number) =>
		unwrap<ScheduleServingPoint>(authAxios.post(`api/queues/schedule-serving-points/${id}/complete/`)),
	cancel: (id: number) =>
		unwrap<ScheduleServingPoint>(authAxios.post(`api/queues/schedule-serving-points/${id}/cancel/`)),
	noShow: (id: number) =>
		unwrap<ScheduleServingPoint>(authAxios.post(`api/queues/schedule-serving-points/${id}/no-show/`)),
	postpone: (id: number) =>
		unwrap<ScheduleServingPoint>(authAxios.post(`api/queues/schedule-serving-points/${id}/postpone/`)),
	skipToken: (id: number) =>
		unwrap<ScheduleServingPoint>(authAxios.post(`api/queues/schedule-serving-points/${id}/skip-token/`)),
	setStatus: (id: number, payload: SetScheduleServingPointStatusPayload) =>
		unwrap<ScheduleServingPoint>(
			authAxios.post(`api/queues/schedule-serving-points/${id}/set_status/`, payload),
		),
	delete: (id: number) => unwrap<void>(authAxios.delete(`api/queues/schedule-serving-points/${id}/`)),
};

export interface QueueEvent {
	id: number;
	event_type: string;
	/** Human-readable label from API (e.g. "Schedule Status Change"). */
	event_type_display?: string | null;
	description?: string | null;
	timestamp?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	token?: number | null;
	token_number?: string | null;
	serving_point?: number | null;
	serving_point_name?: string | null;
	schedule?: number | null;
	schedule_name?: string | null;
	queue_name?: string | null;
	user?: number | null;
	user_username?: string | null;
	actor_name?: string | null;
	details?: Record<string, unknown> | null;
	[key: string]: unknown;
}

export const eventsApi = {
	bySchedule: (scheduleId: number) =>
		unwrap<QueueEvent[] | PaginatedResponse<QueueEvent>>(
			authAxios.get('api/queues/events/by-schedule/', { params: { schedule_id: scheduleId } }),
		),
	byServingPoint: (servingPointId: number) =>
		unwrap<QueueEvent[] | PaginatedResponse<QueueEvent>>(
			authAxios.get('api/queues/events/by-serving-point/', { params: { serving_point_id: servingPointId } }),
		),
};

export const tokensApi = {
	list: (params?: QueryParams) =>
		unwrap<PaginatedResponse<Token>>(authAxios.get('api/tokens/', { params })),
	create: (payload: CreateTokenPayload) =>
		unwrap<Token>(authAxios.post('api/tokens/create-token/', payload)),
	patch: (id: number, payload: PatchTokenPayload) =>
		unwrap<Token>(authAxios.patch(`api/tokens/${id}/`, payload)),
	queueStatus: (queueId: number) =>
		unwrap<QueueStatus>(authAxios.get('api/tokens/queue-status/', { params: { queue_id: queueId } })),
	recent: (limit = 10) =>
		unwrap<Token[]>(authAxios.get('api/tokens/recent/', { params: { limit } })),
	today: () => unwrap<Token[]>(authAxios.get('api/tokens/today/')),
	markArrived: (id: number) => unwrap<Token>(authAxios.post(`api/tokens/${id}/mark-arrived/`)),
	startServing: (id: number) => unwrap<Token>(authAxios.post(`api/tokens/${id}/start-serving/`)),
	completeServing: (id: number) =>
		unwrap<Token>(authAxios.post(`api/tokens/${id}/complete-serving/`)),
	cancel: (id: number) => unwrap<Token>(authAxios.post(`api/tokens/${id}/cancel/`)),
	postpone: (id: number) => unwrap<Token>(authAxios.post(`api/tokens/${id}/postpone/`)),
	markNoShow: (id: number) => unwrap<Token>(authAxios.post(`api/tokens/${id}/mark-no-show/`)),
	users: (params?: QueryParams) =>
		unwrap<PaginatedResponse<TokenUser>>(authAxios.get('api/tokens/users/', { params })),
	usersByPhone: (phone: string) =>
		unwrap<TokenUser[]>(authAxios.get('api/tokens/users/by-phone/', { params: { phone } })),
	usersByEmail: (email: string) =>
		unwrap<TokenUser[]>(authAxios.get('api/tokens/users/by-email/', { params: { email } })),
};
