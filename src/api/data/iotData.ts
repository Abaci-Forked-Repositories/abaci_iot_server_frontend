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
		analog_ratio_1: (p.analog_ratio_1 as { source: string; parsedValue: number } | null) ?? null,
		analog_ratio_2: (p.analog_ratio_2 as { source: string; parsedValue: number } | null) ?? null,
		analog_ratio_3: (p.analog_ratio_3 as { source: string; parsedValue: number } | null) ?? null,
		analog_ratio_4: (p.analog_ratio_4 as { source: string; parsedValue: number } | null) ?? null,
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
