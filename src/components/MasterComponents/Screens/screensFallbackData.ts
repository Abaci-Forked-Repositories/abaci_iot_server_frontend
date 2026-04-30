import type { Screen } from '../../../services/screensManagementApi';

export const FALLBACK_SCREENS: Screen[] = [
	{
		id: 1,
		name: 'Screen 10R6V9',
		location: 'Asia/Kolkata',
		template: { id: 1, name: 'Template 1' },
		queues: [{ id: 1, name: 'Queue 1' }],
		enable_audio: true,
		is_active: true,
		is_online: false,
		last_heartbeat: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
	},
	{
		id: 2,
		name: 'Screen Y91AD3',
		location: 'Asia/Kolkata',
		template: { id: 1, name: 'Template 1' },
		queues: [{ id: 2, name: 'Queue 2' }],
		enable_audio: false,
		is_active: true,
		is_online: false,
		last_heartbeat: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
	},
	{
		id: 3,
		name: 'Screen KL88Q1',
		location: 'Asia/Kolkata',
		template: { id: 2, name: 'Template 2' },
		queues: [{ id: 1, name: 'Queue 1' }],
		enable_audio: true,
		is_active: true,
		is_online: true,
		last_heartbeat: new Date().toISOString(),
	},
];

