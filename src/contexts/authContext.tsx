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
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAxios, publicAxios } from '../axiosInstance';
import AbaciLoader from '../components/AbaciLoader/AbaciLoader';
import useToasterNotification from '../hooks/useToasterNotification';

export interface IAuthContextProps {
	user: any;
	setUser?(...args: unknown[]): unknown;
	userData: null | any;
	setUserData: null | any;
	setLogOut: null | any;
}

const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

interface IAuthContextProviderProps {
	children: ReactNode;
}

// interface SystemStatusResponse {
// 	details: {
// 		admin_users_exist: boolean;
// 	};
// 	license: {
// 		is_valid: boolean;
// 		unique_id: string;
// 		registration_date: string;
// 		expiry_date: string;
// 		expiration_timestamp: number;
// 		version: string;
// 		features: string[];
// 	};
// }
export const AuthContextProvider: FC<IAuthContextProviderProps> = ({ children }) => {
	//test purpose
	// const [user, setUser] = useState<string>('admin@gmail.com');
	// const [userData, setUserData] = useState<null | any>({
	// 	role: 'ADMIN',
	// 	full_name: 'Anugrah',
	// 	email: 'admin@gmail.com',
	// });
	// const [loading, setLoading] = useState(false);

	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<string>('');
	const [userData, setUserData] = useState<null | any>(null);
	const [adminExists, setAdminExists] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const { showErrorNotification } = useToasterNotification();
	const setLogOut = useCallback(() => {
		publicAxios.post('api/auth/logout/').then(() => {
			if (adminExists) {
				navigate('/login');
			} else {
				navigate('/createsuperadmin');
			}
			setUser('');
			setUserData({});
			Cookies.remove('socketIOToken');
			Cookies.remove('refreshToken');
			Cookies.remove('accessToken');
		}).catch((error: any) => {
			showErrorNotification(error);
		}).finally(() => {
			setLoading(false);
		});
	}, [adminExists]);

	// System status check is intentionally disabled for now.
	// const fetchSystemCheck = async () => {
	// 	try {
	// 		const url = 'api/systems/status/';
	// 		const res = await publicAxios.get<SystemStatusResponse>(url);
	// 		const { license } = res.data;
	// 		const tempAdminExists = res.data.details.admin_users_exist;
	// 		if (!license || !license.is_valid) {
	// 			navigate('/licence_setup', { replace: true });
	// 			return;
	// 		}
	// 		if (!tempAdminExists) {
	// 			navigate('/createsuperadmin');
	// 		} else if (tempAdminExists && location.pathname.includes('/createsuperadmin')) {
	// 			navigate('/login');
	// 		}
	// 		setAdminExists(tempAdminExists);
	// 		return tempAdminExists;
	// 	} catch (error) {
	// 		console.error('Error fetching system status:', error);
	// 		return null;
	// 	}
	// };

	useEffect(() => {
		const fetchData = async () => {
			// const adminExistsResult = await fetchSystemCheck();
			const adminExistsResult = true;
			setAdminExists(true);

			try {
				const url = 'api/users/profile';
				const response = await authAxios.get(url);
				setUser(response.data.user.email);
				setUserData(response.data.user);
			} catch (error: any) {
				console.error('Error fetching user profile:', error);
				if (adminExistsResult) {
					navigate('/login');
				} else if (error?.code === 'ERR_NETWORK') {
					navigate('/login');
				}
				else {
					navigate('/createsuperadmin');
				}
				setUser('');
				setUserData({});
				// setUser('admin@gmail.com');
				// setUserData({
				// 	role: 'ADMIN',
				// 	full_name: 'Anugrah',
				// 	email: 'admin@gmail.com',
				// });
				Cookies.remove('socketIOToken');
				Cookies.remove('refreshToken');
				Cookies.remove('accessToken');
			} finally {
				setLoading(false);
			}
		};

		if (!location.pathname.includes('public')) {
			fetchData();
		} else {
			setLoading(false);
		}
	}, []);

	const value = useMemo(
		() => ({
			user,
			setUser,
			userData,
			setUserData,
			setLogOut,
		}),
		[user, userData, setLogOut],
	);

	if (loading) return <AbaciLoader />;

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

//
AuthContextProvider.propTypes = {
	// @ts-ignore
	children: PropTypes.node.isRequired,
};

export default AuthContext;
