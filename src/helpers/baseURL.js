const baseURLFunc = () => {
	const fromEnv = import.meta.env.VITE_API_BASE_URL;
	if (fromEnv !== undefined && fromEnv !== null && String(fromEnv).trim() !== '') {
		return String(fromEnv).replace(/\/$/, '');
	}

	const url = window.location.origin.split(':3000')[0];

	// Dev default: same-origin so Vite can proxy /api → remote backend (avoids CORS).
	if (import.meta.env.MODE === 'development') {
		return '';
	}
	return url;
};

export const baseURL = baseURLFunc();

const imageURLFunc = () => {
	const url = window.location.origin.split(':3000')[0];
	if (import.meta.env.MODE === 'development') {
		return `${url}:8000`;
	}
	return url;
};
export const imageURL = imageURLFunc();
// export const baseURL = 'https://envirol.abacitechs.com'
// export const baseURL = window.location.origin

const baseURLCreator = () => {
	const url = window.location.origin.split(':3000')[0];
	if (import.meta.env.MODE === 'development') {
		return `${url}:3000`;
	}
	return url;
};

export const baseURLForFrontend = baseURLCreator();

const baseURLForSocketIO = () => {
	const url = window.location.origin.split(':3000')[0];
	if (import.meta.env.MODE === 'development') {
		return import.meta.env.VITE_BACKEND_HOST_FOR_SOCKET_IO;
	}
	return url;
};
export const wsUrl = baseURLForSocketIO();
