export const allRoutesObject = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
	},
	mediafiles: {
		id: 'mediafiles',
		text: 'Media Files',
		icon: 'Folder',
		path: '/media-files',
		subMenu: null,
	},
	queuemanagement: {
		id: 'queuemanagement',
		text: 'Queue Management',
		icon: 'Queue',
		path: '/queue-management',
		subMenu: null,
	},
	queueDetails: {
		id: 'queueDetail',
		text: 'Queue Detail',
		icon: 'Queue',
		path: '/queue-management/:queueId',
		subMenu: null,
	},
	servingpoints: {
		id: 'servingpoints',
		text: 'Serving Points',
		icon: 'Monitor',
		path: '/serving-points',
		subMenu: null,
	},
	servingpointdetails: {
		id: 'servingpointdetails',
		text: 'Serving Point Detail',
		icon: 'Monitor',
		path: '/serving-points/:servingPointId',
		subMenu: null,
	},
	screens: {
		id: 'screens',
		text: 'Screens',
		icon: 'SmartScreen',
		path: '/screens',
		subMenu: null,
	},
	templates: {
		id: 'templates',
		text: 'Templates',
		icon: 'ViewCompact',
		path: '/templates',
		subMenu: null,
	},
	usermanagement: {
		id: 'usermanagement',
		text: 'User Management',
		icon: 'Person',
		path: '/users',
		subMenu: null,
	},
	scheduledetails: {
		id: 'scheduledetails',
		text: 'Schedule Detail',
		icon: 'Calendar',
		path: '/queue-management/schedules/:scheduleId',
		subMenu: null,
	},
};

export const AdminRoutes = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
	},
	mediafiles: {
		id: 'mediafiles',
		text: 'Media Files',
		icon: 'Folder',
		path: '/media-files',
		subMenu: null,
	},
	queuemanagement: {
		id: 'queuemanagement',
		text: 'Queue Management',
		icon: 'Queue',
		path: '/queue-management',
		subMenu: null,
	},
	servingpoints: {
		id: 'servingpoints',
		text: 'Serving Points',
		icon: 'Monitor',
		path: '/serving-points',
		subMenu: null,
	},
	screens: {
		id: 'screens',
		text: 'Screens',
		icon: 'SmartScreen',
		path: '/screens',
		subMenu: null,
	},
	templates: {
		id: 'templates',
		text: 'Templates',
		icon: 'ViewCompact',
		path: '/templates',
		subMenu: null,
	},
	usermanagement: {
		id: 'usermanagement',
		text: 'User Management',
		icon: 'Person',
		path: '/users',
		subMenu: null,
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
