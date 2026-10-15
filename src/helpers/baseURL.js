/**
 * Base URL for API requests.
 *
 * DEVELOPMENT:
 *   Returns '' (empty) so all /api requests are same-origin → Vite dev server
 *   proxy forwards them to the backend (avoids CORS since backend has no CORS headers).
 *
 * PRODUCTION:
 *   Returns '' (empty) because Django serves both the frontend static files
 *   AND the API from the same origin. All /api requests are same-origin → no CORS.
 *
 * If you ever deploy frontend and backend on DIFFERENT origins, set
 * VITE_API_BASE_URL in the .env file for that environment, AND ensure
 * the backend has CORS configured to allow the frontend origin.
 */
const baseURLFunc = () => {
	const fromEnv = import.meta.env.VITE_API_BASE_URL;
	if (fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '') {
		return String(fromEnv).replace(/\/$/, '');
	}

	// Same-origin by default — works for both dev (Vite proxy) and
	// production (Django serves frontend + API from same origin).
	return '';
};

export const baseURL = baseURLFunc();

const imageURLFunc = () => {
	const fromEnv = import.meta.env.VITE_API_BASE_URL;
	if (fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '') {
		return String(fromEnv).replace(/\/$/, '');
	}
	const url = window.location.origin.split(':3000')[0];
	if (import.meta.env.MODE === 'development') {
		return `${url}:8000`;
	}
	return url;
};
export const imageURL = imageURLFunc();

const baseURLCreator = () => {
	const url = window.location.origin.split(':3000')[0];
	if (import.meta.env.MODE === 'development') {
		return `${url}:3000`;
	}
	return url;
};

export const baseURLForFrontend = baseURLCreator();

const baseURLForSocketIO = () => {
	const fromEnv = import.meta.env.VITE_BACKEND_HOST_FOR_SOCKET_IO;
	if (fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '') {
		return String(fromEnv).replace(/\/$/, '');
	}
	// In production, WebSocket connects to the same origin (Django serves everything).
	return window.location.origin;
};
export const wsUrl = baseURLForSocketIO();
