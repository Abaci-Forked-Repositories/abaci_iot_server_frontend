import React, {  useContext} from 'react';
import Brand from '../Brand/Brand';
import Navigation, { NavigationLine } from '../Navigation/Navigation';
import User from '../User/User';
import ThemeContext from '../../contexts/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from './Aside';
import AuthContext from '../../contexts/authContext';
import { AdminRoutes } from '../../routes/RoutesMenu';


const userTypeMenuObjects:any = {
	'ADMIN':AdminRoutes,
	// 'User':UserRoutes,
}

const MainSidebar = () => {
	const {userData} = useContext(AuthContext)
	const { asideStatus, setAsideStatus ,} = useContext(ThemeContext);
	return (
		<Aside >
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} isDark={true} />
			</AsideHead>
			<AsideBody>					
		    <Navigation menu={userTypeMenuObjects[userData?.role] || {}} id='aside-dashboard'  className='user-select-none' />
			<NavigationLine />
			</AsideBody>
			<AsideFoot>
				<User />
			</AsideFoot>
		</Aside>
	);
};

export default MainSidebar;
