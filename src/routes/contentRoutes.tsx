import React, { lazy } from 'react';
import { allRoutesObject, pagesNotInSideBar } from './RoutesMenu';

const MAINROUTE = {
	Dashboard: lazy(() => import('../pages/Dashboard/Dashboard')),
	MediaFiles: lazy(() => import('../pages/MediaFiles/index')),
	QueueManagement: lazy(() => import('../pages/QueueManagement/index')),
	QueueManagementDetail: lazy(() => import('../pages/QueueManagement/Detail')),
	QueueManagementServingPoints: lazy(() => import('../pages/ServingPoints/index')),
	QueueManagementServingWindowDetail: lazy(() => import('../pages/ServingPoints/ServingWindowDetail')),
	QueueManagementServingPointDetail: lazy(() => import('../pages/ServingPoints/Detail')),
	ScheduleDetail: lazy(() => import('../pages/Schedules/Detail')),
	SchedulesList: lazy(() => import('../pages/Schedules/List')),
	Screens: lazy(() => import('../pages/Screens/index')),
	ScreenDetail: lazy(() => import('../pages/Screens/Detail')),
	Templates: lazy(() => import('../pages/Templates/index')),
	TemplateDetail: lazy(() => import('../pages/Templates/Detail')),
	Profile: lazy(() => import('../pages/Profile/Index')),
	Users: lazy(() => import('../pages/UserManagement/index')),
};
interface CustomRouteConfig {
	path: string;
	element: React.ReactNode;
	allowedTo?: string[]; // Custom property for role-based access control
}

const RouteConfig: CustomRouteConfig[] = [
	{
		path: allRoutesObject.dashboard.path,
		element: <MAINROUTE.Dashboard />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.mediafiles.path,
		element: <MAINROUTE.MediaFiles />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.queuemanagement.path,
		element: <MAINROUTE.QueueManagement />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.queueDetails.path,
		element: <MAINROUTE.QueueManagementDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.servingpoints.path,
		element: <MAINROUTE.QueueManagementServingPoints />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.servingwindowdetails.path,
		element: <MAINROUTE.QueueManagementServingWindowDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.servingpointdetails.path,
		element: <MAINROUTE.QueueManagementServingPointDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.scheduleslist.path,
		element: <MAINROUTE.SchedulesList />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.scheduledetails.path,
		element: <MAINROUTE.ScheduleDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.screens.path,
		element: <MAINROUTE.Screens />,
		allowedTo: ['ADMIN'],
	},
	{
		path: '/screens/:id',
		element: <MAINROUTE.ScreenDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.templates.path,
		element: <MAINROUTE.Templates />,
		allowedTo: ['ADMIN'],
	},
	{
		path: '/templates/:id',
		element: <MAINROUTE.TemplateDetail />,
		allowedTo: ['ADMIN'],
	},
	{
		path: pagesNotInSideBar.Profile.path,
		element: <MAINROUTE.Profile />,
		allowedTo: ['ADMIN'],
	},
	{
		path: allRoutesObject.usermanagement.path,
		element: <MAINROUTE.Users />,
		allowedTo: ['ADMIN'],
	},
];

export default RouteConfig;
