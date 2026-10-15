/**
 * Centralized API error normalization.
 *
 * Converts any Axios error into a typed, user-safe structure.
 * Never exposes raw HTML, Nginx pages, stack traces, or internal details.
 * Preserves status code and original error for dev diagnostics.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiErrorCategory =
	| 'network'        // No response received (CORS, DNS, offline, server down)
	| 'timeout'        // Request timed out
	| 'auth'           // 401 / 403
	| 'validation'     // 400 with field errors
	| 'not_found'      // 404 from a known API route
	| 'rate_limit'     // 429
	| 'server'         // 500–504
	| 'unknown';       // Anything else

export interface NormalizedApiError {
	/** User-safe message — never contains raw HTML or internal details */
	message: string;
	/** Coarse category for conditional UI logic */
	category: ApiErrorCategory;
	/** HTTP status code, or null for network/timeout errors */
	status: number | null;
	/** Whether the backend appears to be unreachable or returning non-API responses */
	isServerUnavailable: boolean;
	/** Field-level errors from 400 responses: { fieldName: 'message' } */
	fieldErrors: Record<string, string>;
	/** Original Axios error (for dev diagnostics only — never render this) */
	originalError: unknown;
}

// ─── HTML detection ────────────────────────────────────────────────────────────

const HTML_PATTERN = /<!DOCTYPE|<html|<head|<body|<title|nginx\/|apache\/|<pre>/i;

const isHtmlContent = (value: unknown): boolean => {
	if (typeof value === 'string') return HTML_PATTERN.test(value);
	return false;
};

// ─── Safe message extraction from JSON response data ──────────────────────────

const extractJsonMessage = (data: unknown): string | null => {
	if (!data || typeof data !== 'object') return null;
	const obj = data as Record<string, unknown>;

	// DRF / Django common shapes
	if (typeof obj.detail === 'string' && !isHtmlContent(obj.detail)) return obj.detail;
	if (typeof obj.error === 'string' && !isHtmlContent(obj.error)) return obj.error;
	if (typeof obj.message === 'string' && !isHtmlContent(obj.message)) return obj.message;

	// DRF non_field_errors
	if (Array.isArray(obj.non_field_errors) && typeof obj.non_field_errors[0] === 'string') {
		return obj.non_field_errors[0];
	}

	return null;
};

// ─── Field error extraction from 400 responses ────────────────────────────────

const extractFieldErrors = (data: unknown): Record<string, string> => {
	if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
	const obj = data as Record<string, unknown>;
	const fields: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		// Skip known non-field keys
		if (key === 'detail' || key === 'error' || key === 'message' || key === 'non_field_errors') {
			continue;
		}
		if (Array.isArray(value) && typeof value[0] === 'string') {
			fields[key] = value[0];
		} else if (typeof value === 'string' && !isHtmlContent(value)) {
			fields[key] = value;
		}
	}

	return fields;
};

// ─── Status → category mapping ─────────────────────────────────────────────────

const categorizeStatus = (status: number | null): ApiErrorCategory => {
	if (status === null) return 'network';
	if (status === 401 || status === 403) return 'auth';
	if (status === 400) return 'validation';
	if (status === 404) return 'not_found';
	if (status === 429) return 'rate_limit';
	if (status >= 500 && status <= 504) return 'server';
	return 'unknown';
};

// ─── User-friendly default messages ────────────────────────────────────────────

const DEFAULT_MESSAGES: Record<ApiErrorCategory, string> = {
	network: 'Unable to reach the server. Please check your connection and try again.',
	timeout: 'The request took too long. Please try again.',
	auth: 'Invalid credentials. Please check your email and password.',
	validation: 'Please correct the highlighted fields and try again.',
	not_found: 'The requested resource was not found.',
	rate_limit: 'Too many requests. Please wait a moment and try again.',
	server: 'The server is temporarily unavailable. Please try again later.',
	unknown: 'Something went wrong. Please try again.',
};

// ─── Main normalizer ──────────────────────────────────────────────────────────

/**
 * Normalize any Axios error into a user-safe, typed structure.
 *
 * @param error - The raw error from a .catch() block
 * @param contextHint - Optional label for the API call (e.g., 'login', 'fetch devices')
 *                      Used only for dev console logging, never shown to users.
 */
export const normalizeApiError = (
	error: unknown,
	contextHint?: string,
): NormalizedApiError => {
	// Default: completely unknown error
	const result: NormalizedApiError = {
		message: DEFAULT_MESSAGES.unknown,
		category: 'unknown',
		status: null,
		isServerUnavailable: false,
		fieldErrors: {},
		originalError: error,
	};

	if (!error || typeof error !== 'object') {
		result.message = String(error || DEFAULT_MESSAGES.unknown);
		return result;
	}

	const axiosError = error as {
		response?: {
			status?: number;
			statusText?: string;
			data?: unknown;
			headers?: Record<string, unknown>;
		};
		request?: unknown;
		message?: string;
		code?: string;
		config?: { url?: string };
	};

	// ─── Network error: no response received ─────────────────────────────
	if (!axiosError.response) {
		// Timeout
		if (
			axiosError.code === 'ECONNABORTED' ||
			axiosError.code === 'ETIMEDOUT' ||
			(axiosError.message && axiosError.message.includes('timeout'))
		) {
			result.category = 'timeout';
			result.message = DEFAULT_MESSAGES.timeout;
			return result;
		}

		// Generic network error (CORS, DNS, offline, server down)
		result.category = 'network';
		result.isServerUnavailable = true;
		result.message = DEFAULT_MESSAGES.network;
		return result;
	}

	// ─── HTTP response received ──────────────────────────────────────────
	const { status, data } = axiosError.response;
	result.status = status ?? null;
	result.category = categorizeStatus(status);

	// Check if response body is HTML (Nginx/Apache error page instead of API JSON)
	if (isHtmlContent(data)) {
		result.isServerUnavailable = true;
		// 404 with HTML = server/proxy is up but API route doesn't exist yet
		if (status === 404) {
			result.message = 'The API endpoint is not available. The backend may not be fully deployed yet.';
			result.isServerUnavailable = true;
		} else if (status && status >= 500) {
			result.message = DEFAULT_MESSAGES.server;
		} else {
			result.message = 'Received an unexpected response from the server. Please try again later.';
		}

		if (import.meta.env.DEV) {
			console.warn(
				`[apiError] HTML response received${contextHint ? ` (${contextHint})` : ''}: ` +
				`status=${status}, likely a proxy/server error page instead of JSON.`,
			);
		}
		return result;
	}

	// ─── JSON response: extract safe message ─────────────────────────────
	const jsonMessage = extractJsonMessage(data);
	const fieldErrors = extractFieldErrors(data);
	result.fieldErrors = fieldErrors;

	// Status-specific logic
	switch (status) {
		case 400:
			result.message = jsonMessage || DEFAULT_MESSAGES.validation;
			break;

		case 401:
			// 401 on login = wrong credentials; 401 elsewhere = token expired (handled by interceptor)
			result.message = jsonMessage || 'Invalid credentials. Please check your email and password.';
			break;

		case 403:
			result.message = jsonMessage || 'You do not have permission to perform this action.';
			break;

		case 404:
			// 404 with JSON = API responded, resource just doesn't exist
			result.message = jsonMessage || DEFAULT_MESSAGES.not_found;
			break;

		case 429:
			result.message = jsonMessage || DEFAULT_MESSAGES.rate_limit;
			break;

		default:
			if (status && status >= 500 && status <= 504) {
				result.message = jsonMessage || DEFAULT_MESSAGES.server;
				result.isServerUnavailable = status === 502 || status === 503;
			} else {
				result.message = jsonMessage || DEFAULT_MESSAGES.unknown;
			}
	}

	// Dev diagnostics (never shown to users)
	if (import.meta.env.DEV) {
		console.warn(
			`[apiError]${contextHint ? ` (${contextHint})` : ''}: ` +
			`status=${status}, category=${result.category}, ` +
			`message="${result.message}"`,
			fieldErrors && Object.keys(fieldErrors).length ? fieldErrors : '',
		);
	}

	return result;
};

// ─── Convenience: get just the user-safe message string ───────────────────────

/**
 * Quick helper for components that only need the message string.
 * Replaces the old `getApiErrorMessage()` for new code.
 */
export const getSafeApiMessage = (error: unknown, contextHint?: string): string => {
	return normalizeApiError(error, contextHint).message;
};

/**
 * Check if an error indicates the backend is unavailable
 * (useful for showing "server unavailable" UI vs field-level errors).
 */
export const isBackendUnavailable = (error: unknown): boolean => {
	return normalizeApiError(error).isServerUnavailable;
};
