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

export type SelfRegistrationPayload = {
	username: string;
	email: string;
	password: string;
	device_serial: string;
};

/** POST /api/self-registration/ — public self-serve signup */
export const selfRegister = async (payload: SelfRegistrationPayload) => {
	try {
		const response = await publicAxios.post(
			`${baseURL}/api/users/self-registration/`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error('Error self-registering:', error);
		throw error;
	}
};

/** POST /api/login/ */
export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
	try {
		const response = await publicAxios.post(`${baseURL}/api/login/`, payload);
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

/** POST /api/logout/ */
export const logout = async (): Promise<void> => {
	try {
		await authAxios.post(`${baseURL}/api/logout/`);
	} catch (error) {
		console.error('Error logging out:', error);
		throw error;
	}
};

/** POST /api/token/refresh/ — exchange refresh token for a new access token */
export const refreshTokens = async (refresh: string): Promise<AuthTokens> => {
	const response = await publicAxios.post(`${baseURL}/api/token/refresh/`, {
		refresh,
	});
	return response.data;
};

/** GET /api/users/profile/ — unused for now (auth uses login token + stored username). */
export const getProfile = async () => {
	throw new Error('getProfile is disabled — profile API is not used');
};
