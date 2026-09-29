// api call for subscriptions list + CRUD
import { authAxios } from '../../axiosInstance';
import { baseURL } from '../../helpers/baseURL';

/** Shape returned by GET /api/subscriptions/ */
export type Subscription = {
	id: number;
	start_date: string | null;
	end_date: string | null;
	created_at: string;
	updated_at: string;
	user: number;
};

export type SubscriptionsListResponse = {
	results: Subscription[];
	count: number;
};

export type GetSubscriptionsParams = {
	page: number;
	limit: number;
	search?: string;
	filters?: string;
	ordering?: string;
};

export type SubscriptionWritePayload = {
	user: number;
	start_date?: string | null;
	end_date?: string | null;
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeSubscriptionsList = (
	data: unknown,
): SubscriptionsListResponse => {
	if (Array.isArray(data)) {
		return { results: data as Subscription[], count: data.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const results = (obj.results ??
		obj.subscriptions ??
		[]) as Subscription[];
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

export const getSubscriptions = async ({
	page,
	limit,
	search = '',
	filters = '',
	ordering = '',
}: GetSubscriptionsParams): Promise<SubscriptionsListResponse> => {
	try {
		const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
		const response = await authAxios.get(
			`${baseURL}/api/subscriptions/?page=${page}&limit=${limit}${searchParam}${ordering}${filters}`,
		);
		return normalizeSubscriptionsList(response.data);
	} catch (error) {
		console.error('Error fetching subscriptions:', error);
		throw error;
	}
};

export const createSubscription = async (payload: SubscriptionWritePayload) => {
	try {
		const response = await authAxios.post(`${baseURL}/api/subscriptions/`, payload);
		return response.data;
	} catch (error) {
		console.error('Error creating subscription:', error);
		throw error;
	}
};

export const updateSubscription = async (
	id: number | string,
	payload: Partial<SubscriptionWritePayload>,
) => {
	try {
		const response = await authAxios.put(
			`${baseURL}/api/subscriptions/${id}/`,
			payload,
		);
		return response.data;
	} catch (error) {
		console.error('Error updating subscription:', error);
		throw error;
	}
};

export const deleteSubscription = async (id: number | string) => {
	try {
		const response = await authAxios.delete(`${baseURL}/api/subscriptions/${id}/`);
		return response.data;
	} catch (error) {
		console.error('Error deleting subscription:', error);
		throw error;
	}
};

export const getSubscriptionById = async (id: number | string) => {
	try {
		const response = await authAxios.get(`${baseURL}/api/subscriptions/${id}/`);
		return response.data as Subscription;
	} catch (error) {
		console.error('Error fetching subscription by id:', error);
		throw error;
	}
};
