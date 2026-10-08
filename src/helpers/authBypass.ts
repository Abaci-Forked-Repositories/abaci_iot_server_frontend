/**
 * Temporary local-only auth bypass for UI work when login/backend is unavailable.
 * Requires BOTH:
 *  - Vite development mode (`import.meta.env.DEV`)
 *  - `VITE_BYPASS_AUTH=true` in `.env.development`
 * Never enable in production builds.
 */
export const isAuthBypassEnabled = (): boolean =>
	Boolean(import.meta.env.DEV) &&
	String(import.meta.env.VITE_BYPASS_AUTH || '').toLowerCase() === 'true';

export const AUTH_BYPASS_USER = {
	username: 'dev-bypass',
	email: 'dev-bypass@local',
	first_name: 'Dev',
	last_name: 'Bypass',
	bypass: true,
};
