import { authAxios } from '../axiosInstance';

export interface PaginatedResponse<T> {
	count: number;
	next?: string | null;
	previous?: string | null;
	results: T[];
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

export const templatesApi = {
	list: (params?: {
		search?: string;
		file_type?: string;
		limit?: number;
		offset?: number;
		ordering?: string;
	}) =>
		unwrap<PaginatedResponse<Template>>(
			authAxios.get('api/signage/templates', { params: { file_type: 'template', ...params } }),
		),

	get: (id: number) => unwrap<Template>(authAxios.get(`api/signage/templates/${id}`)),

	create: (payload: CreateTemplatePayload) =>
		unwrap<Template>(authAxios.post('api/signage/templates', { file_type: 'template', ...payload })),

	delete: (id: number) => authAxios.delete(`api/signage/templates/${id}`),

	favourite: (id: number, is_favourite: boolean) =>
		unwrap<Template>(authAxios.patch(`api/signage/templates/${id}`, { is_favourite })),
};
