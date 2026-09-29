import Cookies from 'js-cookie';
import { updateToken } from '../axiosInstance';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USERNAME_KEY = 'authUsername';
/** Legacy key used by the global axios interceptor in App.tsx */
const LEGACY_TOKEN_KEY = 'token';

export const getAccessToken = () =>
	Cookies.get(ACCESS_TOKEN_KEY) || Cookies.get(LEGACY_TOKEN_KEY) || null;

export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY) || null;

/**
 * @param {{ access?: string; refresh?: string; username?: string }} [session]
 */
export const persistAuthSession = ({ access, refresh, username } = {}) => {
	if (access) {
		Cookies.set(ACCESS_TOKEN_KEY, access);
		Cookies.set(LEGACY_TOKEN_KEY, access);
		updateToken(access);
	}
	if (refresh) {
		Cookies.set(REFRESH_TOKEN_KEY, refresh);
	}
	if (username) {
		Cookies.set(USERNAME_KEY, username);
	}
};

export const restoreAuthTokenFromCookies = () => {
	const token = getAccessToken();
	if (token) {
		updateToken(token);
	}
	return token;
};

export const getStoredUsername = () => Cookies.get(USERNAME_KEY) || '';

export const clearAuthSession = () => {
	Cookies.remove(ACCESS_TOKEN_KEY);
	Cookies.remove(REFRESH_TOKEN_KEY);
	Cookies.remove(LEGACY_TOKEN_KEY);
	Cookies.remove(USERNAME_KEY);
	Cookies.remove('socketIOToken');
	updateToken('');
};

/**
 * Extract a user-facing message from API error responses.
 * Supports shapes like `{ error: "..." }`, `{ message: "..." }`, `{ detail: "..." }`.
 */
export const getApiErrorMessage = (error, fallback = 'Error occurred, please check your connection and try again!') => {
	const data = error?.response?.data;
	if (!data) {
		return error?.message || fallback;
	}
	if (typeof data === 'string') {
		return data;
	}
	if (typeof data.error === 'string') {
		return data.error;
	}
	if (typeof data.detail === 'string') {
		return data.detail;
	}
	if (typeof data.message === 'string') {
		return data.message;
	}
	if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
		return data.non_field_errors[0];
	}
	const firstKey = Object.keys(data)[0];
	if (firstKey && Array.isArray(data[firstKey])) {
		return data[firstKey][0];
	}
	return fallback;
};
