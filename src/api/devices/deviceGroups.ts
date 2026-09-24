// api call for device groups list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';
import type { DeviceGroupFormData } from '../../pages/Devices/DeviceGroupFormModal';

export type DeviceGroup = DeviceGroupFormData & { id: number };

export type GetDeviceGroupsParams = {
	page: number;
	limit: number;
	search?: string;
	filters?: string;
	ordering?: string;
};

export const getDeviceGroups = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetDeviceGroupsParams) => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/device-groups?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching device groups:', error);
		throw error;
	}
};

export const createDeviceGroup = async (group: DeviceGroupFormData) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/device-groups`, group);
		return response.data;
	} catch (error) {
		console.error('Error creating device group:', error);
		throw error;
	}
};

export const updateDeviceGroup = async (id: number | string, group: Partial<DeviceGroup>) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/device-groups/${id}`, group);
		return response.data;
	} catch (error) {
		console.error('Error updating device group:', error);
		throw error;
	}
};

export const deleteDeviceGroup = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/device-groups/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting device group:', error);
		throw error;
	}
};

export const getDeviceGroupById = async (id: number | string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/device-groups/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching device group by id:', error);
		throw error;
	}
};
