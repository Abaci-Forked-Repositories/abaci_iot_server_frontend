/**
 * Licensing tab data — GET api/administration/license-details/
 */

import { authAxios } from '../../axiosInstance';

export interface LicenseDetails {
	system_activated: boolean;
	system_unique_id: string | null;
	customer_id: string | null;
	device_license_count: number;
	no_of_serving_point_license: number;
	active_serving_point_count: number;
	remaining_serving_point_license: number;
	is_a_deactivated_system: boolean;
	deactivation_date: string | null;
	last_licensed_at: string | null;
	license_expires_at: string | null;
	license_type: string | null;
	license_jti: string | null;
	is_demo: boolean;
	demo_expiry: string | null;
}

export async function getLicenseDetails(): Promise<LicenseDetails> {
	const { data } = await authAxios.get<LicenseDetails>(
		'api/administration/license-details/',
	);
	return data;
}

export interface PreviewActivationTokenPayload {
	device_id: string;
	activation_token: string;
}

/** Preview / validate an upgrade token before applying. */
export interface PreviewActivationTokenResponse {
	success?: boolean;
	valid?: boolean;
	message?: string;
	no_of_serving_point_license?: number | null;
	current_no_of_serving_point_license?: number | null;
	customer_id?: string | null;
	is_demo?: boolean;
	demo_expiry?: string | null;
	license_expires_at?: string | null;
	license_downgrade?: boolean;
	[key: string]: unknown;
}

export async function previewActivationToken(
	payload: PreviewActivationTokenPayload,
): Promise<PreviewActivationTokenResponse> {
	const { data } = await authAxios.post<PreviewActivationTokenResponse>(
		'api/administration/preview-activation-token/',
		payload,
	);
	return data;
}

export type UpgradeLicensePayload = PreviewActivationTokenPayload;

export interface UpgradeLicenseResponse {
	success?: boolean;
	message?: string;
	no_of_serving_point_license?: number | null;
	customer_id?: string | null;
	is_demo?: boolean;
	demo_expiry?: string | null;
	license_expires_at?: string | null;
	[key: string]: unknown;
}

export async function upgradeLicense(
	payload: UpgradeLicensePayload,
): Promise<UpgradeLicenseResponse> {
	const { data } = await authAxios.post<UpgradeLicenseResponse>(
		'api/administration/upgrade-license/',
		payload,
	);
	return data;
}
