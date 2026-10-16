import React, { lazy } from 'react';
import { allRoutesObject, pagesNotInSideBar } from './RoutesMenu';
import type { PagePermissions } from '../types/permissions';

const MAINROUTE = {
	Dashboard: lazy(() => import('../pages/Dashboard/Dashboard')),
	
	
	Profile: lazy(() => import('../pages/Profile/Index')),
	Users: lazy(() => import('../pages/UserManagement/index')),
	UserDetail: lazy(() => import('../pages/UserManagement/UserDetail')),
	Devices: lazy(() => import('../pages/Devices/index')),
	DeviceDetail: lazy(() => import('../pages/Devices/DeviceDetail')),
	Sites: lazy(() => import('../pages/Sites/index')),
	SiteDetail: lazy(() => import('../pages/Sites/SiteDetail')),
	Subscriptions: lazy(() => import('../pages/Subscriptions/index')),
	SubscriptionDetail: lazy(() => import('../pages/Subscriptions/SubscriptionDetail')),
	Knowledge: lazy(() => import('../pages/Knowledge/index')),
	// Settings: lazy(() => import('../pages/Settings/index')),
};

export interface CustomRouteConfig {
	path: string;
	element: React.ReactNode;
	/** Permission key required to view this route. Undefined = public/always accessible. */
	permissionKey?: keyof PagePermissions;
}

const RouteConfig: CustomRouteConfig[] = [
	{
		path: allRoutesObject.dashboard.path,
		element: <MAINROUTE.Dashboard />,
		permissionKey: 'dashboard_read',
	},
	{
		path: pagesNotInSideBar.Profile.path,
		element: <MAINROUTE.Profile />,
		// Profile is accessible to all authenticated users
	},
	{
		path: allRoutesObject.usermanagement.path,
		element: <MAINROUTE.Users />,
		permissionKey: 'users_read',
	},
	{
		path: allRoutesObject.userDetails.path,
		element: <MAINROUTE.UserDetail />,
		permissionKey: 'users_read',
	},
	{
		path: allRoutesObject.devices.path,
		element: <MAINROUTE.Devices />,
		permissionKey: 'devices_read',
	},
	{
		path: allRoutesObject.deviceDetails.path,
		element: <MAINROUTE.DeviceDetail />,
		permissionKey: 'devices_read',
	},
	{
		path: allRoutesObject.sites.path,
		element: <MAINROUTE.Sites />,
		permissionKey: 'sites_read',
	},
	{
		path: allRoutesObject.siteDetails.path,
		element: <MAINROUTE.SiteDetail />,
		permissionKey: 'sites_read',
	},
	{
		path: allRoutesObject.subscriptions.path,
		element: <MAINROUTE.Subscriptions />,
		permissionKey: 'subscriptions_read',
	},
	{
		path: allRoutesObject.subscriptionDetails.path,
		element: <MAINROUTE.SubscriptionDetail />,
		permissionKey: 'subscriptions_read',
	},
	{
		path: allRoutesObject.knowledge.path,
		element: <MAINROUTE.Knowledge />,
	},

];

export default RouteConfig;
