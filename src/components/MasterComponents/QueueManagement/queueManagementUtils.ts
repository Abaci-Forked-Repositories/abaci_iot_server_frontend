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

export const getErrorMessage = (error: unknown) => {
	const typedError = error as {
		response?: { data?: { detail?: string; errors?: Record<string, string[]> } };
	};
	const data = typedError.response?.data;

	if (data?.detail) {
		return data.detail;
	}

	if (data?.errors) {
		return Object.entries(data.errors)
			.map(([field, messages]) => `${field}: ${messages.join(', ')}`)
			.join(' ');
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

