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
	const refreshProfile = useCallback(async () => {
		restoreAuthTokenFromCookies();
		const response = await authAxios.get(PROFILE_URL);
		const profile = response.data?.user ?? response.data;
		setUser(profile?.email ?? '');
		setUserData(profile);
		setPermissions(profile?.page_permission ?? null);
	}, []);

	const setLogOut = useCallback(() => {
		publicAxios.post('api/auth/logout/').then(() => {
			navigate(adminExists ? '/login' : '/createsuperadmin');
			setUser('');
			setUserData({});
			setPermissions(null);
			clearAuthSession();
		}).catch((error: any) => {
			showErrorNotification(error);
		}).finally(() => {
			setLoading(false);
		});
	}, [adminExists]);

	/**
	 * On app boot / page refresh: restore token from cookies, then fetch profile.
	 * NOTE: useEffect here intentionally does NOT call refreshProfile() from the
	 * outer scope to avoid stale-closure issues. The fetch is inlined directly.
	 */
	useEffect(() => {
		if (location.pathname.includes('public')) {
			setLoading(false);
			return;
		}

		setAdminExists(true);

		const boot = async () => {
			try {
				restoreAuthTokenFromCookies();
				const response = await authAxios.get(PROFILE_URL);
				const profile = response.data?.user ?? response.data;
				setUser(profile?.email ?? '');
				setUserData(profile);
				setPermissions(profile?.page_permission ?? null);
			} catch (err: any) {
				console.error('[authContext] profile fetch failed:', err?.response?.status, err?.message);
				setUser('');
				setUserData({});
				setPermissions(null);
				clearAuthSession();
				navigate('/login');
			} finally {
				setLoading(false);
			}
		};

		boot();
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
