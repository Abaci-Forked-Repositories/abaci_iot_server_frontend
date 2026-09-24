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
import { clearAuthSession, restoreAuthTokenFromCookies } from '../helpers/authSession';
import AbaciLoader from '../components/AbaciLoader/AbaciLoader';
import useToasterNotification from '../hooks/useToasterNotification';
import type { PagePermissions } from '../types/permissions';
import { getProfile, logout as logoutApi } from '../api/auth/auth';

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
	const navigate = useNavigate();
	const location = useLocation();
	const { showErrorNotification } = useToasterNotification();

	const isAdmin = useMemo(() => userData?.role?.name === 'admin', [userData]);

	/**
	 * Safety net: whenever userData changes (e.g. setUserData called from Login),
	 * sync permissions from the page_permission field if present.
	 */
	useEffect(() => {
		if (userData && userData.page_permission) {
			setPermissions(userData.page_permission);
		}
	}, [userData]);

	const applyProfile = useCallback((profile: any) => {
		setUser(profile?.email ?? profile?.username ?? '');
		setUserData(profile);
		setPermissions(profile?.page_permission ?? null);
	}, []);

	const refreshProfile = useCallback(async () => {
		restoreAuthTokenFromCookies();
		const profile = await getProfile();
		applyProfile(profile);
	}, [applyProfile]);

	const clearLocalSession = useCallback(() => {
		setUser('');
		setUserData({});
		setPermissions(null);
		clearAuthSession();
	}, []);

	const setLogOut = useCallback(() => {
		restoreAuthTokenFromCookies();
		logoutApi()
			.catch((error: any) => {
				// Still clear local session if the API fails (e.g. expired token)
				if (error?.response?.status !== 401 && error?.response?.status !== 403) {
					showErrorNotification(error);
				}
			})
			.finally(() => {
				clearLocalSession();
				navigate('/login');
				setLoading(false);
			});
	}, [clearLocalSession, navigate, showErrorNotification]);

	/**
	 * On app boot / page refresh: restore token from cookies, then fetch profile.
	 */
	useEffect(() => {
		if (shouldSkipAuthBoot(location.pathname)) {
			setUserData({});
			setLoading(false);
			return;
		}

		const boot = async () => {
			try {
				const token = restoreAuthTokenFromCookies();
				if (!token) {
					clearLocalSession();
					navigate('/login');
					return;
				}
				const profile = await getProfile();
				applyProfile(profile);
			} catch (err: any) {
				console.error(
					'[authContext] profile fetch failed:',
					err?.response?.status,
					err?.message,
				);
				clearLocalSession();
				if (!shouldSkipAuthBoot(location.pathname)) {
					navigate('/login');
				}
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
