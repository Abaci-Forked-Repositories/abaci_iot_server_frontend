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
 *
 * SANITIZATION: If the response body is HTML (e.g., an Nginx 404 page),
 * it is NEVER returned as-is. A safe fallback is used instead.
 */
export const getApiErrorMessage = (error, fallback = 'Error occurred, please check your connection and try again!') => {
	const data = error?.response?.data;

	// ── HTML guard: never expose raw HTML from Nginx/Apache error pages ──
	if (typeof data === 'string') {
		if (/<html|<!DOCTYPE|<head|<body|nginx\/|apache\/|<pre>/i.test(data)) {
			// Server returned an HTML error page instead of JSON
			const status = error?.response?.status;
			if (status === 404) {
				return 'The service is currently unavailable. Please try again later.';
			}
			if (status >= 500 && status <= 504) {
				return 'The server is temporarily unavailable. Please try again later.';
			}
			return 'Received an unexpected response from the server. Please try again later.';
		}
		return data;
	}

	if (!data) {
		// Network error (no response) — don't expose Axios internals
		if (!error?.response) {
			if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
				return 'The request took too long. Please try again.';
			}
			return 'Unable to reach the server. Please check your connection and try again.';
		}
		return error?.message || fallback;
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
