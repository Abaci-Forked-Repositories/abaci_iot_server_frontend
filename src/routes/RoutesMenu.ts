import type { PagePermissions } from '../types/permissions';

export interface RouteMenuItem {
	id: string;
	text: string;
	path: string;
	icon: string;
	subMenu: null;
	/** Permission key required to see/access this item. Undefined = always visible. */
	permissionKey?: keyof PagePermissions;
}

export const allRoutesObject: Record<string, RouteMenuItem & { path: string }> = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
		permissionKey: 'dashboard_read',
	},
	queuemanagement: {
		id: 'queuemanagement',
		text: 'Queue Management',
		icon: 'Queue',
		path: '/queue-management',
		subMenu: null,
		permissionKey: 'queue_management_read',
	},
	queueDetails: {
		id: 'queueDetail',
		text: 'Queue Detail',
		icon: 'Queue',
		path: '/queue-management/:queueId',
		subMenu: null,
		permissionKey: 'queue_management_read',
	},
	servingpoints: {
		id: 'servingpoints',
		text: 'Serving Points',
		icon: 'Monitor',
		path: '/serving-points',
		subMenu: null,
		permissionKey: 'serving_point_read',
	},
	tokenusers: {
		id: 'tokenusers',
		text: 'Token Users',
		icon: 'Person',
		path: '/token-users',
		subMenu: null,
		permissionKey: 'token_users_read',
	},
	tokenuserdetails: {
		id: 'tokenuserdetails',
		text: 'Token User Detail',
		icon: 'Person',
		path: '/token-users/:userId',
		subMenu: null,
		permissionKey: 'token_users_read',
	},
	servingwindowdetails: {
		id: 'servingwindowdetails',
		text: 'Serving Window Detail',
		icon: 'Monitor',
		path: '/serving-points/:servingPointId/windows/:windowId',
		subMenu: null,
		permissionKey: 'serving_point_read',
	},
	servingpointdetails: {
		id: 'servingpointdetails',
		text: 'Serving Point Detail',
		icon: 'Monitor',
		path: '/serving-points/:servingPointId',
		subMenu: null,
		permissionKey: 'serving_point_read',
	},
	screens: {
		id: 'screens',
		text: 'Screens',
		icon: 'SmartScreen',
		path: '/screens',
		subMenu: null,
		permissionKey: 'screens_read',
	},
	templates: {
		id: 'templates',
		text: 'Templates',
		icon: 'ViewCompact',
		path: '/templates',
		subMenu: null,
		permissionKey: 'templates_read',
	},
	usermanagement: {
		id: 'usermanagement',
		text: 'Users',
		icon: 'Person',
		path: '/users',
		subMenu: null,
		permissionKey: 'users_read',
	},
	devices: {
		id: 'devices',
		text: 'Devices',
		icon: 'Devices',
		path: '/devices',
		subMenu: null,
		permissionKey: 'devices_read',
	},
	deviceDetails: {
		id: 'deviceDetails',
		text: 'Device Dashboard',
		icon: 'Devices',
		path: '/devices/:deviceId',
		subMenu: null,
		permissionKey: 'devices_read',
	},
	sites: {
		id: 'sites',
		text: 'Sites',
		icon: 'Place',
		path: '/sites',
		subMenu: null,
		permissionKey: 'sites_read',
	},
	scheduledetails: {
		id: 'scheduledetails',
		text: 'Schedule Detail',
		icon: 'Calendar',
		path: '/queue-management/schedules/:scheduleId',
		subMenu: null,
		permissionKey: 'schedules_read',
	},
	scheduleslist: {
		id: 'scheduleslist',
		text: 'Schedules',
		icon: 'Event',
		path: '/schedules',
		subMenu: null,
		permissionKey: 'schedules_read',
	},
	knowledge: {
		id: 'knowledge',
		text: 'Knowledge',
		icon: 'MenuBook',
		path: '/knowledge',
		subMenu: null,
	},
	settings: {
		id: 'settings',
		text: 'Settings',
		icon: 'Settings',
		path: '/settings',
		subMenu: null,
		permissionKey: 'settings_read',
	},
};

/**
 * Sidebar-visible routes (excludes detail/sub-pages that don't appear in the nav).
 * Each entry has a permissionKey so the sidebar can filter by the user's permissions.
 */
export const AdminRoutes: Record<string, RouteMenuItem> = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
		permissionKey: 'dashboard_read',
	},
	// ─── Commented out sidebar items (not needed yet) ───
	// queuemanagement: {
	// 	id: 'queuemanagement',
	// 	text: 'Queue Management',
	// 	icon: 'Queue',
	// 	path: '/queue-management',
	// 	subMenu: null,
	// 	permissionKey: 'queue_management_read',
	// },
	// servingpoints: {
	// 	id: 'servingpoints',
	// 	text: 'Serving Points',
	// 	icon: 'Monitor',
	// 	path: '/serving-points',
	// 	subMenu: null,
	// 	permissionKey: 'serving_point_read',
	// },
	// tokenusers: {
	// 	id: 'tokenusers',
	// 	text: 'Token Users',
	// 	icon: 'Person',
	// 	path: '/token-users',
	// 	subMenu: null,
	// 	permissionKey: 'token_users_read',
	// },
	// schedules: {
	// 	id: 'schedules',
	// 	text: 'Schedules',
	// 	icon: 'Event',
	// 	path: '/schedules',
	// 	subMenu: null,
	// 	permissionKey: 'schedules_read',
	// },
	// screens: {
	// 	id: 'screens',
	// 	text: 'Screens',
	// 	icon: 'SmartScreen',
	// 	path: '/screens',
	// 	subMenu: null,
	// 	permissionKey: 'screens_read',
	// },
	// templates: {
	// 	id: 'templates',
	// 	text: 'Templates',
	// 	icon: 'ViewCompact',
	// 	path: '/templates',
	// 	subMenu: null,
	// 	permissionKey: 'templates_read',
	// },
	// ────────────────────────────────────────────────────
	usermanagement: {
		id: 'usermanagement',
		text: 'Users',
		icon: 'Person',
		path: '/users',
		subMenu: null,
		permissionKey: 'users_read',
	},
	devices: {
		id: 'devices',
		text: 'Devices',
		icon: 'Devices',
		path: '/devices',
		subMenu: null,
		permissionKey: 'devices_read',
	},
	sites: {
		id: 'sites',
		text: 'Sites',
		icon: 'Place',
		path: '/sites',
		subMenu: null,
		permissionKey: 'sites_read',
	},
	// ─── Commented out sidebar items (not needed yet) ───
	// knowledge: {
	// 	id: 'knowledge',
	// 	text: 'Knowledge',
	// 	icon: 'MenuBook',
	// 	path: '/knowledge',
	// 	subMenu: null,
	// },
	// settings: {
	// 	id: 'settings',
	// 	text: 'Settings',
	// 	icon: 'Settings',
	// 	path: '/settings',
	// 	subMenu: null,
	// 	permissionKey: 'settings_read',
	// },
	// ────────────────────────────────────────────────────
};

export const pagesNotInSideBar = {
	Profile: {
		id: 'Profile',
		text: 'Profile',
		path: 'profile',
		icon: 'Login',
	},
	login: {
		id: 'login',
		text: 'Login',
		path: 'login',
		icon: 'Login',
	},
	Register: {
		id: 'Register',
		text: 'Login',
		path: 'public/activation/:string',
		icon: 'Login',
	},
	ForgotPassword: {
		id: 'ForgotPassword',
		text: 'ForgotPassword',
		path: 'public/forgotpassword',
		icon: 'Login',
	},
	PrivacyPolicy: {
		id: 'Privacy Policy',
		text: 'Privacy Policy',
		path: 'public/privacypolicy',
		icon: 'Login',
	},
	TermsAndConditions: {
		id: 'Terms & Conditions',
		text: 'Terms & Conditions',
		path: 'public/termsofuse',
		icon: '',
	},
	AdminSetup: {
		id: 'Admin Setup',
		text: 'Admin Setup',
		path: '/admin_setup',
		icon: 'Login',
	},
	LicenceSetup: {
		id: 'Licence Setup',
		text: 'Licence Setup',
		path: '/licence_setup',
	},
};
