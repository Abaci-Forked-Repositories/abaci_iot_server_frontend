// api call for sites list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

/** Shape returned by GET /api/sites/ */
export type Site = {
	id: number;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
};

export type SiteWritePayload = {
	name: string;
	description: string;
};

export type SitesListResponse = {
	results: Site[];
	count: number;
};

export type GetSitesParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters */
	filters?: string;
	ordering?: string;
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeSitesList = (data: unknown): SitesListResponse => {
	if (Array.isArray(data)) {
		return { results: data as Site[], count: data.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const results = (obj.results ?? obj.sites ?? []) as Site[];
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

export const getSites = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetSitesParams): Promise<SitesListResponse> => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/sites/?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return normalizeSitesList(response.data);
	} catch (error) {
		console.error('Error fetching sites:', error);
		throw error;
	}
};

export const createSite = async (site: SiteWritePayload) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/sites/`, site);
		return response.data;
	} catch (error) {
		console.error('Error creating site:', error);
		throw error;
	}
};

export const updateSite = async (id: number | string, site: Partial<SiteWritePayload>) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/sites/${id}/`, site);
		return response.data;
	} catch (error) {
		console.error('Error updating site:', error);
		throw error;
	}
};

export const deleteSite = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/sites/${id}/`);
		return response.data;
	} catch (error) {
		console.error('Error deleting site:', error);
		throw error;
	}
};

export const getSiteById = async (id: number | string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/sites/${id}/`);
		return response.data as Site;
	} catch (error) {
		console.error('Error fetching site by id:', error);
		throw error;
	}
};
