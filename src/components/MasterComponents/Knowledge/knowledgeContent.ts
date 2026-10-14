export type KnowledgeTopicId =
	| 'overview'
	| 'devices'
	| 'device-groups'
	| 'dashboard'
	| 'sites'
	| 'users'
	| 'subscriptions';

export interface KnowledgeTerm {
	name: string;
	description: string;
}

export interface KnowledgeTip {
	title: string;
	text: string;
}

export interface KnowledgeTopic {
	id: KnowledgeTopicId;
	title: string;
	subtitle: string;
	icon: string;
	accent: 'primary' | 'info' | 'success' | 'warning';
	/** Main explanation of how this part of the project works */
	summary: string;
	/** Extra narrative paragraphs for flow / context */
	paragraphs?: string[];
	/** Ordered setup or usage steps */
	steps?: string[];
	/** Terms used in this area and what they are for */
	terms?: KnowledgeTerm[];
	tips?: KnowledgeTip[];
}

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
	{
		id: 'overview',
		title: 'Project flow',
		subtitle: 'How the whole system fits together',
		icon: 'AutoAwesome',
		accent: 'primary',
		summary:
			'Mini IOT Monitoring System is built around monitoring UPS/Inverter devices across multiple sites. You register devices, assign them to sites and groups, and the dashboard shows real-time telemetry — voltage, temperature, battery status, load, and alert conditions.',
		paragraphs: [
			'Start by creating Sites — the physical locations where your UPS/Inverter devices are installed (e.g., "Server Room A – Delhi", "Branch Office – Mumbai").',
			'Register Devices in the system. Each device represents a physical UPS/Inverter unit. The system automatically receives telemetry data including output voltage, battery voltage, temperature, load percentage, and GPIO pin states.',
			'The Dashboard gives you an aggregate view across all devices — min/max values, online/offline counts, and active alerts for short circuits or overloads.',
			'Drill into a specific device to see its real-time status, control digital output pins remotely, and view historical time-series charts for all parameters.',
			'Use Device Groups to logically organize devices (e.g., "All Server Room UPS units", "Critical Infrastructure").',
		],
		steps: [
			'Create sites for each physical location.',
			'Register devices and assign them to sites.',
			'Monitor the main dashboard for aggregate health status.',
			'Drill into device details for real-time data and charts.',
			'Use device groups to organize and filter devices.',
			'Manage users and subscriptions as needed.',
		],
		terms: [
			{
				name: 'Device',
				description:
					'A physical UPS/Inverter unit registered in the system. Each device reports telemetry data including voltage, temperature, battery, and GPIO states.',
			},
			{
				name: 'Site',
				description:
					'A physical location where devices are installed. Helps organize and filter devices by branch, office, or facility.',
			},
			{
				name: 'Dashboard',
				description:
					'The main overview screen showing aggregate statistics and alert counts across all devices and sites.',
			},
			{
				name: 'GPIO',
				description:
					'General Purpose Input/Output pins on the device. Digital inputs read sensor states; digital outputs can be toggled remotely.',
			},
			{
				name: 'Alert',
				description:
					'Critical conditions detected on a device: short circuit, overload, or fan failure. Shown prominently on the dashboard.',
			},
		],
	},
	{
		id: 'devices',
		title: 'Devices',
		subtitle: 'Registering and monitoring UPS/Inverter units',
		icon: 'Devices',
		accent: 'primary',
		summary:
			'A device represents a physical UPS or Inverter in the field. Once registered, it reports live telemetry — output voltage, battery voltage, temperature, load %, charging status, and GPIO pin states.',
		paragraphs: [
			'Add a device with its model, identifier, serial number, and WiFi configuration. The system will begin receiving data from the hardware unit automatically.',
			'Each device detail page shows a real-time monitor panel with current values, alert indicators, and controllable digital outputs. Historical charts show parameter trends over time.',
			'You can remotely toggle digital output pins (GPIO) to turn connected equipment on or off without visiting the site physically.',
		],
		steps: [
			'Go to Devices → add a device.',
			'Fill model, identifier, serial number, and description.',
			'Optionally configure WiFi settings (IP, SSID, gateway).',
			'Save — the device begins reporting telemetry automatically.',
			'Open device detail to monitor live data and control outputs.',
		],
		terms: [
			{
				name: 'Model',
				description: 'The UPS/Inverter model name or number (e.g., "APC Smart-UPS 3000").',
			},
			{
				name: 'Identifier',
				description: 'A unique label to recognize this device in lists and dashboards.',
			},
			{
				name: 'Serial number',
				description: 'Hardware serial number for warranty and tracking purposes.',
			},
			{
				name: 'WiFi config',
				description: 'Network settings (IP, mask, gateway, SSID, password) for the device connection.',
			},
			{
				name: 'Firmware version',
				description: 'Current firmware version running on the device.',
			},
		],
		tips: [
			{
				title: 'Use consistent naming',
				text: 'Name devices with location + purpose (e.g., "Delhi-ServerRoom-UPS1") so they are easy to find in the dashboard.',
			},
		],
	},
	{
		id: 'device-groups',
		title: 'Device groups',
		subtitle: 'Organising related devices',
		icon: 'FolderOpen',
		accent: 'info',
		summary:
			'Device groups let you organize devices into logical collections. They do not change how devices report data; they only make large setups easier to navigate and filter.',
		paragraphs: [
			'Create a group, give it a name, and add devices. You can move devices in or out of a group later without re-registering them.',
			'Use groups when you have many devices under the same department, location, or criticality level (for example "Critical UPS", "Branch Office Devices").',
		],
		terms: [
			{
				name: 'Group name',
				description: 'Title of the collection shown in the Device Groups tab.',
			},
			{
				name: 'Description',
				description: 'Optional explanation of why these devices are grouped.',
			},
			{
				name: 'Member devices',
				description: 'Devices belonging to this group. Membership is for browsing and management only.',
			},
		],
	},
	{
		id: 'dashboard',
		title: 'Dashboard',
		subtitle: 'Real-time monitoring overview',
		icon: 'Dashboard',
		accent: 'warning',
		summary:
			'The main dashboard shows an aggregate view of all devices across all sites. It displays summary statistics, alert counts, and min/max ranges for key parameters like voltage, temperature, and battery level.',
		paragraphs: [
			'Statistics cards show total, online, and offline device counts, plus user and site totals.',
			'The monitor panel shows aggregate min/max values for output voltage, battery voltage, temperature, and load percentage across all devices.',
			'Alert indicators show the number of devices currently experiencing short circuits or overloads — these require immediate attention.',
			'Digital GPIO summary shows how many inputs/outputs are currently on vs off across all devices.',
		],
		steps: [
			'Open the Dashboard from the sidebar.',
			'Review statistics cards for high-level counts.',
			'Check the monitor panel for min/max parameter ranges.',
			'Look for alert indicators (short circuit, overload).',
			'Click into a device for detailed real-time data.',
		],
		terms: [
			{
				name: 'Min/Max range',
				description:
					'The lowest and highest values observed across all devices for a parameter. Useful to spot outliers.',
			},
			{
				name: 'Online / Offline',
				description: 'Whether a device is currently connected and reporting data.',
			},
			{
				name: 'Short circuit count',
				description: 'Number of devices currently detecting a short circuit condition.',
			},
			{
				name: 'Overload count',
				description: 'Number of devices currently operating beyond their rated load capacity.',
			},
		],
		tips: [
			{
				title: 'Watch the alerts',
				text: 'Short circuit and overload alerts indicate conditions that can damage equipment. Investigate immediately when these appear.',
			},
		],
	},
	{
		id: 'sites',
		title: 'Sites',
		subtitle: 'Physical locations for devices',
		icon: 'Place',
		accent: 'success',
		summary:
			'Sites represent the physical locations where your UPS/Inverter devices are installed. Organizing devices by site makes it easy to monitor specific branches, offices, or facilities.',
		paragraphs: [
			'Create a site with a name and optional description. Then assign devices to that site when registering them.',
			'Sites help filter the dashboard and device lists — you can quickly see all devices at a specific location and their health status.',
		],
		steps: [
			'Go to Sites → add a site.',
			'Enter name (e.g., "Mumbai Branch") and description.',
			'Assign devices to the site from the Devices page.',
		],
		terms: [
			{
				name: 'Site name',
				description: 'Human-readable location label (e.g., "Delhi Data Center", "Chennai Office").',
			},
			{
				name: 'Description',
				description: 'Optional notes about the site — address, contact, or special instructions.',
			},
		],
	},
	{
		id: 'users',
		title: 'Users',
		subtitle: 'Staff and administrator accounts',
		icon: 'Person',
		accent: 'info',
		summary:
			'User accounts control who can access the system. Administrators can create, edit, and deactivate users, and assign roles that determine which modules each user can view or modify.',
		paragraphs: [
			'Each user has a username, email, and role-based permissions. Superusers have full access to all modules.',
			'Permissions are page-level — each module (Dashboard, Devices, Sites, etc.) can have separate read and write permissions per user role.',
		],
		terms: [
			{
				name: 'Superuser',
				description: 'A user with full administrative access to all modules and settings.',
			},
			{
				name: 'Role',
				description: 'A named set of permissions that can be assigned to users (e.g., "Viewer", "Operator", "Admin").',
			},
			{
				name: 'Active / Inactive',
				description: 'Whether the user account is currently enabled. Inactive users cannot log in.',
			},
		],
	},
	{
		id: 'subscriptions',
		title: 'Subscriptions',
		subtitle: 'License and subscription management',
		icon: 'CardMembership',
		accent: 'warning',
		summary:
			'Subscriptions track the licensing status for the system. Each subscription is tied to a user and defines the service period (start and end dates).',
		paragraphs: [
			'Subscriptions are typically managed during system activation and renewal. The license determines how many devices can be registered and what features are available.',
			'Check the subscription list to see active and expired licenses, and their associated user accounts.',
		],
		terms: [
			{
				name: 'Start date',
				description: 'When the subscription becomes active.',
			},
			{
				name: 'End date',
				description: 'When the subscription expires. After this date, features may be restricted.',
			},
			{
				name: 'Associated user',
				description: 'The user account that owns this subscription.',
			},
		],
	},
];

export const KNOWLEDGE_FLOW = [
	{ id: 'site', label: 'Site', icon: 'Place' },
	{ id: 'device', label: 'Device', icon: 'Devices' },
	{ id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
	{ id: 'monitor', label: 'Monitor', icon: 'Monitor' },
	{ id: 'alert', label: 'Alerts', icon: 'Warning' },
] as const;
