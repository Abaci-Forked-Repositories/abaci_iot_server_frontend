import {
	parseDisplayThemeId,
	type ZoneDisplayThemeId,
} from '../components/MasterComponents/TokenDisplayThemes/tokenDisplayThemes';

/** Themes that support a live multi-queue table/board layout. */
export const TABULAR_MULTI_QUEUE_THEME_IDS = [
	'signal-board',
	'paper-flip',
	'mono-flip',
	'airport-arrival',
	'airport-departure',
	'car-speedometer',
	'aurora-nexus',
	'neon-prism',
	'glass-lobby',
	'digital-healthcare',
	'oled-pulse',
	'royal-luxury',
	'galaxy-spiral',
] as const satisfies readonly ZoneDisplayThemeId[];

const TABULAR_MULTI_QUEUE_THEME_SET = new Set<string>(TABULAR_MULTI_QUEUE_THEME_IDS);

export function themeSupportsTabularMultiQueueView(
	themeId: string | null | undefined,
): themeId is ZoneDisplayThemeId {
	const parsed = parseDisplayThemeId(themeId);
	if (!parsed) return false;
	return TABULAR_MULTI_QUEUE_THEME_SET.has(parsed);
}

/**
 * Resolve whether a zone should render the tabular multi-queue board.
 * Legacy templates without `is_tabular_view` default to tabular for board-capable themes.
 */
export function resolveZoneIsTabularView(
	themeId: string | null | undefined,
	saved: boolean | null | undefined,
	queueCount: number,
): boolean {
	if (queueCount <= 1) return false;
	if (!themeSupportsTabularMultiQueueView(themeId)) return false;
	if (saved === true) return true;
	if (saved === false) return false;
	return true;
}

export function shouldUseRotatingMultiQueueView(
	themeId: string | null | undefined,
	isTabularView: boolean | null | undefined,
	queueCount: number,
): boolean {
	if (queueCount <= 1) return false;
	return !resolveZoneIsTabularView(themeId, isTabularView, queueCount);
}

export function readZoneIsTabularViewFromRect(rect: {
	isTabularView?: boolean | null;
	get?: (key: string) => unknown;
}): boolean | undefined {
	if (rect.isTabularView === true) return true;
	if (rect.isTabularView === false) return false;
	if (typeof rect.get === 'function') {
		const value = rect.get('isTabularView');
		if (value === true) return true;
		if (value === false) return false;
	}
	return undefined;
}

/** Parse `data-is-tabular-view` from saved template HTML. */
export function parseTabularViewAttribute(
	attr: string | null | undefined,
): boolean | undefined {
	if (attr === 'true') return true;
	if (attr === 'false') return false;
	return undefined;
}

/**
 * Use an explicitly saved preference when present; otherwise apply legacy defaults.
 */
export function coalesceZoneTabularView(
	themeId: string | null | undefined,
	saved: boolean | null | undefined,
	queueCount: number,
): boolean {
	if (saved === true || saved === false) return saved;
	return resolveZoneIsTabularView(themeId, undefined, queueCount);
}

/** Hint copy for the template editor queue assignment panel. */
export function formatMultiQueueAssignmentHint(
	themeId: string | null | undefined,
	queueCount: number,
	isTabularView: boolean,
): string {
	if (queueCount <= 1) return '';
	if (themeSupportsTabularMultiQueueView(themeId)) {
		return isTabularView
			? `Assigned: ${queueCount} queues. Shows a live serving board with all queues.`
			: `Assigned: ${queueCount} queues. Rotates through each queue every 6 seconds.`;
	}
	return `Assigned: ${queueCount} queues. Rotates through each queue every 6 seconds.`;
}
