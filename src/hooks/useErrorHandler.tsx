import { useCallback } from 'react';
import { getApiErrorMessage } from '../helpers/authSession';

const formatFieldErrorMessages = (entries: [string, unknown][]): string =>
	entries
		.map(([, value]) => (Array.isArray(value) ? value.join(', ') : String(value ?? '')))
		.filter(Boolean)
		.join('\n');

/** Check if a string looks like HTML from a server error page (Nginx, Apache, etc.) */
const isHtmlContent = (value: unknown): boolean => {
	if (typeof value !== 'string') return false;
	return /<!DOCTYPE|<html|<head|<body|<title|nginx\/|apache\/|<pre>/i.test(value);
};

const useErrorHandler = () => {
	const handleError = useCallback((error: any): string => {
		if (typeof error === 'string') {
			// Never render raw HTML that might be in the string
			if (isHtmlContent(error)) {
				return 'The server returned an unexpected response. Please try again later.';
			}
			return error;
		}

		let errorMsg = '';

		const response = error?.response;
		const data = response?.data;

		// ── HTML guard: server returned an error page instead of JSON ──
		if (isHtmlContent(data)) {
			const status = response?.status;
			if (status === 404) {
			return 'The service is currently unavailable. Please try again later.';
			}
			if (status >= 500 && status <= 504) {
				return 'The server is temporarily unavailable. Please try again later.';
			}
			return 'Received an unexpected response from the server. Please try again later.';
		}

		// ── Network error: no response at all ──
		if (!response) {
			if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
				return 'The request took too long. Please try again.';
			}
			return 'Unable to reach the server. Please check your connection and try again.';
		}

		if (error?.response?.status === 400 || error?.response?.status === 500) {
			const errors = error.response.data?.errors;

			if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
				errorMsg += formatFieldErrorMessages(Object.entries(errors));
			} else if (error.response.data.error) {
				errorMsg = error.response.data.error;
			}
			else if (error.response.data.message) {
				errorMsg = error.response.data.message || 'Bad request.';
			}
			else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
				errorMsg += formatFieldErrorMessages(Object.entries(data));
			} else {
				errorMsg = 'Bad request.';
			}
		} else if (error?.response?.status === 406) {
			errorMsg += error.response.data.message;
		} else if (error?.response?.status === 409) {
			errorMsg +=
				typeof error.response.data === 'string'
					? error.response.data
					: JSON.stringify(error.response.data);
		} else if (error?.response?.status === 405) {
			errorMsg += error.response.data?.errors?.detail || 'Method not allowed.';
		} else if (error?.response?.status === 404) {
			if (error.response.data?.errors?.detail) {
				errorMsg += error.response.data.errors.detail;
			} else if (error.response.data.error) {
				errorMsg += error.response.data.error;
			} else {
				errorMsg += error.response.data.message || 'Resource not found.';
			}
		} else if (error?.response?.data?.errors) {
			errorMsg += JSON.stringify(error.response.data.errors);
		} else if (error.message) {
			errorMsg += error.message;
		} else {
			errorMsg += 'Something went wrong. Please check your connection and try again!';
		}

		// Final safety check: never let HTML leak through
		if (isHtmlContent(errorMsg)) {
			return 'The server returned an unexpected response. Please try again later.';
		}

		return errorMsg;
	}, []);

	return { handleError };
};

export default useErrorHandler;
