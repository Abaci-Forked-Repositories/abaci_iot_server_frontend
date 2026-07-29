import {
	getPublicQueueZoneDisplay,
	type PublicQueueStatus,
} from '../services/publicScreenApi';
import type { RecentQueueToken } from '../services/publicScreenApi';
import type { Queue } from '../services/queueManagementApi';
import { getStatusConfig } from '../components/MasterComponents/TokenDisplayThemes/tokenDisplayThemes';

const QUEUE_UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Mock active-token chips for template editor + theme picker previews. */
export const THEME_PREVIEW_RECENT_TOKENS: RecentQueueToken[] = [
	{ token_display: 'B026', serving_point_name: 'Counter 03' },
	{ token_display: 'B025', serving_point_name: 'Counter 02' },
	{ token_display: 'B024', serving_point_name: 'Counter 01' },
	{ token_display: 'B023', serving_point_name: 'Counter 04' },
];

export interface ZoneQueueRefs {
	queueIds?: number[];
	queueUuids?: string[];
	queueChipNames?: string[];
	name?: string;
}

export interface AssignedQueueDisplay {
	/** Queue UUID when resolved from live API data. */
	uuid?: string;
	queueName: string;
	servingPointName: string;
	tokenDisplay: string;
	statusLabel: string;
	statusModifier: string;
	/** @deprecated use servingPointName */
	subtitle?: string;
	recentTokens: RecentQueueToken[];
}

export interface PageTurnServingRow {
	id: string;
	queueName: string;
	servingPointName: string;
	tokenDisplay: string;
	statusLabel: string;
	statusModifier: string;
}

export function dedupeQueueIdsPreserveOrder(queueIds: number[]): number[] {
	const seen = new Set<number>();
	return queueIds.filter((id) => {
		if (!Number.isFinite(id) || id <= 0 || seen.has(id)) return false;
		seen.add(id);
		return true;
	});
}

/** Normalize zone queue ids — supports multiple queues per zone. */
export function normalizeZoneQueueIds(queueIds: number[]): number[] {
	return dedupeQueueIdsPreserveOrder(queueIds);
}

export function resolveQueuesForZone(
	refs: ZoneQueueRefs,
	queuesByUuid: Record<string, PublicQueueStatus>,
): PublicQueueStatus[] {
	const slotCount = countZoneQueueAssignmentSlots(refs);
	if (slotCount === 0) return [];

	const resolved: PublicQueueStatus[] = [];
	const seen = new Set<string>();

	for (let index = 0; index < slotCount; index += 1) {
		const queue = resolveQueueStatusAtSlot(refs, queuesByUuid, index);
		if (!queue) continue;

		const key = queueIdentityKey(queue, index);
		if (seen.has(key)) continue;
		seen.add(key);
		resolved.push(queue);
	}

	return resolved;
}

function queueIdentityKey(queue: PublicQueueStatus, index: number): string {
	const uuid = queue.uuid?.trim();
	if (uuid && QUEUE_UUID_RE.test(uuid)) return uuid;
	const name = queue.queue_name?.trim() || queue.name?.trim();
	if (name) return `name:${name}`;
	return `slot:${index}`;
}

function resolveQueueStatusAtSlot(
	refs: ZoneQueueRefs,
	queuesByUuid: Record<string, PublicQueueStatus>,
	index: number,
): PublicQueueStatus | undefined {
	const uuids = Array.isArray(refs.queueUuids) ? refs.queueUuids : [];
	const chipNames = Array.isArray(refs.queueChipNames) ? refs.queueChipNames : [];
	const queueIds = Array.isArray(refs.queueIds)
		? refs.queueIds.filter((id) => Number.isFinite(id) && id > 0)
		: [];
	const allQueues = Object.values(queuesByUuid);

	const uuid = uuids[index]?.trim();
	if (uuid && QUEUE_UUID_RE.test(uuid) && queuesByUuid[uuid]) {
		return queuesByUuid[uuid];
	}

	const id = queueIds[index];
	if (id != null) {
		const byId = allQueues.find((q) => q.id === id);
		if (byId) return byId;
	}

	const chipName = chipNames[index]?.trim();
	if (chipName) {
		return (
			queuesByUuid[`name:${chipName}`] ??
			allQueues.find((q) => q.name === chipName || q.queue_name === chipName)
		);
	}

	return undefined;
}

export function resolvePrimaryQueueForZone(
	refs: ZoneQueueRefs,
	queuesByUuid: Record<string, PublicQueueStatus>,
): PublicQueueStatus | null {
	return resolveQueuesForZone(refs, queuesByUuid)[0] ?? null;
}

export function mergeRecentTokensFromQueues(
	queues: PublicQueueStatus[],
): RecentQueueToken[] {
	const seen = new Set<string>();
	const list: RecentQueueToken[] = [];

	for (const queue of queues) {
		for (const token of queue.other_tokens ?? []) {
			if (!token.token_display) continue;
			const key = `${token.token_display}|${token.serving_point_name ?? ''}|${token.called_at ?? ''}`;
			if (seen.has(key)) continue;
			seen.add(key);
			list.push(token);
		}
	}

	return list;
}

/** How many queues are assigned before numeric ids are resolved from the API. */
export function countZoneQueueAssignmentSlots(refs: ZoneQueueRefs): number {
	const queueIds = Array.isArray(refs.queueIds)
		? refs.queueIds.filter((id) => Number.isFinite(id) && id > 0)
		: [];
	const queueUuids = Array.isArray(refs.queueUuids)
		? refs.queueUuids.filter((uuid) => QUEUE_UUID_RE.test(String(uuid).trim()))
		: [];
	const chipNames = Array.isArray(refs.queueChipNames)
		? refs.queueChipNames.map((name) => name?.trim() ?? '').filter(Boolean)
		: [];

	return Math.max(queueIds.length, queueUuids.length, chipNames.length);
}

/**
 * Template editor preview for Page Turn — builds mock queue rows from saved refs.
 * Uses chip names / UUID count when numeric queueIds are not resolved yet (e.g. on reopen).
 */
export function buildEditorPageTurnQueueDisplays(
	refs: ZoneQueueRefs,
	queuesById: Map<number, Queue>,
	previewToken: string,
): AssignedQueueDisplay[] {
	const slotCount = countZoneQueueAssignmentSlots(refs);
	if (slotCount === 0) return [];

	const queueIds = Array.isArray(refs.queueIds)
		? refs.queueIds.filter((id) => Number.isFinite(id) && id > 0)
		: [];
	const chipNames = Array.isArray(refs.queueChipNames)
		? refs.queueChipNames.map((name) => name?.trim() ?? '')
		: [];

	const status = getStatusConfig('waiting');
	const servingStatus = getStatusConfig('serving');
	const isMulti = slotCount > 1;

	return Array.from({ length: slotCount }, (_, i) => {
		const id = queueIds[i];
		const name =
			(id != null ? queuesById.get(id)?.name : null) ??
			(chipNames[i] || `Queue ${i + 1}`);
		// Multi-queue singular preview: stable token per queue (01, 02, 03…) so rotation
		// reads in order. Single-queue preview uses the cycling demo token (01→15).
		const token = isMulti
			? String(i + 1).padStart(2, '0')
			: previewToken;
		const statusConfig = i % 3 === 1 ? servingStatus : status;

		return {
			queueName: name,
			servingPointName: `Serving Point ${String(i + 1).padStart(2, '0')}`,
			tokenDisplay: token,
			statusLabel: statusConfig.label,
			statusModifier: statusConfig.modifier,
			subtitle: `Counter ${String(i + 1).padStart(2, '0')}`,
			recentTokens: [],
		};
	});
}

export function resolveAssignedQueueDisplays(
	refs: ZoneQueueRefs,
	queuesByUuid: Record<string, PublicQueueStatus>,
): AssignedQueueDisplay[] {
	const slotCount = countZoneQueueAssignmentSlots(refs);
	if (slotCount === 0) return [];

	return Array.from({ length: slotCount }, (_, index) => {
		const chipName = refs.queueChipNames?.[index]?.trim();
		const queue = resolveQueueStatusAtSlot(refs, queuesByUuid, index);
		const display = queue
			? getPublicQueueZoneDisplay(queue, {
					queueName: chipName || refs.queueChipNames?.[0] || refs.name,
				})
			: {
					queueName: chipName || `Queue ${index + 1}`,
					servingPointName: '—',
					tokenDisplay: '—',
					tokenStatus: 'waiting',
				};
		const statusConfig = getStatusConfig(display.tokenStatus);
		const servingPointName =
			display.servingPointName !== '—'
				? display.servingPointName
				: display.queueName;

		return {
			uuid: queue?.uuid?.trim() || undefined,
			queueName: display.queueName,
			servingPointName,
			tokenDisplay: display.tokenDisplay,
			statusLabel: statusConfig.label,
			statusModifier: statusConfig.modifier,
			subtitle: servingPointName,
			recentTokens: queue?.other_tokens ?? [],
		};
	});
}

/** Rows for Page Turn multi-queue table — one primary row per queue plus live other counters. */
export function buildPageTurnServingRows(
	queues: AssignedQueueDisplay[],
): PageTurnServingRow[] {
	const rows: PageTurnServingRow[] = [];
	const seen = new Set<string>();

	for (const queue of queues) {
		const primaryKey = `${queue.queueName}|${queue.servingPointName}|${queue.tokenDisplay}`;
		seen.add(primaryKey);
		rows.push({
			id: `primary-${queue.queueName}`,
			queueName: queue.queueName,
			servingPointName: queue.servingPointName,
			tokenDisplay: queue.tokenDisplay,
			statusLabel: queue.statusLabel,
			statusModifier: queue.statusModifier,
		});

		const servingStatus = getStatusConfig('serving');
		for (const token of queue.recentTokens) {
			if (!token.token_display?.trim()) continue;
			const point = token.serving_point_name?.trim() || queue.servingPointName;
			const key = `${queue.queueName}|${point}|${token.token_display}`;
			if (seen.has(key)) continue;
			seen.add(key);
			rows.push({
				id: `other-${queue.queueName}-${point}-${token.token_display}`,
				queueName: queue.queueName,
				servingPointName: point,
				tokenDisplay: token.token_display,
				statusLabel: servingStatus.label,
				statusModifier: servingStatus.modifier,
			});
		}
	}

	return rows;
}

export function formatAssignedQueueSummary(names: string[]): string {
	if (!names.length) return '';
	if (names.length === 1) return names[0];
	if (names.length === 2) return `${names[0]} · ${names[1]}`;
	return `${names[0]} · ${names[1]} +${names.length - 2}`;
}
