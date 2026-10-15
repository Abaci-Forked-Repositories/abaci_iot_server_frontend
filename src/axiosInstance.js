import axios from 'axios';
import { baseURL } from './helpers/baseURL';
import { AxiosTimeout } from './helpers/constants';

export const publicAxios = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	headers: { 'content-type': 'application/json', accept: 'application/json' },
	withCredentials: true,
});

export const publicAxiosFileUpload = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	headers: {
		'content-type': 'multipart/form-data',
		accept: 'application/json',
	},
	withCredentials: true,
});

const authAxios = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	withCredentials: true,
});

const authAxiosForCSV = axios.create({
	baseURL,
	timeout: AxiosTimeout,
	responseType: 'blob',
	withCredentials: true,
});

const authAxiosFileUpload = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'multipart/form-data',
		accept: 'application/json',
	},
	withCredentials: true,
});

// ─── HTML Response Guard Interceptor ──────────────────────────────────────────
// When the backend is unavailable, Nginx may return an HTML error page (e.g., 404).
// This interceptor detects HTML in the response body and converts it into a
// rejected promise with a clean error, so downstream code never sees raw HTML.

const HTML_PATTERN = /<!DOCTYPE|<html|<head|<body|<title|nginx\/|apache\/|<pre>/i;

const htmlResponseGuard = (response) => {
	const data = response && response.data;
	// Only check string responses (JSON objects are fine)
	if (typeof data === 'string' && HTML_PATTERN.test(data)) {
		var error = new Error('Server returned HTML instead of JSON');
		// @ts-ignore — attaching custom props for downstream error handlers
		error.response = response;
		// @ts-ignore
		error.isHtmlResponse = true;
		if (import.meta.env.DEV) {
			console.warn(
				'[axios] HTML response detected: ' + response.status + ' ' + (response.config && response.config.url)
			);
		}
		return Promise.reject(error);
	}
	return response;
};

// Attach the guard to all instances (runs before auth refresh interceptor)
publicAxios.interceptors.response.use(htmlResponseGuard);
publicAxiosFileUpload.interceptors.response.use(htmlResponseGuard);
authAxios.interceptors.response.use(htmlResponseGuard);
authAxiosFileUpload.interceptors.response.use(htmlResponseGuard);
// Skip authAxiosForCSV — it expects blob responses, not JSON

export const updateToken = function (newToken) {
	var header = newToken ? 'Bearer ' + newToken : '';
	authAxios.defaults.headers.Authorization = header;
	authAxiosFileUpload.defaults.headers.Authorization = header;
	authAxiosForCSV.defaults.headers.Authorization = header;
	authAxios.defaults.baseURL = baseURL;
	authAxiosFileUpload.defaults.baseURL = baseURL;
	authAxiosForCSV.defaults.baseURL = baseURL;
};

export const setInitialToken = function () {
	authAxios.defaults.baseURL = baseURL;
	authAxiosFileUpload.defaults.baseURL = baseURL;
	authAxiosForCSV.defaults.baseURL = baseURL;
};

setInitialToken();

export { authAxios, authAxiosFileUpload, authAxiosForCSV };
