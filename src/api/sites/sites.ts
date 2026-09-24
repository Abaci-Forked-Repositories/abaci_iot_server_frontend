// api call for sites list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';
import type { SiteFormData } from '../../pages/Sites/SiteFormModal';

export type Site = SiteFormData & { id: number };

export type GetSitesParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters */
	filters?: string;
	ordering?: string;
};

export const getSites = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetSitesParams) => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/sites?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching sites:', error);
		throw error;
	}
};

export const createSite = async (site: SiteFormData) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/sites`, site);
		return response.data;
	} catch (error) {
		console.error('Error creating site:', error);
		throw error;
	}
};

export const updateSite = async (id: number | string, site: Partial<Site>) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/sites/${id}`, site);
		return response.data;
	} catch (error) {
		console.error('Error updating site:', error);
		throw error;
	}
};

export const deleteSite = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/sites/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting site:', error);
		throw error;
	}
};

export const getSiteById = async (id: number | string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/sites/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching site by id:', error);
		throw error;
	}
};
