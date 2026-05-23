import React, { lazy } from 'react';
import { allRoutesObject, pagesNotInSideBar } from './RoutesMenu';
import type { PagePermissions } from '../types/permissions';

const MAINROUTE = {
	Dashboard: lazy(() => import('../pages/Dashboard/Dashboard')),
	QueueManagement: lazy(() => import('../pages/QueueManagement/index')),
	QueueManagementDetail: lazy(() => import('../pages/QueueManagement/Detail')),
	QueueManagementServingPoints: lazy(() => import('../pages/ServingPoints/index')),
	QueueManagementServingWindowDetail: lazy(() => import('../pages/ServingPoints/ServingWindowDetail')),
	QueueManagementServingPointDetail: lazy(() => import('../pages/ServingPoints/Detail')),
	TokenUsers: lazy(() => import('../pages/TokenUsers/TokenUsers')),
	TokenUserDetail: lazy(() => import('../pages/TokenUsers/TokenUserDetail')),
	ScheduleDetail: lazy(() => import('../pages/Schedules/Detail')),
	SchedulesList: lazy(() => import('../pages/Schedules/List')),
	Screens: lazy(() => import('../pages/Screens/index')),
	ScreenDetail: lazy(() => import('../pages/Screens/Detail')),
	Templates: lazy(() => import('../pages/Templates/index')),
	TemplateDetail: lazy(() => import('../pages/Templates/Detail')),
	Profile: lazy(() => import('../pages/Profile/Index')),
	Users: lazy(() => import('../pages/UserManagement/index')),
	Settings: lazy(() => import('../pages/Settings/index')),
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
		path: allRoutesObject.queuemanagement.path,
		element: <MAINROUTE.QueueManagement />,
		permissionKey: 'queue_management_read',
	},
	{
		path: allRoutesObject.queueDetails.path,
		element: <MAINROUTE.QueueManagementDetail />,
		permissionKey: 'queue_management_read',
	},
	{
		path: allRoutesObject.servingpoints.path,
		element: <MAINROUTE.QueueManagementServingPoints />,
		permissionKey: 'serving_point_read',
	},
	{
		path: allRoutesObject.servingwindowdetails.path,
		element: <MAINROUTE.QueueManagementServingWindowDetail />,
		permissionKey: 'serving_point_read',
	},
	{
		path: allRoutesObject.servingpointdetails.path,
		element: <MAINROUTE.QueueManagementServingPointDetail />,
		permissionKey: 'serving_point_read',
	},
	{
		path: allRoutesObject.scheduleslist.path,
		element: <MAINROUTE.SchedulesList />,
		permissionKey: 'schedules_read',
	},
	{
		path: allRoutesObject.tokenusers.path,
		element: <MAINROUTE.TokenUsers />,
		permissionKey: 'token_users_read',
	},
	{
		path: allRoutesObject.tokenuserdetails.path,
		element: <MAINROUTE.TokenUserDetail />,
		permissionKey: 'token_users_read',
	},
	{
		path: allRoutesObject.scheduledetails.path,
		element: <MAINROUTE.ScheduleDetail />,
		permissionKey: 'schedules_read',
	},
	{
		path: allRoutesObject.screens.path,
		element: <MAINROUTE.Screens />,
		permissionKey: 'screens_read',
	},
	{
		path: '/screens/:id',
		element: <MAINROUTE.ScreenDetail />,
		permissionKey: 'screens_read',
	},
	{
		path: allRoutesObject.templates.path,
		element: <MAINROUTE.Templates />,
		permissionKey: 'templates_read',
	},
	{
		path: '/templates/:id',
		element: <MAINROUTE.TemplateDetail />,
		permissionKey: 'templates_read',
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
		path: allRoutesObject.settings.path,
		element: <MAINROUTE.Settings />,
		permissionKey: 'settings_read',
	},
];

export default RouteConfig;
