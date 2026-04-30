import { authAxios } from '../axiosInstance';

export interface PaginatedResponse<T> {
	count: number;
	next?: string | null;
	previous?: string | null;
	results: T[];
}

interface AdminTemplateResponse {
	id: number;
	name: string;
	description?: string;
	html_content?: string;
	css_content?: string;
	configuration?: Record<string, unknown>;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface Template {
	id: number;
	template_name: string;
	orientation: 'Landscape' | 'Portrait';
	resolution_width: number;
	resolution_height: number;
	thumbnail?: string | null;
	file_type?: string;
	is_favourite?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateTemplatePayload {
	template_name: string;
	orientation: 'Landscape' | 'Portrait';
	resolution_width: number;
	resolution_height: number;
	file_type?: string;
}

const unwrap = <T>(request: Promise<{ data: T }>) => request.then((r) => r.data);

const mapAdminTemplateToTemplate = (item: AdminTemplateResponse): Template => {
	const layout = String((item.configuration as { layout?: unknown } | undefined)?.layout ?? '')
		.toLowerCase()
		.trim();
	const isPortrait = layout === 'vertical' || layout === 'portrait';
	return {
		id: item.id,
		template_name: item.name,
		orientation: isPortrait ? 'Portrait' : 'Landscape',
		resolution_width: isPortrait ? 1080 : 1920,
		resolution_height: isPortrait ? 1920 : 1080,
		is_favourite: false,
		created_at: item.created_at,
		updated_at: item.updated_at,
	};
};

export const templatesApi = {
	list: (params?: {
		search?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
		ordering?: string;
	}) =>
		unwrap<PaginatedResponse<AdminTemplateResponse>>(authAxios.get('admin/templates/', { params })).then(
			(res) => ({
				...res,
				results: (res.results ?? []).map(mapAdminTemplateToTemplate),
			}),
		),

	get: (id: number) => unwrap<Template>(authAxios.get(`api/signage/templates/${id}`)),

	create: (payload: CreateTemplatePayload) =>
		unwrap<Template>(authAxios.post('api/signage/templates', { file_type: 'template', ...payload })),

	delete: (id: number) => authAxios.delete(`api/signage/templates/${id}`),

	favourite: (id: number, is_favourite: boolean) =>
		unwrap<Template>(authAxios.patch(`api/signage/templates/${id}`, { is_favourite })),
};
