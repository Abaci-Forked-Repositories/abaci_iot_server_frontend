import { authAxios, authAxiosFileUpload } from '../axiosInstance';
import type { ScreenTemplateAssignment } from './screenTemplatesApi';

export interface PaginatedResponse<T> {
	count: number;
	next?: string | null;
	previous?: string | null;
	results: T[];
}

export interface ScreenTemplate {
	id: number;
	name: string;
}

export interface ScreenQueueRef {
	id: number;
	name: string;
}

export interface CreateScreenPayload {
	name: string;
	location?: string;
	description?: string;
	ip_address?: string | null;
	ip_bind?: boolean;
	is_active: boolean;
}

export interface Screen {
	id: number;
	uuid?: string;
	name: string;
	location?: string;
	description?: string;
	ip_address?: string | null;
	ip_bind?: boolean;
	template?: ScreenTemplate | null;
	screen_templates?: ScreenTemplateAssignment[];
	queues?: ScreenQueueRef[];
	enable_audio?: boolean;
	is_active?: boolean;
	is_online?: boolean;
	background_image?: string | null;
	last_heartbeat?: string | null;
	created_at?: string;
	updated_at?: string;
}

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((response) => response.data);

/** Build multipart body for POST `api/screens/` (includes optional `background_image` file). */
export function buildCreateScreenFormData(payload: CreateScreenPayload, backgroundImage?: File | null) {
	const formData = new FormData();
	formData.append('name', payload.name);
	formData.append('location', payload.location ?? '');
	formData.append('description', payload.description ?? '');
	if (payload.ip_address) {
		formData.append('ip_address', payload.ip_address);
	}
	formData.append('ip_bind', String(Boolean(payload.ip_bind)));
	formData.append('is_active', String(Boolean(payload.is_active)));
	if (backgroundImage) {
		formData.append('background_image', backgroundImage);
	}
	return formData;
}

export const screensApi = {
	create: (payload: CreateScreenPayload, backgroundImage?: File | null) =>
		unwrap<Screen>(
			authAxiosFileUpload.post(
				'api/screens/',
				buildCreateScreenFormData(payload, backgroundImage),
			),
		),
	list: (params?: {
		location?: string;
		search?: string;
		is_active?: boolean;
		is_online?: boolean;
		page?: number;
		page_size?: number;
		ordering?: string;
	}) => unwrap<PaginatedResponse<Screen>>(authAxios.get('api/screens/', { params })),
	get: (id: number) => unwrap<Screen>(authAxios.get(`api/screens/${id}/`)),
	remove: (id: number) => authAxios.delete(`api/screens/${id}/`),
	heartbeat: (id: number) => unwrap<Screen>(authAxios.post(`api/screens/${id}/heartbeat/`)),
	activate: (id: number) => unwrap<Screen>(authAxios.post(`api/screens/${id}/activate/`)),
	deactivate: (id: number) => unwrap<Screen>(authAxios.post(`api/screens/${id}/deactivate/`)),
	toggleAudio: (id: number) => unwrap<Screen>(authAxios.post(`api/screens/${id}/toggle-audio/`)),
	onlineScreens: () => unwrap<Screen[]>(authAxios.get('api/screens/online-screens/')),
	byLocation: (location: string) =>
		unwrap<Screen[]>(authAxios.get('api/screens/by-location/', { params: { location } })),
};
