/**
 * Site / general settings API.
 * Logo upload: PATCH multipart field `site_logo`.
 * Full save (other fields) — add when backend contract is provided.
 */

import { authAxios, authAxiosFileUpload } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

export interface SiteConfig {
	id: number;
	logo_url: string | null;
	site_id: string;
	global_id: string;
	version: number;
	is_deleted: boolean;
	last_change_source: string;
	last_change_reason: string;
	site_name: string;
	site_logo: string | null;
	timezone: string;
	week_start_day: string;
	number_of_days_to_keep_data: number;
	created_time: string;
	updated_time: string;
	reset_time: string;
}

export interface TimezoneOption {
	value: string;
	label: string;
}

export interface DataRetention {
	number_of_days_to_keep_data: number;
}

/** Turn API logo path into a browser-loadable URL. */
export function resolveSiteLogoUrl(path: string | null | undefined): string | null {
	if (!path) return null;
	if (
		path.startsWith('data:') ||
		path.startsWith('blob:') ||
		path.startsWith('http://') ||
		path.startsWith('https://')
	) {
		return path;
	}
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${baseURL}${normalized}`;
}

export async function getSiteConfigs(): Promise<SiteConfig> {
	const { data } = await authAxios.get<SiteConfig>('api/administration/site_configs/');
	return data;
}

export async function getTimezones(): Promise<TimezoneOption[]> {
	const { data } = await authAxios.get<TimezoneOption[]>('api/administration/timezones/');
	return data;
}

export async function getDataRetention(): Promise<DataRetention> {
	const { data } = await authAxios.get<DataRetention>('api/administration/data-retention/');
	return data;
}

/** PATCH multipart — only `site_logo` file field. */
export async function uploadSiteLogo(file: File): Promise<SiteConfig> {
	const formData = new FormData();
	formData.append('site_logo', file);
	const { data } = await authAxiosFileUpload.patch<SiteConfig>(
		'api/administration/site_configs/',
		formData,
	);
	return data;
}

/** PATCH JSON — clear logo with `{ site_logo: null }`. */
export async function removeSiteLogo(): Promise<SiteConfig> {
	const { data } = await authAxios.patch<SiteConfig>('api/administration/site_configs/', {
		site_logo: null,
	});
	return data;
}

export interface UpdateSiteConfigPayload {
	site_name: string;
	timezone: string;
	week_start_day: string;
	reset_time: string;
}

/** PATCH JSON — site name / timezone / week start / reset time. */
export async function updateSiteConfigs(payload: UpdateSiteConfigPayload): Promise<SiteConfig> {
	const { data } = await authAxios.patch<SiteConfig>(
		'api/administration/site_configs/',
		payload,
	);
	return data;
}

/** POST — data retention days. */
export async function updateDataRetention(
	number_of_days_to_keep_data: number,
): Promise<DataRetention> {
	const { data } = await authAxios.post<DataRetention>(
		'api/administration/data-retention/',
		{ number_of_days_to_keep_data },
	);
	return data;
}
