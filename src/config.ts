/**
 * Feature flags. Mock service is for frontend-only work until backend APIs are ready.
 * Never ship production with VITE_USE_MOCK_SERVICE=true.
 */
export const USE_MOCK_SERVICE =
	String(import.meta.env.VITE_USE_MOCK_SERVICE || '').toLowerCase() === 'true';
