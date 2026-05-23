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
	thumbnail?: string | null;
	is_active?: boolean;
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
