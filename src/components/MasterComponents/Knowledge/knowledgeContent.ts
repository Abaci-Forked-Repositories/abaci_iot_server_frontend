export type KnowledgeTopicId =
	| 'overview'
	| 'queues'
	| 'queue-groups'
	| 'schedules'
	| 'serving-points'
	| 'next-queue'
	| 'tokens'
	| 'token-users'
	| 'screens'
	| 'templates';

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
			'ABACI Queue Management is built around a simple daily flow: you set up service lines, decide when they are open, assign counters to serve customers, issue tokens, and optionally move a customer to another service when the first step is done.',
		paragraphs: [
			'Start in Queue Management. Create the queues your organisation needs (for example Reception, Consultation, Billing). If you have many queues, put related ones into queue groups so the list stays easy to browse.',
			'Each queue needs schedules — the time ranges when that queue can issue and serve tokens. Without a schedule, the queue has no active working window for the day.',
			'Serving points are the counters or desks. You can link one serving point to several queues at once, so the same counter can serve more than one line. When a serving point is linked to a schedule, serving windows appear; staff open a window to call and complete tokens.',
			'Customers (token users) receive tokens for a queue/schedule. Public screens show waiting and called tokens using templates you design.',
			'If a customer must visit more than one service, configure Next Queue on the first queue. When service is completed, staff can send the customer into the next queue with a new token.',
		],
		steps: [
			'Create queues (and groups if needed).',
			'Add schedules for the times each queue should run.',
			'Create serving points and link them to the right queues and schedules.',
			'Issue or accept tokens, then serve them from serving windows.',
			'Optionally complete into a next queue for multi-step journeys.',
			'Use Screens + Templates so visitors can see called numbers in the lobby.',
		],
		terms: [
			{
				name: 'Queue',
				description:
					'A service line people wait in. Everything else (schedules, tokens, next-queue links) hangs off a queue.',
			},
			{
				name: 'Schedule',
				description:
					'A start–end time window for a queue. It defines when tokens can be issued and when counters can serve that queue.',
			},
			{
				name: 'Serving point',
				description:
					'A physical or logical counter. One serving point can handle multiple queues in the same period.',
			},
			{
				name: 'Serving window',
				description:
					'The working slot for a serving point under a schedule. Day-to-day call / serve / complete actions happen here.',
			},
			{
				name: 'Token',
				description:
					'The ticket number given to a customer for a specific queue and schedule (e.g. A015).',
			},
			{
				name: 'Next queue',
				description:
					'A follow-up queue configured on a queue so staff can move a customer to the next service after completing the current one.',
			},
		],
	},
	{
		id: 'queues',
		title: 'Queues',
		subtitle: 'Creating a service line and its settings',
		icon: 'Queue',
		accent: 'primary',
		summary:
			'A queue is where you define the service itself. When you add a queue, you choose how tokens are numbered, how many can be issued, whether customers may postpone, and which counters or follow-up queues are connected.',
		paragraphs: [
			'Open Queue Management and add a queue. Give it a clear name that staff and visitors will recognise. After the queue exists, you attach schedules and serving points so it can actually run.',
			'On create, you can already select serving points. Later you can also manage links from the serving point side. The same counter may be selected on several queues.',
		],
		steps: [
			'Go to Queue Management → add a queue.',
			'Fill name and optional description.',
			'Set token prefix, limit, grace period, and toggles as needed.',
			'Optionally choose next queues and serving points.',
			'Save, then create schedules for that queue.',
		],
		terms: [
			{
				name: 'Queue name',
				description: 'Required label shown in lists, screens, and serving views.',
			},
			{
				name: 'Description',
				description: 'Optional note for staff about what this queue is used for.',
			},
			{
				name: 'Token prefix',
				description:
					'Letters or text placed before the number (e.g. A → A001). Helps distinguish queues on displays. Leave blank for numbers only.',
			},
			{
				name: 'Token limit',
				description: 'Maximum tokens this queue is allowed to issue (default capacity).',
			},
			{
				name: 'Grace period (minutes)',
				description:
					'Extra minutes after a token is called before it may be treated as missed or late.',
			},
			{
				name: 'Allow postpone',
				description:
					'When enabled, a waiting customer can postpone their turn instead of cancelling or losing place immediately.',
			},
			{
				name: 'Reporting enabled',
				description: 'When on, this queue is included in reporting outputs.',
			},
			{
				name: 'Next queue (field)',
				description:
					'Other queues that can receive the customer after this one is completed. Used during “complete service”.',
			},
			{
				name: 'Serving points (on create)',
				description:
					'Counters assigned to serve this queue. A serving point may already serve other queues at the same time.',
			},
		],
		tips: [
			{
				title: 'Name clearly',
				text: 'Use names visitors hear at the desk (e.g. “Passport – New”) rather than internal codes alone.',
			},
		],
	},
	{
		id: 'queue-groups',
		title: 'Queue groups',
		subtitle: 'Organising related queues',
		icon: 'FolderOpen',
		accent: 'info',
		summary:
			'Queue groups are folders for related queues. They do not change how tokens are served; they only make large setups easier to navigate in Queue Management.',
		paragraphs: [
			'Create a group, give it a name, and select member queues. You can move queues in or out of a group later without recreating them.',
			'Use groups when you have many queues under the same department or location (for example all banking counters, or all clinic rooms).',
		],
		terms: [
			{
				name: 'Group name',
				description: 'Title of the collection shown in the Queue Groups tab.',
			},
			{
				name: 'Description',
				description: 'Optional explanation of why these queues are grouped.',
			},
			{
				name: 'Member queues',
				description: 'Queues belonging to this group. Membership is for browsing and management only.',
			},
		],
	},
	{
		id: 'schedules',
		title: 'Schedules',
		subtitle: 'When a queue is open for work',
		icon: 'Event',
		accent: 'warning',
		summary:
			'A schedule is the operating period for a queue. It tells the system from when to when tokens may be issued and when serving points can have windows for that queue.',
		paragraphs: [
			'You can create schedules from the Schedules menu or from inside a queue’s detail. Set start and end date-time, token number range, and limits.',
			'After a schedule exists, attach serving points so those counters get serving windows for that period. Completed or cancelled schedules lock date and token settings so history stays stable.',
		],
		steps: [
			'Open Schedules (or a queue detail) and create a schedule.',
			'Set start/end, token from–to, and limit.',
			'Adjust postpone / reporting if needed for this window.',
			'Add serving points to the schedule so windows are created.',
		],
		terms: [
			{
				name: 'Start / End',
				description:
					'Date and time the schedule runs. End must be after start; a new schedule cannot start in the past.',
			},
			{
				name: 'Token from / Token to',
				description: 'Numeric range used when generating token numbers inside this schedule.',
			},
			{
				name: 'Token limit',
				description: 'How many tokens this schedule may issue before it is full.',
			},
			{
				name: 'Token prefix (schedule)',
				description:
					'Optional override of the queue prefix for this schedule. New schedules usually inherit the queue default.',
			},
			{
				name: 'Allow postpone / Reporting',
				description: 'Schedule-level behaviour for postponing tokens and including this period in reports.',
			},
			{
				name: 'Schedule status',
				description:
					'Lifecycle of the period (e.g. upcoming, active, completed, cancelled). Completed/cancelled schedules are not fully editable.',
			},
		],
		tips: [
			{
				title: 'Plan shifts as schedules',
				text: 'Morning and afternoon can be two schedules on the same queue with different limits or serving points.',
			},
		],
	},
	{
		id: 'serving-points',
		title: 'Serving points',
		subtitle: 'Counters, desks, and their windows',
		icon: 'Monitor',
		accent: 'success',
		summary:
			'Serving points are where staff call and finish tokens. One serving point can be linked to multiple queues, so a single counter can work several lines without creating duplicate desks.',
		paragraphs: [
			'Create a serving point with a name, the queues it serves, optional description, active flag, and assigned staff users. Inactive points are not used until turned back on.',
			'Serving windows appear when the point is connected to schedules. Open a window to see the current token, waiting list, and actions such as call, complete, skip, or postpone (depending on configuration).',
			'This is the main day-to-day screen for operators at the counter.',
		],
		steps: [
			'Add a serving point and select one or more queues.',
			'Assign the staff who will operate that counter.',
			'Ensure those queues have schedules and the point is linked to them.',
			'Open a serving window and start serving tokens.',
		],
		terms: [
			{
				name: 'Serving point name',
				description: 'Counter label staff see (e.g. Counter 3, Desk B).',
			},
			{
				name: 'Queues (multi-select)',
				description:
					'Which queues this counter serves. Selecting several queues means one point can take tokens from each of them.',
			},
			{
				name: 'Active',
				description: 'Whether the point is available for serving right now.',
			},
			{
				name: 'Assigned users',
				description: 'Staff accounts allowed to work this serving point.',
			},
			{
				name: 'Serving window',
				description:
					'A time-bound working session for the point under a schedule. Token actions for that period are done inside the window detail.',
			},
		],
		tips: [
			{
				title: 'Multi-queue counters',
				text: 'If one desk handles two services, attach both queues to the same serving point instead of creating two fake counters.',
			},
		],
	},
	{
		id: 'next-queue',
		title: 'Next queue',
		subtitle: 'Moving a customer to another service',
		icon: 'AltRoute',
		accent: 'info',
		summary:
			'Next queue is how multi-step visits work. After staff finish serving a token, they can create a new token in another queue so the customer continues to the next desk without re-registering from scratch.',
		paragraphs: [
			'On the source queue, select one or more next queues. Only those destinations appear when completing service.',
			'At the serving window, when the operator completes the token and next queues are configured, they choose the destination (if more than one). The system creates a follow-up token in that queue.',
			'Example flow: Registration → Consultation → Pharmacy. Each step is its own queue; next-queue links chain them.',
		],
		steps: [
			'Edit the first queue and set Next queue to the real follow-up services.',
			'Serve the customer normally in the first serving window.',
			'Complete the token and pick the next queue when prompted.',
			'The customer then waits in the destination queue with a new token.',
		],
		terms: [
			{
				name: 'Source queue',
				description: 'The queue where the customer is currently being served.',
			},
			{
				name: 'Destination (next) queue',
				description:
					'The queue that receives a new token when service is completed with a next-queue choice.',
			},
			{
				name: 'Complete with next queue',
				description:
					'The completion step where staff pick an active next queue; only active destinations can be selected.',
			},
		],
		tips: [
			{
				title: 'Keep the list short',
				text: 'Only configure real next steps. Too many options slows staff at completion time.',
			},
		],
	},
	{
		id: 'tokens',
		title: 'Tokens',
		subtitle: 'Customer tickets through the day',
		icon: 'ConfirmationNumber',
		accent: 'primary',
		summary:
			'A token is the customer’s place in a queue for a given schedule. Status changes as staff call, serve, postpone, cancel, or complete the ticket.',
		paragraphs: [
			'Tokens are created when a customer registers or when staff issue one for a schedule. The number usually follows the queue or schedule prefix and range.',
			'Operators manage tokens mainly from the serving window. Token Users shows the person behind the ticket and their history. Display screens show waiting and called tokens to the public.',
		],
		terms: [
			{
				name: 'Token number',
				description: 'The visible ticket (e.g. A015) shown on screens and at the counter.',
			},
			{
				name: 'Waiting',
				description: 'Token is in line and not yet being served.',
			},
			{
				name: 'Called / Serving',
				description: 'Staff have called the token or are actively serving the customer.',
			},
			{
				name: 'Postponed',
				description: 'Customer deferred their turn; allowed only when postpone is enabled.',
			},
			{
				name: 'Completed',
				description: 'Service finished. May trigger creation of a token in a next queue.',
			},
			{
				name: 'Cancelled',
				description: 'Token was voided and will not be served.',
			},
			{
				name: 'Priority',
				description:
					'A token can be marked priority so it is treated ahead of normal waiting tokens where the process allows.',
			},
		],
	},
	{
		id: 'token-users',
		title: 'Token users',
		subtitle: 'Customers who hold tokens',
		icon: 'Person',
		accent: 'info',
		summary:
			'Token users are the people receiving service — not staff logins. The Token Users menu lists customers and lets you open each person’s profile and token history.',
		paragraphs: [
			'From a token user’s detail page you can update contact details, review all tokens, share a status link (QR), and perform allowed actions such as postpone, cancel, or prioritise a token.',
			'Use this module when you need to find a person by name or phone and see where they are in the journey.',
		],
		terms: [
			{
				name: 'Token user',
				description: 'Customer/visitor record linked to one or more tokens.',
			},
			{
				name: 'Profile fields',
				description: 'Name, email, phone, age, place, remarks — used to identify and contact the person.',
			},
			{
				name: 'Token history',
				description: 'List of that person’s tickets across queues and schedules, with status and times.',
			},
			{
				name: 'Status share link',
				description: 'QR / link the customer can use to check their token status.',
			},
		],
	},
	{
		id: 'screens',
		title: 'Screens',
		subtitle: 'Lobby and counter displays',
		icon: 'SmartScreen',
		accent: 'success',
		summary:
			'Screens represent the physical displays that show queue information to visitors. You register each device, optionally put them in screen groups, and assign templates that define what content appears.',
		paragraphs: [
			'Add a screen with name, location, and network details as required. You can activate or deactivate a screen, control audio, and bind it to an IP so only that device can show the content.',
			'Screen groups are for organisation only — deleting a group does not delete the screens inside it. Assign one or more templates to a screen and set interval/order if multiple templates rotate.',
		],
		terms: [
			{
				name: 'Screen',
				description: 'One display device (TV/monitor) registered in the system.',
			},
			{
				name: 'Screen group',
				description: 'A folder of screens for easier management; does not remove member screens when deleted.',
			},
			{
				name: 'Online / Offline',
				description: 'Whether the display is currently connected and reachable.',
			},
			{
				name: 'Template assignment',
				description: 'Which designed layouts this screen should show, including rotation interval and order.',
			},
			{
				name: 'IP bind',
				description: 'When enabled, the screen is restricted to its configured IP address.',
			},
			{
				name: 'Audio',
				description: 'Whether call announcements or related audio are enabled on that screen.',
			},
		],
	},
	{
		id: 'templates',
		title: 'Templates',
		subtitle: 'Layouts shown on display screens',
		icon: 'ViewCompact',
		accent: 'warning',
		summary:
			'Templates are the visual layouts for public screens. You design zones on a canvas, choose a display theme, and link queues so waiting and called tokens appear the way you want.',
		paragraphs: [
			'Create a template with a name, description, and orientation/resolution. In the template editor, place zones, pick themes, and attach the queues each zone should show.',
			'After saving, assign the template to one or more screens. Screens then present live queue content using that design.',
		],
		terms: [
			{
				name: 'Template',
				description: 'A reusable screen layout for token/queue display.',
			},
			{
				name: 'Zone',
				description:
					'A rectangular area on the template canvas. Each zone can have its own theme and linked queues.',
			},
			{
				name: 'Display theme',
				description: 'Visual style applied inside a zone (how tokens and boards look).',
			},
			{
				name: 'Linked queues',
				description: 'Queues whose tokens are shown in that zone.',
			},
			{
				name: 'Orientation / resolution',
				description: 'Target screen size and landscape/portrait mode for the template.',
			},
		],
	},
];

export const KNOWLEDGE_FLOW = [
	{ id: 'queue', label: 'Queue', icon: 'Queue' },
	{ id: 'schedule', label: 'Schedule', icon: 'Event' },
	{ id: 'point', label: 'Serving point', icon: 'Monitor' },
	{ id: 'token', label: 'Token', icon: 'ConfirmationNumber' },
	{ id: 'next', label: 'Next queue', icon: 'AltRoute' },
] as const;
