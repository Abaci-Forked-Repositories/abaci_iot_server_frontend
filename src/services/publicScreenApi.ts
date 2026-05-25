import { publicAxios } from '../axiosInstance';

export interface PublicScreenInfo {
	id: number;
	uuid: string;
	name: string;
	location?: string;
	description?: string;
	ip_address?: string | null;
	ip_bind?: boolean;
	enable_audio?: boolean;
	is_active?: boolean;
	is_online?: boolean;
	last_heartbeat?: string | null;
}

export interface PublicScreenTemplate {
	id: number;
	uuid?: string;
	name: string;
	description?: string;
	html_content?: string;
	/** Zone queue assignments (queue_uuids per zone) when provided by the public screen API. */
	configuration?: Record<string, unknown> | string | null;
	thumbnail?: string | null;
	is_active?: boolean;
	/** Display duration in minutes before rotating to the next assigned template. */
	interval: number;
	order: number;
	screen_template_id: number;
}

export interface PublicScreenResponse {
	screen: PublicScreenInfo;
	templates: PublicScreenTemplate[];
	template_count: number;
}

export interface PublicQueueToken {
	id: number;
	token_number: number;
	token_display: string;
	status: string;
	created_at: string;
}

export interface PublicQueueStatus {
	uuid: string;
	id: number;
	name: string;
	status: string;
	is_active: boolean;
	current_token: PublicQueueToken | null;
	schedule_id: number | null;
	/** Flat fields returned by POST /api/public/queue-status/ */
	queue_name?: string;
	serving_point_name?: string;
	token_display?: string;
	token_status?: string;
}

export interface PublicQueueZoneDisplay {
	queueName: string;
	servingPointName: string;
	tokenDisplay: string;
	tokenStatus: string;
}

/** Map legacy nested and flat public queue-status payloads into one shape. */
export function normalizePublicQueueStatus(
	raw: PublicQueueStatus | Record<string, unknown>,
): PublicQueueStatus {
	const r = raw as Record<string, unknown>;
	const nestedToken =
		r.current_token && typeof r.current_token === 'object'
			? (r.current_token as PublicQueueToken)
			: null;

	const queueName = String(r.queue_name ?? r.name ?? '').trim();
	const tokenDisplay = String(
		r.token_display ?? nestedToken?.token_display ?? '',
	).trim();
	const tokenStatus = String(
		r.token_status ?? r.status ?? nestedToken?.status ?? '',
	).trim();
	const servingPointName =
		typeof r.serving_point_name === 'string' ? r.serving_point_name.trim() : '';

	let current_token: PublicQueueToken | null = nestedToken;
	if (!current_token && (tokenDisplay || r.token_number != null)) {
		current_token = {
			id: 0,
			token_number: Number(r.token_number) || 0,
			token_display: tokenDisplay,
			status: tokenStatus,
			created_at: '',
		};
	}

	return {
		uuid: String(r.uuid ?? ''),
		id: Number(r.id) || 0,
		name: queueName,
		status: tokenStatus || 'inactive',
		is_active: r.is_active !== false,
		current_token,
		schedule_id: r.schedule_id != null ? Number(r.schedule_id) : null,
		queue_name: queueName || undefined,
		serving_point_name: servingPointName || undefined,
		token_display: tokenDisplay || undefined,
		token_status: tokenStatus || undefined,
	};
}

export function buildQueuesByUuidMap(
	queues: (PublicQueueStatus | Record<string, unknown>)[],
): Record<string, PublicQueueStatus> {
	const map: Record<string, PublicQueueStatus> = {};
	for (const item of queues) {
		const queue = normalizePublicQueueStatus(item);
		const key = queue.uuid || (queue.name ? `name:${queue.name}` : '');
		if (key) map[key] = queue;
	}
	return map;
}

export function getPublicQueueZoneDisplay(
	queue: PublicQueueStatus | null,
	fallbacks: { queueName?: string } = {},
): PublicQueueZoneDisplay {
	const queueName =
		queue?.queue_name?.trim() ||
		queue?.name?.trim() ||
		fallbacks.queueName?.trim() ||
		'Queue';
	const servingPointName = queue?.serving_point_name?.trim() || '—';
	const tokenDisplay =
		queue?.token_display?.trim() ||
		queue?.current_token?.token_display?.trim() ||
		'—';
	const tokenStatus =
		queue?.token_status?.trim() ||
		queue?.status?.trim() ||
		queue?.current_token?.status?.trim() ||
		'inactive';

	return { queueName, servingPointName, tokenDisplay, tokenStatus };
}

export interface PublicQueueStatusResponse {
	count: number;
	queues: PublicQueueStatus[];
}

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

export const publicScreenApi = {
	getScreen: (screenUuid: string) =>
		unwrap<PublicScreenResponse>(
			publicAxios.post('api/public/screen/', { screen_uuid: screenUuid }),
		),
	getQueueStatus: (queueUuids: string[]) =>
		unwrap<PublicQueueStatusResponse>(
			publicAxios.post('api/public/queue-status/', { queue_uuids: queueUuids }),
		),
};
