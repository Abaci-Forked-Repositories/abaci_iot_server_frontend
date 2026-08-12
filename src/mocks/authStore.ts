/**
 * Mock auth user for MSW when VITE_USE_MOCK_SERVICE=true.
 * Any non-empty username/password works on login.
 */
import { ALL_PERMISSIONS_TRUE } from '../types/permissions';

export const MOCK_ACCESS_TOKEN = 'mock-access-token-dev-only';
export const MOCK_REFRESH_TOKEN = 'mock-refresh-token-dev-only';

export function buildMockProfile(username = 'admin@abaci.test') {
	return {
		id: 1,
		email: username.includes('@') ? username : `${username}@abaci.test`,
		username: username.includes('@') ? username.split('@')[0] : username,
		first_name: 'Mock',
		last_name: 'Admin',
		user_status: 'ACTIVE',
		role: {
			id: 1,
			name: 'admin',
			description: 'Administrator (mock)',
		},
		page_permission: { ...ALL_PERMISSIONS_TRUE },
	};
}

export function buildMockLoginResponse(username: string) {
	const user = buildMockProfile(username);
	return {
		access: MOCK_ACCESS_TOKEN,
		refresh: MOCK_REFRESH_TOKEN,
		user,
	};
}
