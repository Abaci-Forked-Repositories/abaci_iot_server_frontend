/**
 * Cloud synchronization API layer.
 */

import { authAxios } from '../../axiosInstance';

export const CLOUD_SYNC_LOG_SOURCES = [
	'cloud_online_status',
	'cloud_heartbeat',
	'cloud_sync_manual',
] as const;

export const LICENSING_LOG_SOURCES = ['activation_view', 'demo_expiry'] as const;

export const SYSTEM_LOGS_LIMIT = 100;

export interface CloudSyncStatus {
	enable_cloud_sync: boolean;
	cloud_connectivity_status: boolean;
}

export interface SystemConfig {
	id: number;
	system_unique_id: string;
	device_secret: string;
	is_activated: boolean;
	activation_code: string;
	is_a_deactivated_system: boolean;
	deactivation_date: string | null;
	deactivation_key: string | null;
	no_of_sensor_license: number;
	/** Present when backend reports currently used sensor slots. */
	active_sensors?: number;
	no_of_serving_point_license: number;
	/** Present when backend reports currently used serving point slots. */
	active_serving_points?: number;
	customer_id: string;
	cloud_connectivity_status: boolean;
	enable_cloud_sync: boolean;
	version: string;
	is_firstuser_created: boolean;
	email_protocol: string;
	email_host: string | null;
	email_port: number;
	sender_email: string | null;
	email_password: string | null;
	encryption_type: string;
	created_at: string;
	updated_at: string;
}

export interface ConfigOutboxSummary {
	total: number;
	synced: number;
	pending: number;
	retrying: number;
	error: number;
	stuck: number;
	processing: number;
}

export async function getCloudSync(): Promise<CloudSyncStatus> {
	const { data } = await authAxios.get<CloudSyncStatus>('api/administration/cloud-sync/');
	return data;
}

export async function patchCloudSync(enable_cloud_sync: boolean): Promise<{ enable_cloud_sync: boolean }> {
	const { data } = await authAxios.patch<{ enable_cloud_sync: boolean }>(
		'api/administration/cloud-sync/',
		{ enable_cloud_sync },
	);
	return data;
}

export async function getSystemConfig(): Promise<SystemConfig> {
	const { data } = await authAxios.get<SystemConfig>('api/administration/system-config/');
	return data;
}

// Future: Adaptor status — used by System Overview when re-enabled
// export interface AdaptorCheckResponse {
// 	system_configured: boolean;
// 	code: string;
// 	message: string;
// 	version: string;
// 	synced: boolean;
// 	stored_catalog_version: string;
// 	catalog_version_changed: boolean;
// 	catalog_payload_changed: boolean;
// }
//
// export async function getAdaptorCheck(): Promise<AdaptorCheckResponse> {
// 	const { data } = await authAxios.get<AdaptorCheckResponse>(
// 		'api/administration/adaptor-check/',
// 	);
// 	return data;
// }

export interface UpdateEmailSettingsPayload {
	email_protocol: string;
	email_host: string | null;
	email_port: number;
	sender_email: string | null;
	encryption_type: string;
	/** Omit when unchanged / blank so backend keeps the existing secret. */
	email_password?: string | null;
}

/** PATCH JSON — email settings fields on system-config. */
export async function updateEmailSettings(
	payload: UpdateEmailSettingsPayload,
): Promise<SystemConfig> {
	const { data } = await authAxios.patch<SystemConfig>(
		'api/administration/system-config/',
		payload,
	);
	return data;
}

export interface SendTestEmailPayload {
	email: string;
	email_host: string;
	email_password: string;
	email_port: number;
	email_protocol: string;
	encryption_type: string;
	sender_email: string;
}

export interface SendTestEmailResponse {
	success?: boolean;
	message?: string;
	[key: string]: unknown;
}

/** POST — send a test email using the provided SMTP settings. */
export async function sendTestEmail(
	payload: SendTestEmailPayload,
): Promise<SendTestEmailResponse> {
	const { data } = await authAxios.post<SendTestEmailResponse>(
		'api/administration/system-config/send_test_email/',
		payload,
	);
	return data;
}

export interface ServerTimeResponse {
	server_time: string;
	server_timezone: string;
}

export async function getServerTime(): Promise<ServerTimeResponse> {
	const { data } = await authAxios.get<ServerTimeResponse>('api/administration/server-time/');
	return data;
}

export async function getConfigOutboxSummary(): Promise<ConfigOutboxSummary> {
	const { data } = await authAxios.get<ConfigOutboxSummary>(
		'api/administration/config-outbox/summary/',
	);
	return data;
}

/**
 * After toggle PATCH: refresh cloud-sync + system-config (matches backend flow).
 * Returns the refreshed cloud-sync status for UI binding.
 */
export async function refreshCloudSyncAfterToggle(): Promise<CloudSyncStatus> {
	const [cloudSync] = await Promise.all([getCloudSync(), getSystemConfig()]);
	return cloudSync;
}

export interface SystemLogEntry {
	id?: number | string;
	source?: string;
	message?: string;
	details?: string | Record<string, unknown> | null;
	level?: string;
	status?: string;
	created_at?: string;
	timestamp?: string;
	[key: string]: unknown;
}

export interface SystemLogsResponse {
	count?: number;
	results?: SystemLogEntry[];
}

function normalizeSystemLogs(data: SystemLogEntry[] | SystemLogsResponse | unknown): SystemLogEntry[] {
	if (Array.isArray(data)) return data;
	if (
		data &&
		typeof data === 'object' &&
		'results' in (data as object) &&
		Array.isArray((data as SystemLogsResponse).results)
	) {
		return (data as SystemLogsResponse).results ?? [];
	}
	return [];
}

function getSystemLogTimestamp(entry: SystemLogEntry): string | null {
	return entry.created_at || entry.timestamp || null;
}

export function sortSystemLogsNewestFirst(entries: SystemLogEntry[]): SystemLogEntry[] {
	return [...entries].sort((a, b) => {
		const ta = new Date(getSystemLogTimestamp(a) || 0).getTime();
		const tb = new Date(getSystemLogTimestamp(b) || 0).getTime();
		return tb - ta;
	});
}

async function getSystemLogsBySources(sources: readonly string[]): Promise<SystemLogEntry[]> {
	const params = new URLSearchParams({
		include_sources: sources.join(','),
		limit: String(SYSTEM_LOGS_LIMIT),
	});
	const { data } = await authAxios.get<SystemLogEntry[] | SystemLogsResponse>(
		`api/administration/system-logs/?${params.toString()}`,
	);
	return sortSystemLogsNewestFirst(normalizeSystemLogs(data));
}

/** Cloud sync history — filtered system logs. */
export async function getCloudSyncSystemLogs(): Promise<SystemLogEntry[]> {
	return getSystemLogsBySources(CLOUD_SYNC_LOG_SOURCES);
}

/** Licensing history — filtered system logs. */
export async function getLicensingSystemLogs(): Promise<SystemLogEntry[]> {
	return getSystemLogsBySources(LICENSING_LOG_SOURCES);
}
