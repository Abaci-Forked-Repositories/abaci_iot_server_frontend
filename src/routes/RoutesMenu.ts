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
	usermanagement: {
		id: 'usermanagement',
		text: 'Users',
		icon: 'Person',
		path: '/users',
		subMenu: null,
		permissionKey: 'users_read',
	},
	userDetails: {
		id: 'userDetails',
		text: 'User',
		icon: 'Person',
		path: '/users/:userId',
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
	siteDetails: {
		id: 'siteDetails',
		text: 'Site',
		icon: 'Place',
		path: '/sites/:siteId',
		subMenu: null,
		permissionKey: 'sites_read',
	},
	subscriptions: {
		id: 'subscriptions',
		text: 'Subscriptions',
		icon: 'CardMembership',
		path: '/subscriptions',
		subMenu: null,
		permissionKey: 'subscriptions_read',
	},
	subscriptionDetails: {
		id: 'subscriptionDetails',
		text: 'Subscription',
		icon: 'CardMembership',
		path: '/subscriptions/:subscriptionId',
		subMenu: null,
		permissionKey: 'subscriptions_read',
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
	subscriptions: {
		id: 'subscriptions',
		text: 'Subscriptions',
		icon: 'CardMembership',
		path: '/subscriptions',
		subMenu: null,
		permissionKey: 'subscriptions_read',
	},
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
	SelfRegister: {
		id: 'SelfRegister',
		text: 'Register',
		path: 'register',
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
