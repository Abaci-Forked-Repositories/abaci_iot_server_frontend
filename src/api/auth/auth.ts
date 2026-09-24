import { authAxios, publicAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

export type LoginPayload = {
	username: string;
	password: string;
};

export type PasswordResetPayload = {
	username: string;
	current_password: string;
	new_password: string;
};

export type AuthTokens = {
	access?: string;
	refresh?: string;
	user?: any;
};

/** POST /api/auth/login/ */
export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
	try {
		const response = await publicAxios.post(`${baseURL}/api/auth/login/`, payload);
		return response.data;
	} catch (error) {
		console.error('Error logging in:', error);
		throw error;
	}
};

/** POST /api/users/password-reset/ — invited users setting first password */
export const resetPasswordOnLogin = async (
	payload: PasswordResetPayload,
): Promise<AuthTokens> => {
	try {
		const response = await publicAxios.post(
			`${baseURL}/api/users/password-reset/`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error('Error resetting password:', error);
		throw error;
	}
};

/** POST /api/auth/logout/ */
export const logout = async (): Promise<void> => {
	try {
		await authAxios.post(`${baseURL}/api/auth/logout/`);
	} catch (error) {
		console.error('Error logging out:', error);
		throw error;
	}
};

/** GET /api/users/profile/ */
export const getProfile = async () => {
	try {
		const response = await authAxios.get(`${baseURL}/api/users/profile/`);
		return response.data?.user ?? response.data;
	} catch (error) {
		console.error('Error fetching profile:', error);
		throw error;
	}
};
