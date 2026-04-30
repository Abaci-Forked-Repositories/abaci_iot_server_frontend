import type { CreateTokenPayload, TokenStatus } from '../../../services/queueManagementApi';

export type QueueManagementTab = 'queues' | 'tokens' | 'customers';

/** Queues list filter: all queues, only those without a group, or a specific group id. */
export type QueueGroupFilterValue = 'all' | 'ungrouped' | number;

export const TOKEN_STATUSES: TokenStatus[] = [
	'registred',
	'reported',
	'serving',
	'completed',
	'cancelled',
	'postponed',
	'no_show',
];

export const initialTokenForm: CreateTokenPayload = {
	schedule_id: 0,
	name: '',
	email: '',
	phone: '',
	age: undefined,
	place: '',
	remarks: '',
	priority: 0,
	is_vip: false,
};
