// api call for devices list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

export type Device = {
	id: number;
	name: string;
	site: string;
	description: string;
	last_online: string;
	last_offline: string;
	created_at: string;
	status: string;
};

export type GetDevicesParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters, e.g. `&status=Online` */
	filters?: string;
	ordering?: string;
};

export const getDevices = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetDevicesParams) => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/devices?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching devices:', error);
		throw error;
	}
};

export const createDevice = async (device: Omit<Device, 'id'>) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/devices`, device);
		return response.data;
	} catch (error) {
		console.error('Error creating device:', error);
		throw error;
	}
};

export const updateDevice = async (id: number | string, device: Partial<Device>) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/devices/${id}`, device);
		return response.data;
	} catch (error) {
		console.error('Error updating device:', error);
		throw error;
	}
};

export const deleteDevice = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/devices/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting device:', error);
		throw error;
	}
};

export const getDeviceById = async (id: number | string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/devices/${id}`);
		return response.data;
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

/** GET /api/devices/{id}/dashboard */
export const getDeviceDashboard = async (
	id: number | string,
): Promise<DeviceDashboardData> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/devices/${id}/dashboard`);
		return unwrapDashboard(response.data);
	} catch (error) {
		console.error('Error fetching device dashboard:', error);
		throw error;
	}
};

/** PATCH /api/devices/{id}/dashboard — controllable outputs */
export const updateDeviceDashboard = async (
	id: number | string,
	payload: DeviceDashboardUpdate,
): Promise<DeviceDashboardData> => {
	try {
		const response = await authAxios.patch(
			`${baseURL}/api/devices/${id}/dashboard`,
			payload,
		);
		return unwrapDashboard(response.data);
	} catch (error) {
		console.error('Error updating device dashboard:', error);
		throw error;
	}
};
