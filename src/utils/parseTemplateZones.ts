const QUEUE_UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ParsedTemplateZone {
	name: string;
	queueIds: number[];
	queueUuids: string[];
	queueChipNames: string[];
	left: number;
	top: number;
	width: number;
	height: number;
	backgroundColor: string;
	borderRadius: number;
	borderColor: string;
	border: boolean;
}

export interface ParsedTemplateLayout {
	width: number;
	height: number;
	zones: ParsedTemplateZone[];
}

function parsePx(value: string | undefined): number {
	if (!value) return 0;
	const n = parseFloat(value.replace(/px$/i, '').trim());
	return Number.isFinite(n) ? n : 0;
}

function parseStyleValue(style: string, prop: string): string | undefined {
	const re = new RegExp(`${prop}\\s*:\\s*([^;]+)`, 'i');
	return re.exec(style)?.[1]?.trim();
}

export function parseQueueRefsFromAttribute(attr: string): { ids: number[]; uuids: string[] } {
	if (!attr?.trim()) return { ids: [], uuids: [] };

	const ids: number[] = [];
	const uuids: string[] = [];

	attr
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean)
		.forEach((part) => {
			if (QUEUE_UUID_RE.test(part)) {
				uuids.push(part);
				return;
			}
			if (/^\d+$/.test(part)) {
				const id = Number(part);
				if (Number.isFinite(id) && id > 0) ids.push(id);
			}
		});

	return { ids, uuids };
}

export function parseTemplateLayoutFromHtml(html?: string | null): ParsedTemplateLayout | null {
	if (!html?.trim()) return null;

	const doc = new DOMParser().parseFromString(html, 'text/html');
	const container = doc.querySelector('.template-container');
	if (!container) return null;

	const containerStyle = container.getAttribute('style') ?? '';
	const width = parsePx(parseStyleValue(containerStyle, 'width')) || 1920;
	const height = parsePx(parseStyleValue(containerStyle, 'height')) || 1080;

	const zones: ParsedTemplateZone[] = [];
	container.querySelectorAll('.queue-zone').forEach((el) => {
		const style = el.getAttribute('style') ?? '';
		const borderRaw = parseStyleValue(style, 'border') ?? '';
		const borderMatch = borderRaw.match(/solid\s+(.+)$/i);
		const queueIdsAttr = el.getAttribute('data-queue-ids') ?? el.getAttribute('data-queue-id') ?? '';
		const { ids: queueIds, uuids: queueUuids } = parseQueueRefsFromAttribute(queueIdsAttr);
		const queueChipNames = Array.from(el.querySelectorAll('.queue-zone-queue-chip'))
			.map((chip) => chip.textContent?.trim() ?? '')
			.filter(Boolean);

		zones.push({
			name: el.getAttribute('data-zone-name') ?? '',
			queueIds,
			queueUuids,
			queueChipNames,
			left: parsePx(parseStyleValue(style, 'left')),
			top: parsePx(parseStyleValue(style, 'top')),
			width: parsePx(parseStyleValue(style, 'width')),
			height: parsePx(parseStyleValue(style, 'height')),
			backgroundColor:
				parseStyleValue(style, 'background') ??
				parseStyleValue(style, 'background-color') ??
				'#ffffff',
			borderRadius: parsePx(parseStyleValue(style, 'border-radius')),
			borderColor: borderMatch?.[1]?.trim() ?? 'black',
			border: borderRaw !== '' && borderRaw !== 'none' && !/^0(?:px)?$/i.test(borderRaw),
		});
	});

	return { width, height, zones };
}

export interface ZoneGeometry {
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * Clip legacy html zone rows to the canvas without changing intentional placement.
 * (Do not reset top to 0 — that stacked every column on load.)
 */
export function normalizeZoneGeometryForCanvas(
	zone: ZoneGeometry,
	canvasW: number,
	canvasH: number,
): ZoneGeometry {
	let { left, top, width, height } = zone;

	if (left < 0) {
		width += left;
		left = 0;
	}
	if (top < 0) {
		height += top;
		top = 0;
	}

	// Wide zones that spill past the right edge were usually meant to span the canvas.
	if (width >= canvasW * 0.75 && left + width > canvasW) {
		left = 0;
		width = canvasW;
	} else if (left + width > canvasW) {
		width = canvasW - left;
	}

	if (top + height > canvasH) {
		height = canvasH - top;
	}

	return {
		left,
		top,
		width: Math.max(8, width),
		height: Math.max(8, height),
	};
}

/**
 * Fix zones saved with height larger than the canvas (e.g. top:538 + height:1080 on a 1080px canvas).
 * The template editor thumbnail looks correct because Fabric clips the canvas; raw HTML overflows.
 */
export function normalizeTemplateZonesInDom(
	container: HTMLElement,
	containerWidth: number,
	containerHeight: number,
): void {
	container.querySelectorAll<HTMLElement>('.queue-zone').forEach((zoneEl) => {
		let left = parsePx(zoneEl.style.left);
		let top = parsePx(zoneEl.style.top);
		let width = parsePx(zoneEl.style.width);
		let height = parsePx(zoneEl.style.height);

		if (left < 0) {
			width += left;
			left = 0;
		}
		if (top < 0) {
			height += top;
			top = 0;
		}
		if (width >= containerWidth * 0.75 && left + width > containerWidth) {
			left = 0;
			width = containerWidth;
		} else if (left + width > containerWidth) {
			width = containerWidth - left;
		}

		if (top + height > containerHeight) {
			height = containerHeight - top;
		}

		width = Math.max(0, width);
		height = Math.max(0, height);

		zoneEl.style.left = `${left}px`;
		zoneEl.style.top = `${top}px`;
		zoneEl.style.width = `${width}px`;
		zoneEl.style.height = `${height}px`;
	});
}

export function collectQueueUuidsFromHtml(html?: string | null): string[] {
	const layout = parseTemplateLayoutFromHtml(html);
	if (!layout) return [];
	const seen = new Set<string>();
	const uuids: string[] = [];
	layout.zones.forEach((zone) => {
		zone.queueUuids.forEach((uuid) => {
			if (!QUEUE_UUID_RE.test(uuid) || seen.has(uuid)) return;
			seen.add(uuid);
			uuids.push(uuid);
		});
	});
	return uuids;
}
