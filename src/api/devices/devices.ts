// api call for devices list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

/** Shape returned by GET /api/devices/ */
export type Device = {
	id: number;
	identifier: string | null;
	serial_number: string | null;
	model: string | null;
	description: string | null;
	created_at: string;
	updated_at: string;
	wifi_ip_address: string | null;
	wifi_mask: string | null;
	wifi_gateway: string | null;
	wifi_ssid: string | null;
	wifi_password: string | null;
	firmware_version: string | null;
};

/** Prefer model → identifier → description for UI labels. */
export const getDeviceLabel = (device: Pick<Device, 'id' | 'model' | 'identifier' | 'description'>) => {
	const model = device.model?.trim();
	if (model) return model;
	const identifier = device.identifier?.trim();
	if (identifier) return identifier;
	const description = device.description?.trim();
	if (description) return description;
	return `Device #${device.id}`;
};

export type DevicesListResponse = {
	results: Device[];
	count: number;
};

export type GetDevicesParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters */
	filters?: string;
	ordering?: string;
};

export type DeviceWritePayload = {
	model?: string | null;
	identifier?: string | null;
	serial_number?: string | null;
	description?: string | null;
	wifi_ip_address?: string | null;
	wifi_mask?: string | null;
	wifi_gateway?: string | null;
	wifi_ssid?: string | null;
	wifi_password?: string | null;
	firmware_version?: string | null;
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeDevicesList = (data: unknown): DevicesListResponse => {
	if (Array.isArray(data)) {
		return { results: data as Device[], count: data.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const results = (obj.results ?? obj.devices ?? []) as Device[];
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

export const getDevices = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetDevicesParams): Promise<DevicesListResponse> => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/devices/?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return normalizeDevicesList(response.data);
	} catch (error) {
		console.error('Error fetching devices:', error);
		throw error;
	}
};

export const createDevice = async (device: DeviceWritePayload) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/devices/`, device);
		return response.data;
	} catch (error) {
		console.error('Error creating device:', error);
		throw error;
	}
};

export const updateDevice = async (
	id: number | string,
	device: Partial<DeviceWritePayload>,
) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/devices/${id}/`, device);
		return response.data;
	} catch (error) {
		console.error('Error updating device:', error);
		throw error;
	}
};

export const deleteDevice = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/devices/${id}/`);
		return response.data;
	} catch (error) {
		console.error('Error deleting device:', error);
		throw error;
	}
};

export const getDeviceById = async (id: number | string): Promise<Device> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/devices/${id}/`);
		const data = response.data;
		return (data?.device ?? data) as Device;
	} catch (error) {
		console.error('Error fetching device by id:', error);
		throw error;
	}
};

/** Live inverter / GPIO monitor payload for a device */
export type DeviceDashboardData = {
	mode: string;
	charging: boolean;
	short_circuit: boolean;
	overload: boolean;
	fan_status: boolean;
	output_voltage: number;
	load_percentage: number;
	battery_voltage: number;
	temperature_1: number;
	temperature_2: number;
	digital_in_1: boolean;
	digital_in_2: boolean;
	digital_out_1: boolean;
	digital_out_2: boolean;
	analog_in_1: number;
	analog_in_2: number;
	analog_in_3: number;
	analog_in_4: number;
};

export type DeviceDashboardUpdate = Partial<
	Pick<DeviceDashboardData, 'charging' | 'digital_out_1' | 'digital_out_2'>
>;

const unwrapDashboard = (data: any): DeviceDashboardData => {
	const payload = data?.dashboard ?? data?.monitor ?? data?.data ?? data;
	return payload as DeviceDashboardData;
};

/** GET /api/devices/{id}/dashboard/ */
export const getDeviceDashboard = async (
	id: number | string,
): Promise<DeviceDashboardData> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/devices/${id}/dashboard/`);
		return unwrapDashboard(response.data);
	} catch (error) {
		console.error('Error fetching device dashboard:', error);
		throw error;
	}
};

/** PATCH /api/devices/{id}/dashboard/ — controllable outputs */
export const updateDeviceDashboard = async (
	id: number | string,
	payload: DeviceDashboardUpdate,
): Promise<DeviceDashboardData> => {
	try {
		const response = await authAxios.patch(
			`${baseURL}/api/devices/${id}/dashboard/`,
			payload,
		);
		return unwrapDashboard(response.data);
	} catch (error) {
		console.error('Error updating device dashboard:', error);
		throw error;
	}
};
