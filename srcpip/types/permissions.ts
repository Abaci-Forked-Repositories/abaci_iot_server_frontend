export interface PagePermissions {
	dashboard_read: boolean;
	queue_management_read: boolean;
	queue_management_write: boolean;
	serving_point_read: boolean;
	serving_point_write: boolean;
	schedules_read: boolean;
	schedules_write: boolean;
	users_read: boolean;
	users_write: boolean;
	screens_read: boolean;
	screens_write: boolean;
	templates_read: boolean;
	templates_write: boolean;
	settings_read: boolean;
	settings_write: boolean;
	controllers_read: boolean;
	controllers_write: boolean;
	token_users_read: boolean;
	token_users_write: boolean;
}

/** Fallback used for admin/superuser accounts that have no explicit page_permission record. */
export const ALL_PERMISSIONS_TRUE: PagePermissions = {
	dashboard_read: true,
	queue_management_read: true,
	queue_management_write: true,
	serving_point_read: true,
	serving_point_write: true,
	schedules_read: true,
	schedules_write: true,
	users_read: true,
	users_write: true,
	screens_read: true,
	screens_write: true,
	templates_read: true,
	templates_write: true,
	settings_read: true,
	settings_write: true,
	controllers_read: true,
	controllers_write: true,
	token_users_read: true,
	token_users_write: true,
};
