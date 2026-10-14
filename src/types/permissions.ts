export interface PagePermissions {
	dashboard_read: boolean;
	users_read: boolean;
	users_write: boolean;
	settings_read: boolean;
	settings_write: boolean;
	devices_read: boolean;
	devices_write: boolean;
	sites_read: boolean;
	sites_write: boolean;
	subscriptions_read: boolean;
	subscriptions_write: boolean;
}

/** Fallback used for admin/superuser accounts that have no explicit page_permission record. */
export const ALL_PERMISSIONS_TRUE: PagePermissions = {
	dashboard_read: true,
	users_read: true,
	users_write: true,
	settings_read: true,
	settings_write: true,
	devices_read: true,
	devices_write: true,
	sites_read: true,
	sites_write: true,
	subscriptions_read: true,
	subscriptions_write: true,
};
