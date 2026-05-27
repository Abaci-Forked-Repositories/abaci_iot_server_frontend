import {
	createFillAppearance,
	createThemeAppearance,
	getZoneAppearanceFromSaved,
	parseDisplayThemeId,
	ZONE_DISPLAY_THEME_CONFIGS,
	type ZoneDisplayAppearance,
	type ZoneDisplayThemeId,
} from '../components/MasterComponents/TokenDisplayThemes/tokenDisplayThemes';

/** Custom Fabric rect props persisted in fabric_json. */
export const FABRIC_ZONE_APPEARANCE_PROPS = ['displayTheme', 'zoneFillColor'] as const;

/** Minimum Fabric zone rect shape for appearance + HTML overlay positioning. */
export type FabricZoneOverlayRect = {
	id?: string;
	name?: string;
	queueIds?: number[];
	queueChipNames?: string[];
	displayTheme?: string | null;
	zoneFillColor?: string | null;
	fill?: string | null;
	/** Fabric built-in opacity (0–1). Used for per-zone opacity. */
	opacity?: number;
	setCoords?: () => void;
	aCoords?: { tl?: { x: number; y: number }; br?: { x: number; y: number } };
	getBoundingRect?: () => { left: number; top: number; width: number; height: number };
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	scaleX?: number;
	scaleY?: number;
	rx?: number;
};

export function getZoneAppearanceFromRect(rect: {
	displayTheme?: string | null;
	zoneFillColor?: string | null;
	fill?: string | null;
}): ZoneDisplayAppearance {
	const themeId = parseDisplayThemeId(rect.displayTheme);
	if (themeId) return createThemeAppearance(themeId);

	const fill = (rect.zoneFillColor ?? rect.fill ?? '').trim();
	if (fill) return createFillAppearance(fill);

	return createFillAppearance('#ffffff');
}

/** Representative solid color for HTML thumbnail / list when zone uses a theme. */
export function themeFallbackBackgroundColor(themeId: ZoneDisplayThemeId): string {
	const gradients: Record<ZoneDisplayThemeId, string> = {
		'deep-blue': '#1e3a5f',
		'high-contrast': '#c8d0da',
		amber: '#4a2200',
		emerald: '#0d3320',
		crimson: '#4a0a0a',
		midnight: '#1a1a2e',
		'royal-purple': '#2e0d4a',
		slate: '#2d3748',
	};
	return gradients[themeId];
}

export function applyZoneAppearanceToRect(
	rect: { set: (props: Record<string, unknown>) => void },
	appearance: ZoneDisplayAppearance,
	preserveStroke?: string | null,
): void {
	if (appearance.mode === 'theme' && appearance.displayTheme) {
		const config = ZONE_DISPLAY_THEME_CONFIGS[appearance.displayTheme];
		void config;
		rect.set({
			displayTheme: appearance.displayTheme,
			zoneFillColor: appearance.backgroundColor,
			fill: 'rgba(0,0,0,0.2)',
			stroke: preserveStroke ?? 'rgba(255,255,255,0.4)',
			strokeDashArray: [8, 5],
		});
		return;
	}

	const fill = appearance.backgroundColor?.trim() || '#ffffff';
	rect.set({
		displayTheme: null,
		zoneFillColor: fill,
		fill,
		stroke: preserveStroke ?? undefined,
		strokeDashArray: undefined,
	});
}

export function getZoneAppearanceFromSavedZone(zone: {
	theme_id?: string | null;
	themeId?: string | null;
	display_theme?: string | null;
	displayTheme?: string | null;
	background_color?: string | null;
	backgroundColor?: string | null;
}): ZoneDisplayAppearance {
	return getZoneAppearanceFromSaved({
		theme_id: zone.theme_id ?? zone.themeId,
		display_theme: zone.display_theme ?? zone.displayTheme,
		background_color: zone.background_color ?? zone.backgroundColor,
	});
}

/** Resolve fill vs theme for a parsed template zone (html + configuration merge). */
export function getZoneAppearanceFromParsedZone(zone: {
	displayTheme?: string | null;
	backgroundColor?: string;
}): ZoneDisplayAppearance {
	const hasTheme = Boolean(zone.displayTheme?.trim());
	return getZoneAppearanceFromSaved({
		theme_id: zone.displayTheme,
		display_theme: zone.displayTheme,
		background_color: hasTheme ? null : zone.backgroundColor,
		backgroundColor: zone.backgroundColor,
	});
}

/** Zone fields used when painting Fabric rects for list thumbnails. */
export interface ThumbnailZoneConfig {
	theme_id?: string | null;
	display_theme?: string | null;
	background_color?: string | null;
	backgroundColor?: string;
	border?: number | boolean;
	borderColor?: string;
}

type FabricRectSnapshot = {
	fill?: string | null;
	stroke?: string | null;
	strokeDashArray?: number[] | null;
};

/**
 * Capture a PNG from the Fabric canvas for template list thumbnails.
 * Theme zones use HTML overlays in the editor, so their Fabric fill is nearly
 * transparent — temporarily paint each zone with its theme/fill color first.
 */
export function captureTemplateThumbnailFromFabric(
	fc: {
		toDataURL: (opts: { format?: string; quality?: number }) => string;
		requestRenderAll?: () => void;
		renderAll: () => void;
	},
	zoneRects: Array<
		FabricZoneOverlayRect & {
			set?: (props: Record<string, unknown>) => void;
			stroke?: string | null;
			strokeDashArray?: number[] | null;
		}
	>,
	zonesConfig: ThumbnailZoneConfig[],
): string {
	const savedStyles: FabricRectSnapshot[] = zoneRects.map((rect, idx) => {
		const zone = zonesConfig[idx];
		const appearance = zone
			? getZoneAppearanceFromSavedZone(zone)
			: getZoneAppearanceFromRect(rect);

		const prev: FabricRectSnapshot = {
			fill: rect.fill ?? null,
			stroke: rect.stroke ?? null,
			strokeDashArray: rect.strokeDashArray ?? null,
		};

		let fill =
			zone?.backgroundColor?.trim() ||
			(appearance.mode === 'fill' ? appearance.backgroundColor?.trim() : null) ||
			'#ffffff';

		if (appearance.mode === 'theme' && appearance.displayTheme) {
			fill = themeFallbackBackgroundColor(appearance.displayTheme);
		}

		const borderOn = Boolean(zone?.border);
		rect.set?.({
			fill,
			stroke: borderOn ? zone?.borderColor ?? 'black' : 'transparent',
			strokeDashArray: undefined,
		});

		return prev;
	});

	fc.requestRenderAll?.();
	fc.renderAll();
	const dataUrl = fc.toDataURL({ format: 'png', quality: 1 });

	zoneRects.forEach((rect, idx) => {
		const appearance = getZoneAppearanceFromRect(rect);
		const prev = savedStyles[idx];
		if (appearance.mode === 'theme') {
			applyZoneAppearanceToRect(
				{ set: (props) => rect.set?.(props) },
				appearance,
				prev.stroke ?? null,
			);
		} else {
			rect.set?.({
				fill: prev.fill ?? appearance.backgroundColor ?? '#ffffff',
				stroke: prev.stroke,
				strokeDashArray: prev.strokeDashArray,
			});
		}
	});

	fc.renderAll();
	return dataUrl;
}

/** Canvas-pixel bounds for HTML overlays on the template editor canvas. */
export function getZoneOverlayBounds(rect: FabricZoneOverlayRect): {
	left: number;
	top: number;
	width: number;
	height: number;
	borderRadius: number;
} {
	rect.setCoords?.();

	const tl = rect.aCoords?.tl;
	const br = rect.aCoords?.br;
	if (tl && br) {
		return {
			left: Math.min(tl.x, br.x),
			top: Math.min(tl.y, br.y),
			width: Math.abs(br.x - tl.x),
			height: Math.abs(br.y - tl.y),
			borderRadius: rect.rx ?? 0,
		};
	}

	const bound = rect.getBoundingRect?.() ?? {
		left: rect.left ?? 0,
		top: rect.top ?? 0,
		width: (rect.width ?? 0) * (rect.scaleX ?? 1),
		height: (rect.height ?? 0) * (rect.scaleY ?? 1),
	};

	return {
		left: bound.left,
		top: bound.top,
		width: bound.width,
		height: bound.height,
		borderRadius: rect.rx ?? 0,
	};
}
