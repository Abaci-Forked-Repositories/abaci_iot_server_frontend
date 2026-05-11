import type { Queue, ServingPoint, Token } from '../../../services/queueManagementApi';

/** Normalizes `ServingPoint.queue` whether the API returns a single id or a list. */
export const servingPointQueueIds = (point: ServingPoint): number[] => {
	const q = point.queue;
	if (Array.isArray(q)) return q.filter((id): id is number => typeof id === 'number');
	return typeof q === 'number' ? [q] : [];
};

/** Normalizes `ServingPoint.assigned_users` whether the API returns ids or nested objects. */
export const servingPointAssignedUserIds = (point: ServingPoint): number[] => {
	const u = point.assigned_users;
	if (!u || !Array.isArray(u)) return [];
	return u
		.map((item) => (typeof item === 'number' ? item : item.id))
		.filter((id): id is number => typeof id === 'number' && !Number.isNaN(id));
};

const FIELD_LABELS: Record<string, string> = {
	non_field_errors: '',
	__all__: '',
	from_datetime: 'Start',
	to_datetime: 'End',
	token_from: 'Token from',
	token_to: 'Token to',
	limit: 'Token limit',
	description: 'Description',
	queue: 'Queue',
	status: 'Status',
};

const formatFieldErrors = (field: string, messages: string[]): string => {
	const text = messages.join(' ');
	const label = FIELD_LABELS[field] ?? field;
	return label ? `${label}: ${text}` : text;
};

export const getErrorMessage = (error: unknown): string => {
	if (typeof error === 'string') return error;

	const typedError = error as {
		message?: string;
		response?: {
			data?:
				| string
				| {
						detail?: string;
						message?: string;
						non_field_errors?: string[];
						errors?: Record<string, string[]>;
						[key: string]: unknown;
				  };
		};
	};

	const data = typedError.response?.data;

	if (typeof data === 'string' && data.trim()) {
		return data;
	}

	if (data && typeof data === 'object') {
		if (typeof data.detail === 'string' && data.detail.trim()) {
			return data.detail;
		}
		if (typeof data.message === 'string' && data.message.trim()) {
			return data.message;
		}
		if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
			return data.non_field_errors.join(' ');
		}
		if (data.errors && typeof data.errors === 'object') {
			const parts = Object.entries(data.errors)
				.filter(([, messages]) => Array.isArray(messages) && messages.length)
				.map(([field, messages]) => formatFieldErrors(field, messages as string[]));
			if (parts.length) return parts.join(' ');
		}

		const fieldEntries = Object.entries(data).filter(
			([key, value]) =>
				key !== 'detail' &&
				key !== 'message' &&
				key !== 'errors' &&
				Array.isArray(value) &&
				(value as unknown[]).every((item) => typeof item === 'string'),
		);
		if (fieldEntries.length) {
			return fieldEntries
				.map(([field, messages]) => formatFieldErrors(field, messages as string[]))
				.join(' ');
		}
	}

	if (typeof typedError.message === 'string' && typedError.message.trim()) {
		return typedError.message;
	}

	return 'Something went wrong while calling the queue management API.';
};

export const getQueueName = (queue: Queue | number | undefined, queues: Queue[]) => {
	if (!queue) return '-';

	if (typeof queue === 'number') {
		return queues.find((item) => item.id === queue)?.name || `Queue ${queue}`;
	}

	return queue.name;
};

export const getTokenQueueName = (queue: Token['queue'], queues: Queue[]) => {
	if (typeof queue === 'number') {
		return getQueueName(queue, queues);
	}

	return queue?.name || '-';
};

export const formatDate = (value?: string | null) => {
	if (!value) return '-';
	return new Date(value).toLocaleString();
};

export const statusBadgeColor = (status?: string) => {
	switch (status) {
		case 'registred':
			return 'secondary';
		case 'reported':
			return 'warning';
		case 'waiting':
			return 'warning';
		case 'serving':
			return 'info';
		case 'completed':
			return 'success';
		case 'cancelled':
		case 'no_show':
			return 'danger';
		case 'postponed':
			return 'secondary';
		default:
			return 'light';
	}
};

