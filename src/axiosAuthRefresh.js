/**
 * Axios auth refresh interceptor.
 *
 * On 401: POST /api/token/refresh/ with stored refresh token →
 * save new access (and refresh if rotated) → retry original request once.
 * If refresh fails: clear session and redirect to /login.
 *
 * Concurrent 401s share one in-flight refresh (request queue).
 */
import axios from 'axios';
import {
	clearAuthSession,
	getAccessToken,
	getRefreshToken,
	persistAuthSession,
} from './helpers/authSession';
import { baseURL } from './helpers/baseURL';
import {
	authAxios,
	authAxiosFileUpload,
	authAxiosForCSV,
	publicAxios,
	updateToken,
} from './axiosInstance';

const REFRESH_URL = '/api/token/refresh/';

/** Paths that must never trigger refresh (avoid loops). */
const SKIP_REFRESH_PATHS = [
	'/api/login/',
	'/api/token/refresh/',
	'/api/logout/',
	'/api/users/password-reset/',
	'/api/users/forgot-password/',
];

let isRefreshing = false;
/** @type {Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }>} */
let refreshQueue = [];

const shouldSkipRefresh = (config) => {
	const url = String(config?.url || '');
	return SKIP_REFRESH_PATHS.some((path) => url.includes(path));
};

const redirectToLogin = () => {
	clearAuthSession();
	const path = window.location.pathname;
	if (
		path !== '/login' &&
		path !== '/customer-login' &&
		!path.includes('public')
	) {
		window.location.assign('/login');
	}
};

const processQueue = (error, token = null) => {
	refreshQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else resolve(token);
	});
	refreshQueue = [];
};

/**
 * Single shared refresh call for all queued 401s.
 * @returns {Promise<string>} new access token
 */
const refreshAccessToken = async () => {
	const refresh = getRefreshToken();
	if (!refresh) {
		throw new Error('No refresh token');
	}

	const response = await publicAxios.post(`${baseURL}${REFRESH_URL}`, {
		refresh,
	});
	const { access, refresh: newRefresh } = response.data ?? {};
	if (!access) {
		throw new Error('Refresh response missing access token');
	}

	persistAuthSession({
		access,
		refresh: newRefresh || refresh,
	});
	updateToken(access);
	return access;
};

/**
 * Set Authorization without replacing headers with `{}`
 * (Axios 1.x types headers as AxiosHeaders, not a plain object).
 * @param {import('axios').InternalAxiosRequestConfig | undefined} config
 * @param {string} token
 */
const setAuthHeader = (config, token) => {
	if (!config) return;
	if (!config.headers) {
		config.headers = new axios.AxiosHeaders();
	}
	if (typeof config.headers.set === 'function') {
		config.headers.set('Authorization', `Bearer ${token}`);
	} else {
		config.headers.Authorization = `Bearer ${token}`;
	}
};

/**
 * Attach Bearer from cookies on every request + 401 → refresh → retry.
 * @param {import('axios').AxiosInstance} instance
 */
export const attachAuthRefreshInterceptor = (instance) => {
	instance.interceptors.request.use((config) => {
		const token = getAccessToken();
		if (token) {
			setAuthHeader(config, token);
		}
		return config;
	});

	instance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error?.config;
			const status = error?.response?.status;

			if (
				status !== 401 ||
				!originalRequest ||
				originalRequest._retry ||
				shouldSkipRefresh(originalRequest)
			) {
				return Promise.reject(error);
			}

			// Mark so we only retry once per request
			originalRequest._retry = true;

			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					refreshQueue.push({
						resolve: (token) => {
							setAuthHeader(originalRequest, token);
							resolve(instance(originalRequest));
						},
						reject,
					});
				});
			}

			isRefreshing = true;

			try {
				const access = await refreshAccessToken();
				processQueue(null, access);
				setAuthHeader(originalRequest, access);
				return instance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				redirectToLogin();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		},
	);
};

/** Wire refresh onto all authenticated clients (+ default axios used in App.tsx). */
export const setupAxiosAuthRefresh = () => {
	attachAuthRefreshInterceptor(authAxios);
	attachAuthRefreshInterceptor(authAxiosFileUpload);
	attachAuthRefreshInterceptor(authAxiosForCSV);
	attachAuthRefreshInterceptor(axios);
};
