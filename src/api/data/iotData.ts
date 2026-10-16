// api call for IOT data table — GET /api/devices/{id}/data/
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

/** Shape of a single IOT data record returned by the API. */
export type IotDataRecord = {
	id: number;
	server_timestamp: string | null;
	data_timestamp: string | null;
	digital_in_1: boolean;
	digital_in_2: boolean;
	digital_in_name_1: string;
	digital_in_name_2: string;
	digital_out_1: boolean;
	digital_out_2: boolean;
	digital_out_name_1: string;
	digital_out_name_2: string;
	analog_in_1: number;
	analog_in_2: number;
	analog_in_3: number;
	analog_in_4: number;
	analog_ratio_1: { source: string; parsedValue: number } | null;
	analog_ratio_2: { source: string; parsedValue: number } | null;
	analog_ratio_3: { source: string; parsedValue: number } | null;
	analog_ratio_4: { source: string; parsedValue: number } | null;
	analog_name_1: string;
	analog_name_2: string;
	analog_name_3: string;
	analog_name_4: string;
	analog_unit_1: string;
	analog_unit_2: string;
	analog_unit_3: string;
	analog_unit_4: string;
	device: string | number;
};

/** Paginated response shape (DRF-style). */
export type IotDataListResponse = {
	results: IotDataRecord[];
	count: number;
};

/** Query params for the IOT data endpoint. */
export type GetIotDataParams = {
	limit?: number;
	offset?: number;
	device_id?: number | string;
	search?: string;
	ordering?: string;
	/** Extra query string from column filters */
	filters?: string;
};

/**
 * Normalize an analog_ratio value which may arrive as:
 *  - { source: string, parsedValue: number }  (object form)
 *  - a plain number                            (legacy / alternate form)
 *  - null / undefined
 */
const normalizeRatio = (
	value: unknown,
): { source: string; parsedValue: number } | null => {
	if (value == null) return null;
	if (typeof value === 'number' && Number.isFinite(value)) {
		return { source: String(value), parsedValue: value };
	}
	if (typeof value === 'object' && 'parsedValue' in (value as object)) {
		const obj = value as { source?: string; parsedValue: number };
		return { source: obj.source ?? String(obj.parsedValue), parsedValue: obj.parsedValue };
	}
	return null;
};

/** Normalize a single record from the API response. */
export const normalizeIotDataRecord = (raw: unknown): IotDataRecord => {
	const p = ((raw as any)?.data ?? raw ?? {}) as Record<string, unknown>;
	return {
		id: Number(p.id),
		server_timestamp: (p.server_timestamp as string) ?? null,
		data_timestamp: (p.data_timestamp as string) ?? null,
		digital_in_1: Boolean(p.digital_in_1),
		digital_in_2: Boolean(p.digital_in_2),
		digital_in_name_1: String(p.digital_in_name_1 ?? ''),
		digital_in_name_2: String(p.digital_in_name_2 ?? ''),
		digital_out_1: Boolean(p.digital_out_1),
		digital_out_2: Boolean(p.digital_out_2),
		digital_out_name_1: String(p.digital_out_name_1 ?? ''),
		digital_out_name_2: String(p.digital_out_name_2 ?? ''),
		analog_in_1: Number(p.analog_in_1 ?? 0),
		analog_in_2: Number(p.analog_in_2 ?? 0),
		analog_in_3: Number(p.analog_in_3 ?? 0),
		analog_in_4: Number(p.analog_in_4 ?? 0),
		analog_ratio_1: normalizeRatio(p.analog_ratio_1),
		analog_ratio_2: normalizeRatio(p.analog_ratio_2),
		analog_ratio_3: normalizeRatio(p.analog_ratio_3),
		analog_ratio_4: normalizeRatio(p.analog_ratio_4),
		analog_name_1: String(p.analog_name_1 ?? ''),
		analog_name_2: String(p.analog_name_2 ?? ''),
		analog_name_3: String(p.analog_name_3 ?? ''),
		analog_name_4: String(p.analog_name_4 ?? ''),
		analog_unit_1: String(p.analog_unit_1 ?? ''),
		analog_unit_2: String(p.analog_unit_2 ?? ''),
		analog_unit_3: String(p.analog_unit_3 ?? ''),
		analog_unit_4: String(p.analog_unit_4 ?? ''),
		device: (p.device as string | number) ?? '',
	};
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeIotDataList = (data: unknown): IotDataListResponse => {
	if (Array.isArray(data)) {
		const results = data.map(normalizeIotDataRecord);
		return { results, count: results.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const rawList = (obj.results ?? obj.data ?? []) as unknown[];
	const results = rawList.map(normalizeIotDataRecord);
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

/** GET /api/devices/{id}/data/ */
export const getIotData = async ({
	limit = 10,
	offset = 0,
	device_id,
	search = '',
	ordering = '',
	filters = '',
}: GetIotDataParams = {}): Promise<IotDataListResponse> => {
	try {
		const params: string[] = [`limit=${limit}`, `offset=${offset}`];
		if (search) params.push(`search=${encodeURIComponent(search)}`);
		if (ordering) params.push(`ordering=${ordering}`);

		const response = await authAxios.get(
			`${baseURL}/api/devices/${device_id}/data/?${params.join('&')}${filters}`,
		);
		return normalizeIotDataList(response.data);
	} catch (error) {
		console.error('Error fetching IOT data:', error);
		throw error;
	}
};

export type AnalogFieldStats = {
	min: number | null;
	max: number | null;
};

export type DigitalFieldStats = {
	on: number;
	off: number;
};

export type DeviceAnalyticsPayload = {
	analog_in_1: AnalogFieldStats;
	analog_in_2: AnalogFieldStats;
	analog_in_3: AnalogFieldStats;
	analog_in_4: AnalogFieldStats;
	digital_in_1: DigitalFieldStats;
	digital_in_2: DigitalFieldStats;
	digital_out_1: DigitalFieldStats;
	digital_out_2: DigitalFieldStats;
};

export type SiteAnalytics = {
	site_id: number | string;
	date: string;
	analytics: DeviceAnalyticsPayload;
};

export type MyDeviceAnalytics = {
	subscription_ids: number[];
	device_count: number;
	date: string;
	analytics: DeviceAnalyticsPayload;
};

const toNullableNumber = (value: unknown): number | null => {
	if (value == null || value === '') return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
};

const normalizeAnalogStats = (raw: unknown): AnalogFieldStats => {
	const obj = (raw ?? {}) as Record<string, unknown>;
	return {
		min: toNullableNumber(obj.min),
		max: toNullableNumber(obj.max),
	};
};

const normalizeDigitalStats = (raw: unknown): DigitalFieldStats => {
	const obj = (raw ?? {}) as Record<string, unknown>;
	return {
		on: toNullableNumber(obj.on) ?? 0,
		off: toNullableNumber(obj.off) ?? 0,
	};
};

const normalizeAnalyticsPayload = (raw: unknown): DeviceAnalyticsPayload => {
	const analyticsRaw = (raw ?? {}) as Record<string, unknown>;
	return {
		analog_in_1: normalizeAnalogStats(analyticsRaw.analog_in_1),
		analog_in_2: normalizeAnalogStats(analyticsRaw.analog_in_2),
		analog_in_3: normalizeAnalogStats(analyticsRaw.analog_in_3),
		analog_in_4: normalizeAnalogStats(analyticsRaw.analog_in_4),
		digital_in_1: normalizeDigitalStats(analyticsRaw.digital_in_1),
		digital_in_2: normalizeDigitalStats(analyticsRaw.digital_in_2),
		digital_out_1: normalizeDigitalStats(analyticsRaw.digital_out_1),
		digital_out_2: normalizeDigitalStats(analyticsRaw.digital_out_2),
	};
};

export const normalizeSiteAnalytics = (data: unknown): SiteAnalytics => {
	const raw = (data ?? {}) as Record<string, unknown>;
	return {
		site_id: (raw.site_id as number | string) ?? '',
		date: String(raw.date ?? ''),
		analytics: normalizeAnalyticsPayload(raw.analytics),
	};
};

export const normalizeMyDeviceAnalytics = (data: unknown): MyDeviceAnalytics => {
	const raw = (data ?? {}) as Record<string, unknown>;
	const subscriptionIds = Array.isArray(raw.subscription_ids)
		? raw.subscription_ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
		: [];
	return {
		subscription_ids: subscriptionIds,
		device_count: toNullableNumber(raw.device_count) ?? 0,
		date: String(raw.date ?? ''),
		analytics: normalizeAnalyticsPayload(raw.analytics),
	};
};

/** GET /api/data/site-analytics/{siteId}/ — today's min/max per analog channel. */
export const getSiteAnalytics = async (
	siteId: number | string,
): Promise<SiteAnalytics> => {
	try {
		const response = await authAxios.get(
			`${baseURL}/api/data/site-analytics/${siteId}/`,
		);
		return normalizeSiteAnalytics(response.data);
	} catch (error) {
		console.error('Error fetching site analytics:', error);
		throw error;
	}
};

/** GET /api/data/my-device-analytics/ — today's analog min/max + digital on/off. */
export const getMyDeviceAnalytics = async (): Promise<MyDeviceAnalytics> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/data/my-device-analytics/`);
		return normalizeMyDeviceAnalytics(response.data);
	} catch (error) {
		console.error('Error fetching my device analytics:', error);
		throw error;
	}
};
