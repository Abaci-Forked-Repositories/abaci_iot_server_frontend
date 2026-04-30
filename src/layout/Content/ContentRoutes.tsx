import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorPage from '../../pages/PublicPages/ErrorPage';
import Login from '../../pages/Auth/Login';
import Registration from '../../pages/Auth/Registration';
import AuthContext from '../../contexts/authContext';
import Unauthorized from '../../pages/PublicPages/Unauthorized';
import AbaciLoader from '../../components/AbaciLoader/AbaciLoader';
import RouteConfig from '../../routes/contentRoutes';
import ProtectedRoute from './ProtectedRoute';
import Activation from '../../pages/Auth/CreateOrganization';
import CustomerLogin from '../../pages/Auth/Login'
import AdminSetup from '../../pages/Auth/AdminSetup';
import LicenceSetup from '../../pages/Auth/LicenceSetup';
const ContentRoutes = () => {
	const { userData } = useContext(AuthContext);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		if (userData !== null || window.location.pathname.startsWith('/public')) {
			setIsLoading(false);
		}
	}, [userData]);

	if (isLoading) {
		return <AbaciLoader />;
	}

	return (
		<Routes>
			{/* Public Routes */}
			<Route path='/login' element={<Login />} />
			<Route path='/admin_setup' element={<AdminSetup />} />
			<Route path='/customer-login' element={<CustomerLogin />} />
			<Route path='/createsuperadmin' element={<Activation />} />
			<Route path='/public/activation/:string' element={<Registration />} />
			<Route path='/public/error' element={<ErrorPage />} />
			<Route path='/licence_setup' element={<LicenceSetup />} />
			{/* Protected Routes */}
			{RouteConfig.map((page: any) => {
				if (page.allowedTo) {
					if (userData && page.allowedTo?.includes(userData?.role)) {
						return (
							<Route
								path={page.path}
								element={<ProtectedRoute element={page.element} />}
								key={page.path}
							/>
						);
					}
					return <Route path={page.path} element={<Unauthorized />} key={page.path} />;
				}
				return <Route path={page.path} element={page.element} key={page.path} />;
			})}
			<Route path='*' element={<Navigate to='/public/error' />} />
		</Routes>
	);
};

export default ContentRoutes;
