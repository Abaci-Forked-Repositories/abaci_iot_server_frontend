/**
 * Device activation / first-admin API layer.
 * Always calls the real backend URLs (no local mock fallback).
 */

import { publicAxios } from '../../axiosInstance';

export interface ActivationStatus {
	database_available: boolean;
	database_error: string | null;
	message: string | null;
	detail: string | null;
	system_activated: boolean;
	system_unique_id: string | null;
	admin_user_availability: boolean;
	is_a_deactivated_system?: boolean;
	deactivation_date?: string | null;
	deactivation_key?: string | null;
	is_demo?: boolean;
	demo_expiry?: string | null;
	no_of_sensor_license?: number | null;
	no_of_serving_point_license?: number | null;
	customer_id?: string | null;
	cloud_connectivity_status?: boolean;
	cloud_env?: string | null;
}

export interface ActivateLicenseResponse {
	success: boolean;
	valid?: boolean;
	status?: string;
	message?: string;
	system_unique_id?: string | null;
	no_of_sensor_license?: number | null;
	no_of_serving_point_license?: number | null;
	customer_id?: string | null;
	admin_user_availability?: boolean;
	system_activated?: boolean;
	is_demo?: boolean;
	demo_expiry?: string | null;
	[key: string]: unknown;
}

export interface CreateFirstUserPayload {
	username: string;
	password: string;
	first_name: string;
	last_name: string;
}

export interface CreateFirstUserResponse {
	success?: boolean;
	message?: string;
	[key: string]: unknown;
}

const STATUS_URL = '/api/administration/activation-status/';
const ACTIVATE_URL = '/api/administration/activate-license/';
const CREATE_FIRST_USER_URL = '/api/administration/create-first-user/';

export async function fetchActivationStatus(): Promise<{
	data: ActivationStatus;
	usedMock: boolean;
}> {
	const res = await publicAxios.get<ActivationStatus>(STATUS_URL);
	return { data: res.data, usedMock: false };
}

export async function activateLicense(activationToken: string, deviceId: string): Promise<{
	data: ActivateLicenseResponse;
	usedMock: boolean;
}> {
	const res = await publicAxios.post<ActivateLicenseResponse>(ACTIVATE_URL, {
		activation_token: activationToken,
		device_id: deviceId,
	});
	return { data: res.data, usedMock: false };
}

export async function createFirstAdminUser(payload: CreateFirstUserPayload): Promise<{
	data: CreateFirstUserResponse;
	usedMock: boolean;
}> {
	const res = await publicAxios.post<CreateFirstUserResponse>(CREATE_FIRST_USER_URL, payload);
	return { data: res.data, usedMock: false };
}
