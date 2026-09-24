// api call for users list
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';
import { User } from '../../services/queueManagementApi';

export type GetUsersParams = {
	page: number;
	limit: number;
	search?: string;
	/** Extra query string from column filters, e.g. `&type=Admin&status=Active` */
	filters?: string;
	ordering?: string;
};

export const getUsers = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetUsersParams) => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/users?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return response.data;
	} catch (error) {
		console.error('Error fetching users:', error);
		throw error;
	}
};

export const createUser = async (user: User) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/users`, user);
		return response.data;
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
};

export const updateUser = async (id: string, user: User) => {
	try {
		const response = await authAxios.put(`${baseURL}/api/users/${id}`, user);
		return response.data;
	} catch (error) {
		console.error('Error updating user:', error);
		throw error;
	}
};

export const deleteUser = async (id: string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/users/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error deleting user:', error);
		throw error;
	}
};

export const getUserById = async (id: string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/users/${id}`);
		return response.data;
	} catch (error) {
		console.error('Error fetching user by id:', error);
		throw error;
	}
};
