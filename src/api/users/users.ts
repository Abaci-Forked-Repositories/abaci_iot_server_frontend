// api call for users list
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';
import { normalizeDevicesList, type DevicesListResponse } from '../devices/devices';

/** Shape returned by GET /api/users/ */
export type ApiUser = {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	/** Subscription access role: admin | view | edit */
	role: 'admin' | 'view' | 'edit' | null;
	/** Child subscription under the logged-in admin */
	subscription_id: number | null;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	last_login: string | null;
	date_joined: string;
	created_at: string;
	updated_at: string;
	groups: unknown[];
	user_permissions: unknown[];
};

export type UsersListResponse = {
	results: ApiUser[];
	count: number;
};

export type GetUsersParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters, e.g. `&type=Admin&status=Active` */
	filters?: string;
	ordering?: string;
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeUsersList = (data: unknown): UsersListResponse => {
	if (Array.isArray(data)) {
		return { results: data as ApiUser[], count: data.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const results = (obj.results ?? obj.users ?? []) as ApiUser[];
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

export const getUsers = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetUsersParams): Promise<UsersListResponse> => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/users/?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return normalizeUsersList(response.data);
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
};

export type UserWritePayload = {
	email: string;
	first_name?: string;
	last_name?: string;
	password?: string;
	is_active?: boolean;
	role?: 'admin' | 'view' | 'edit';
};

export const createUser = async (user: UserWritePayload) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/users/`, user);
		return response.data;
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
};

export const updateUser = async (id: string | number, user: Partial<UserWritePayload>) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/users/${id}/`, user);
		return response.data;
	} catch (error) {
		console.error('Error updating user:', error);
		throw error;
	}
};

export const deleteUser = async (id: string | number) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/users/${id}/`);
		return response.data;
	} catch (error) {
		console.error('Error deleting user:', error);
		throw error;
	}
};

export const getUserById = async (id: string | number): Promise<ApiUser> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/users/${id}/`);
		const data = response.data;
		return (data?.user ?? data?.data ?? data) as ApiUser;
	} catch (error) {
		console.error('Error fetching user by id:', error);
		throw error;
	}
};

export type GetUserDevicesParams = {
	page: number;
	limit: number;
	search?: string;
};

/** Devices linked to the selected user's subscription under the logged-in admin. */
export const getUserDevices = async (
	userId: string | number,
	{ page, limit, search = '' }: GetUserDevicesParams,
): Promise<DevicesListResponse> => {
	try {
		const offset = Math.max(page - 1, 0) * limit;
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/users/${userId}/devices/?limit=${limit}&offset=${offset}${searchParam}`,
		);
		return normalizeDevicesList(response.data);
	} catch (error) {
		console.error('Error fetching user devices:', error);
		throw error;
	}
};
