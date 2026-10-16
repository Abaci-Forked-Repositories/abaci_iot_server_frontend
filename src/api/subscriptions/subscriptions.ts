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
	type: 'admin' | 'view' | 'edit' | string;
	parent_subscription: number | null;
	devices: number[];
	user: number | null;
	user_label?: string | null;
	parent_label?: string | null;
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
	type?: string;
	parent_subscription?: number | null;
};

/** Accept plain array or DRF paginated `{ results, count }`. */
export const normalizeSubscriptionsList = (
	data: unknown,
): SubscriptionsListResponse => {
	if (Array.isArray(data)) {
		return { results: (data as Subscription[]).map(normalizeSubscription), count: data.length };
	}
	const obj = (data ?? {}) as Record<string, unknown>;
	const raw = (obj.results ?? obj.subscriptions ?? []) as Subscription[];
	const results = raw.map(normalizeSubscription);
	const count =
		typeof obj.count === 'number'
			? obj.count
			: typeof obj.total === 'number'
				? obj.total
				: results.length;
	return { results, count };
};

export const normalizeSubscription = (data: unknown): Subscription => {
	const raw = (data ?? {}) as Record<string, unknown>;
	const devicesRaw = raw.devices;
	const devices = Array.isArray(devicesRaw)
		? devicesRaw.map((id) => Number(id)).filter((id) => Number.isFinite(id))
		: [];
	return {
		id: Number(raw.id),
		start_date: (raw.start_date as string | null) ?? null,
		end_date: (raw.end_date as string | null) ?? null,
		created_at: String(raw.created_at ?? ''),
		updated_at: String(raw.updated_at ?? ''),
		type: String(raw.type ?? 'admin'),
		parent_subscription:
			raw.parent_subscription == null || raw.parent_subscription === ''
				? null
				: Number(raw.parent_subscription),
		devices,
		user: raw.user == null || raw.user === '' ? null : Number(raw.user),
		user_label: (raw.user_label as string | null | undefined) ?? null,
		parent_label: (raw.parent_label as string | null | undefined) ?? null,
	};
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
		return normalizeSubscription(response.data);
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
		return normalizeSubscription(response.data);
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

export const getSubscriptionById = async (id: number | string): Promise<Subscription> => {
	try {
		const response = await authAxios.get(`${baseURL}/api/subscriptions/${id}/`);
		const data = response.data;
		return normalizeSubscription(data?.subscription ?? data?.data ?? data);
	} catch (error) {
		console.error('Error fetching subscription by id:', error);
		throw error;
	}
};

/** PATCH /api/subscriptions/{id}/devices/ — add devices to the subscription M2M. */
export const addDevicesToSubscription = async (
	subscriptionId: number | string,
	deviceIds: Array<number | string>,
) => {
	try {
		const response = await authAxios.patch(
			`${baseURL}/api/subscriptions/${subscriptionId}/devices/`,
			{ device_ids: deviceIds },
		);
		return normalizeSubscription(response.data);
	} catch (error) {
		console.error('Error adding devices to subscription:', error);
		throw error;
	}
};

/** DELETE /api/subscriptions/{id}/devices/ — remove devices from the subscription M2M. */
export const removeDevicesFromSubscription = async (
	subscriptionId: number | string,
	deviceIds: Array<number | string>,
) => {
	try {
		const response = await authAxios.delete(
			`${baseURL}/api/subscriptions/${subscriptionId}/devices/`,
			{ data: { device_ids: deviceIds } },
		);
		return normalizeSubscription(response.data);
	} catch (error) {
		console.error('Error removing devices from subscription:', error);
		throw error;
	}
};
