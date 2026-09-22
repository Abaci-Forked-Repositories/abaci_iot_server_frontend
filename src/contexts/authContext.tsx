import React, {
	createContext,
	FC,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAxios, publicAxios } from '../axiosInstance';
import { clearAuthSession, restoreAuthTokenFromCookies } from '../helpers/authSession';
import AbaciLoader from '../components/AbaciLoader/AbaciLoader';
import useToasterNotification from '../hooks/useToasterNotification';
import type { PagePermissions } from '../types/permissions';

export interface IAuthContextProps {
	user: string;
	setUser: (u: string) => void;
	userData: null | any;
	setUserData: (d: any) => void;
	permissions: PagePermissions | null;
	/** True when role.name === 'admin'. UI-only — does NOT bypass permission checks. */
	isAdmin: boolean;
	setLogOut: () => void;
	/**
	 * Fetches /api/users/profile/ and updates user, userData, and permissions.
	 * Call this after login — the login response does not include page_permission.
	 */
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}

const PROFILE_URL = 'api/users/profile/';

/** Routes that must work without a logged-in user (no profile fetch on boot). */
function shouldSkipAuthBoot(pathname: string): boolean {
	return (
		pathname.includes('public') ||
		pathname.startsWith('/screenstokenstatus') ||
		pathname === '/login' ||
		pathname === '/customer-login' ||
		pathname === '/licence_setup' ||
		pathname === '/createsuperadmin' ||
		pathname === '/admin_setup'
	);
}

export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<string>('');
	const [userData, setUserData] = useState<null | any>(null);
	const [permissions, setPermissions] = useState<PagePermissions | null>(null);
	const [adminExists, setAdminExists] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { showErrorNotification } = useToasterNotification();

	const isAdmin = useMemo(() => userData?.role?.name === 'admin', [userData]);

	/**
	 * Safety net: whenever userData changes (e.g. setUserData called from Login.jsx),
	 * sync permissions from the page_permission field if present.
	 */
	useEffect(() => {
		if (userData && userData.page_permission) {
			setPermissions(userData.page_permission);
		}
	}, [userData]);

	/** Fetch profile and apply all three pieces of state atomically. */
	// ─── Profile fetch commented out (no backend available) ───
	// To restore: uncomment the real API call below and remove the mock block.
	const refreshProfile = useCallback(async () => {
		// restoreAuthTokenFromCookies();
		// const response = await authAxios.get(PROFILE_URL);
		// const profile = response.data?.user ?? response.data;
		// setUser(profile?.email ?? '');
		// setUserData(profile);
		// setPermissions(profile?.page_permission ?? null);

		// Mock: keep current userData as-is (set by mock login)
		// If userData is empty, set a mock admin profile
		if (!userData || Object.keys(userData).length === 0) {
			const mockProfile = {
				email: 'admin@example.com',
				first_name: 'Admin',
				last_name: 'User',
				role: { id: 1, name: 'admin' },
				user_status: 'ACTIVE',
				page_permission: {
					dashboard_read: true,
					queue_management_read: true,
					queue_management_write: true,
					serving_point_read: true,
					serving_point_write: true,
					schedules_read: true,
					schedules_write: true,
					users_read: true,
					users_write: true,
					screens_read: true,
					screens_write: true,
					templates_read: true,
					templates_write: true,
					settings_read: true,
					settings_write: true,
					controllers_read: true,
					controllers_write: true,
					token_users_read: true,
					token_users_write: true,
					devices_read: true,
					devices_write: true,
					sites_read: true,
					sites_write: true,
				},
			};
			setUser(mockProfile.email);
			setUserData(mockProfile);
			setPermissions(mockProfile.page_permission);
		}
	}, [userData]);
	// ─────────────────────────────────────────────────────────────

	const setLogOut = useCallback(() => {
		// ─── Logout API call commented out (no backend available) ───
		// To restore: uncomment the real API call below and remove the mock block.
		// publicAxios.post('api/auth/logout/').then(() => {
		// 	navigate(adminExists ? '/login' : '/createsuperadmin');
		// 	setUser('');
		// 	setUserData({});
		// 	setPermissions(null);
		// 	clearAuthSession();
		// }).catch((error: any) => {
		// 	showErrorNotification(error);
		// }).finally(() => {
		// 	setLoading(false);
		// });

		// Mock: just clear session and navigate to login
		navigate('/login');
		setUser('');
		setUserData({});
		setPermissions(null);
		clearAuthSession();
		setLoading(false);
		// ──────────────────────────────────────────────────────────
	}, [adminExists]);

	/**
	 * On app boot / page refresh: restore token from cookies, then fetch profile.
	 * NOTE: useEffect here intentionally does NOT call refreshProfile() from the
	 * outer scope to avoid stale-closure issues. The fetch is inlined directly.
	 *
	 * ⚠️  Profile fetch commented out — no backend available.
	 *     On boot, we skip the API call and just mark loading=false so the app renders.
	 *     To restore: uncomment the boot() call and the try/catch block below.
	 */
	useEffect(() => {
		if (shouldSkipAuthBoot(location.pathname)) {
			setUserData({});
			setLoading(false);
			return;
		}

		setAdminExists(true);

		// ─── Profile fetch commented out (no backend available) ───
		// To restore: uncomment the boot() call below and remove the setLoading(false) line.
		//
		// const boot = async () => {
		// 	try {
		// 		restoreAuthTokenFromCookies();
		// 		const response = await authAxios.get(PROFILE_URL);
		// 		const profile = response.data?.user ?? response.data;
		// 		setUser(profile?.email ?? '');
		// 		setUserData(profile);
		// 		setPermissions(profile?.page_permission ?? null);
		// 	} catch (err: any) {
		// 		console.error('[authContext] profile fetch failed:', err?.response?.status, err?.message);
		// 		setUser('');
		// 		setUserData({});
		// 		setPermissions(null);
		// 		clearAuthSession();
		// 		if (!shouldSkipAuthBoot(location.pathname)) {
		// 			navigate('/login');
		// 		}
		// 	} finally {
		// 		setLoading(false);
		// 	}
		// };
		//
		// boot();
		// ─────────────────────────────────────────────────────────

		// No backend — skip profile fetch, set empty userData and let the app render
		// (userData must not stay null, otherwise ContentRoutes shows infinite AbaciLoader)
		setUserData({});
		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = useMemo(
		() => ({
			user,
			setUser,
			userData,
			setUserData,
			permissions,
			isAdmin,
			setLogOut,
			refreshProfile,
		}),
		[user, userData, permissions, isAdmin, setLogOut, refreshProfile],
	);

	if (loading) return <AbaciLoader />;

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthContextProvider.propTypes = {
	// @ts-ignore
	children: PropTypes.node.isRequired,
};

export default AuthContext;
