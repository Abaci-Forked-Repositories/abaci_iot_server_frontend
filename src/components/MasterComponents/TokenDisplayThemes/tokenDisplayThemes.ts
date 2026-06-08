/**
 * Zone display appearance — fill color OR a named token display theme.
 *
 * Backend (per zone, when integrated):
 *   - `theme_id`: string slug e.g. `"deep-blue"` | null
 *   - `background_color`: CSS color when using fill mode | null
 *   - `display_theme` / `data-display-theme` — legacy, still read
 *
 * Rules: exactly one visual mode. Theme mode clears fill; fill mode clears theme id.
 */

/**
 * Built-in theme ids — stable slugs stored in the database.
 *
 * Each slug maps to a genuinely different visual design in _token-display-theme.scss:
 *   digital-crimson  — dark crimson + sweep animation + split token/status layout
 *   onyx-gold        — pure black + liquid-gold top rule + gold token
 *   crimson-banner   — modern queue board (dark navy, rotating rings, glass status card)
 *   imperial-court   — dark luxury broadcast UI with wireframe + gold separators
 *   arctic-white     — premium glassmorphism panel with flowing border energy
 *
 * Legacy slugs (midnight-cobalt, deep-blue, high-contrast, amber, emerald, crimson,
 * midnight, royal-purple, slate) are no longer active. Saved zones that still
 * reference them fall back to fill mode gracefully.
 */
export const ZONE_DISPLAY_THEME_IDS = [
	'digital-crimson',
	'onyx-gold',
	'crimson-banner',
	'imperial-court',
	'arctic-white',
] as const;

export type ZoneDisplayThemeId = (typeof ZONE_DISPLAY_THEME_IDS)[number];

export type ZoneAppearanceMode = 'fill' | 'theme';

export interface ZoneDisplayAppearance {
	mode: ZoneAppearanceMode;
	/** Set when mode === 'theme'. Persisted as `theme_id`. */
	displayTheme: ZoneDisplayThemeId | null;
	/** Set when mode === 'fill'. Persisted as `background_color`. */
	backgroundColor: string | null;
}

/** Default theme when neither fill nor theme is configured. */
export const DEFAULT_ZONE_DISPLAY_THEME: ZoneDisplayThemeId = 'digital-crimson';

export type ZoneDisplayTextColor = 'light' | 'dark';

export interface ZoneDisplayThemeConfig {
	id: ZoneDisplayThemeId;
	label: string;
	description: string;
	textColor: ZoneDisplayTextColor;
	previewGradient: string;
}

export const ZONE_DISPLAY_THEME_CONFIGS: Record<
	ZoneDisplayThemeId,
	ZoneDisplayThemeConfig
> = {
	'digital-crimson': {
		id: 'digital-crimson',
		label: 'Digital Crimson',
		description: 'Dark crimson with scan-line animation and split token/status layout',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #6d0b0b 0%, #3a0404 55%, #180000 100%)',
	},
	'onyx-gold': {
		id: 'onyx-gold',
		label: 'Onyx Gold',
		description: 'Pure black with liquid-gold token — luxury premium',
		textColor: 'light',
		previewGradient:
			'linear-gradient(180deg, #e8c96a 0%, #d4af37 12%, #4a3d12 32%, #1a1200 58%, #0a0800 100%)',
	},
	'crimson-banner': {
		id: 'crimson-banner',
		label: 'Modern Queue',
		description: 'Dark cyber board with live indicator, rotating rings, and glass status card',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 40%, rgba(0, 132, 255, 0.2) 0%, #031122 45%, #020817 100%)',
	},
	'imperial-court': {
		id: 'imperial-court',
		label: 'Regal Court',
		description: 'Dark luxury broadcast board with wireframe grid, ambient particles, and gold accents',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 38%, rgba(80, 200, 150, 0.5) 0%, rgba(12, 72, 52, 0.85) 38%, #02140f 72%, #010806 100%)',
	},
	'arctic-white': {
		id: 'arctic-white',
		label: 'Glass Panel',
		description: 'Premium glassmorphism with graphite backdrop, frosted panels, and flowing white border energy',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.42) 0%, rgba(200, 210, 220, 0.18) 32%, #3a3f45 52%, #141618 100%)',
	},
};

// ─── Parse / map backend values ─────────────────────────────────────────────

const THEME_ID_SET = new Set<string>(ZONE_DISPLAY_THEME_IDS);

/** Normalize API/editor string to a valid theme id, or null if unknown. */
export function parseDisplayThemeId(
	value: string | null | undefined,
): ZoneDisplayThemeId | null {
	if (value == null) return null;
	const normalized = String(value).trim().toLowerCase();
	if (!normalized || !THEME_ID_SET.has(normalized)) return null;
	return normalized as ZoneDisplayThemeId;
}

export function isDisplayThemeId(
	value: string | null | undefined,
): value is ZoneDisplayThemeId {
	return parseDisplayThemeId(value) != null;
}

/** Build appearance from saved zone fields (API / configuration.zones). */
export function getZoneAppearanceFromSaved(saved: {
	theme_id?: string | null;
	themeId?: string | null;
	display_theme?: string | null;
	displayTheme?: string | null;
	/** @deprecated Use theme_id — still read for older saves */
	display_template?: string | null;
	/** @deprecated Use displayTheme */
	displayTemplate?: string | null;
	background_color?: string | null;
	backgroundColor?: string | null;
}): ZoneDisplayAppearance {
	const themeRaw =
		saved.theme_id ??
		saved.themeId ??
		saved.display_theme ??
		saved.displayTheme ??
		saved.display_template ??
		saved.displayTemplate;
	const themeId = parseDisplayThemeId(themeRaw);
	if (themeId) {
		return { mode: 'theme', displayTheme: themeId, backgroundColor: null };
	}

	const fill =
		(saved.background_color ?? saved.backgroundColor)?.trim() || null;
	if (fill) {
		return { mode: 'fill', displayTheme: null, backgroundColor: fill };
	}

	return {
		mode: 'fill',
		displayTheme: null,
		backgroundColor: null,
	};
}

/** Payload shape for saving a zone (snake_case for Django-style APIs). */
export function serializeZoneAppearance(appearance: ZoneDisplayAppearance): {
	theme_id: string | null;
	background_color: string | null;
} {
	if (appearance.mode === 'theme' && appearance.displayTheme) {
		return {
			theme_id: appearance.displayTheme,
			background_color: null,
		};
	}
	return {
		theme_id: null,
		background_color: appearance.backgroundColor?.trim() || null,
	};
}

export function createFillAppearance(backgroundColor: string): ZoneDisplayAppearance {
	return {
		mode: 'fill',
		displayTheme: null,
		backgroundColor: backgroundColor.trim(),
	};
}

export function createThemeAppearance(
	themeId: ZoneDisplayThemeId,
): ZoneDisplayAppearance {
	return {
		mode: 'theme',
		displayTheme: themeId,
		backgroundColor: null,
	};
}

/** Theme mode requires a chosen swatch before save. */
export function isZoneThemeSelectionComplete(appearance: ZoneDisplayAppearance): boolean {
	return appearance.mode !== 'theme' || appearance.displayTheme != null;
}

// ─── Resolved card rendering (theme class vs fill background) ─────────────────

export interface ResolvedZoneCardStyle {
	appearance: ZoneDisplayAppearance;
	/** CSS module class on .tdc root, e.g. tdc--deep-blue */
	themeClass: string | null;
	/** true when using zone fill color instead of a named theme */
	useFillBackground: boolean;
	backgroundColor: string | null;
	textColor: ZoneDisplayTextColor;
}

export function resolveZoneCardStyle(
	appearance: ZoneDisplayAppearance,
): ResolvedZoneCardStyle {
	if (appearance.mode === 'theme' && appearance.displayTheme) {
		const config = ZONE_DISPLAY_THEME_CONFIGS[appearance.displayTheme];
		return {
			appearance,
			themeClass: `tdc--${appearance.displayTheme}`,
			useFillBackground: false,
			backgroundColor: null,
			textColor: config.textColor,
		};
	}

	const fill = appearance.backgroundColor?.trim() || null;
	return {
		appearance,
		themeClass: null,
		useFillBackground: true,
		backgroundColor: fill,
		textColor: fill ? getContrastTextColorForBackground(fill) : 'light',
	};
}

/** Rough luminance check for fill-only zones (no named theme). */
export function getContrastTextColorForBackground(color: string): ZoneDisplayTextColor {
	const hex = color.trim();
	let r = 0;
	let g = 0;
	let b = 0;

	const shortHex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
	if (shortHex) {
		r = parseInt(shortHex[1] + shortHex[1], 16);
		g = parseInt(shortHex[2] + shortHex[2], 16);
		b = parseInt(shortHex[3] + shortHex[3], 16);
	} else {
		const fullHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (fullHex) {
			r = parseInt(fullHex[1], 16);
			g = parseInt(fullHex[2], 16);
			b = parseInt(fullHex[3], 16);
		} else {
			const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(hex);
			if (rgba) {
				r = Number(rgba[1]);
				g = Number(rgba[2]);
				b = Number(rgba[3]);
			}
		}
	}

	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.55 ? 'dark' : 'light';
}

// ─── Status display ───────────────────────────────────────────────────────────

export type TokenStatusKey =
	| 'registred'
	| 'waiting'
	| 'serving'
	| 'completed'
	| 'cancelled'
	| 'postponed'
	| 'no_show';

export interface TokenStatusDisplayConfig {
	label: string;
	modifier: string;
	icon: string;
}

export const TOKEN_STATUS_DISPLAY: Record<string, TokenStatusDisplayConfig> = {
	registred: { label: 'Registered', modifier: 'registered', icon: '📋' },
	registered: { label: 'Registered', modifier: 'registered', icon: '📋' },
	waiting: { label: 'Waiting', modifier: 'waiting', icon: '⏱' },
	serving: { label: 'Now Serving', modifier: 'serving', icon: '▶' },
	completed: { label: 'Completed', modifier: 'completed', icon: '✓' },
	cancelled: { label: 'Cancelled', modifier: 'cancelled', icon: '✕' },
	postponed: { label: 'Postponed', modifier: 'postponed', icon: '⏸' },
	no_show: { label: 'No Show', modifier: 'no-show', icon: '⚠' },
};

export function getStatusConfig(status?: string | null): TokenStatusDisplayConfig {
	if (!status) return TOKEN_STATUS_DISPLAY.waiting;
	const normalized = status.toLowerCase().replace(/[^a-z_]/g, '');
	return (
		TOKEN_STATUS_DISPLAY[normalized] ?? {
			label: status,
			modifier: 'unknown',
			icon: '•',
		}
	);
}

export const TOKEN_DISPLAY_NO_TOKEN = '—';

/** Below this count, active-token strip is static and left-aligned (no marquee duplicate). */
export const ACTIVE_TOKENS_MARQUEE_MIN_COUNT = 5;

/**
 * Token size in fill-container mode (see `.tdc--fill .tdc__token` in SCSS).
 * Keep in sync with TOKEN_DISPLAY_FILL_LAYOUT_EM.
 */
/** Token size multiplier in fill mode (see `.tdc--fill .tdc__token` in SCSS). */
export const TOKEN_DISPLAY_FILL_TOKEN_EM = 3.35;

/** Headroom for token pulse/float animations so glyphs stay inside the zone. */
export const TOKEN_DISPLAY_FILL_ANIMATION_MARGIN = 1.06;

export interface FillZoneFontSizeOptions {
	tokenEm?: number;
	bodyColumnFraction?: number;
	animationMargin?: number;
}

/** Token `em` multiplier for `.tdc--fill` — must match theme SCSS overrides. */
export function getFillZoneTokenEm(themeClass: string | null): number {
	switch (themeClass) {
		case 'tdc--onyx-gold':
			return 4.4;
		case 'tdc--arctic-white':
			return 3.45;
		case 'tdc--imperial-court':
			return 3.4;
		default:
			return TOKEN_DISPLAY_FILL_TOKEN_EM;
	}
}

/** Left column share of split fill grid (token column). */
export function getFillZoneBodyColumnFraction(themeClass: string | null): number {
	if (themeClass === 'tdc--crimson-banner') return 1.6 / 2.5;
	return 0.58;
}

/** Split layout: header row + body/status row (matches grid fill zones). */
export const TOKEN_DISPLAY_FILL_SPLIT_LAYOUT_EM = 5.2;

/** Legacy centered layout (non-split). */
export const TOKEN_DISPLAY_FILL_LAYOUT_EM = 7;

/**
 * Base font-size (px) for `.tdc--fill` so queue/token/badge fit inside the zone box.
 * Uses height, width, and token length so shrinking either dimension reduces text.
 */
/** Boost root font-size on large zones (TV / fullscreen signage). */
export function applyFillZoneFontSizeBoost(
	base: number,
	width: number,
	height: number,
): number {
	const minSide = Math.min(Math.max(1, width), Math.max(1, height));
	let boost = 1;
	let maxCap = 52;

	if (minSide >= 320) {
		boost = 1.06;
		maxCap = 58;
	}
	if (minSide >= 480) {
		boost = 1.12;
		maxCap = 68;
	}
	if (minSide >= 720) {
		boost = 1.18;
		maxCap = 80;
	}
	if (minSide >= 1080) {
		boost = 1.24;
		maxCap = 96;
	}

	return Math.max(5, Math.round(Math.min(base * boost, maxCap)));
}

export function computeTokenDisplayFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const fromHeight = h / TOKEN_DISPLAY_FILL_LAYOUT_EM;
	const fromMinSide = Math.min(w, h) / TOKEN_DISPLAY_FILL_LAYOUT_EM;
	const fromTokenWidth =
		w / (chars * TOKEN_DISPLAY_FILL_TOKEN_EM * 0.58 + 1.4);

	const base = Math.min(fromHeight, fromMinSide, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/**
 * Fill layout with status on the right (all themes in `.tdc--fill`):
 * header full-width | token left | status right [ | history row ].
 */
export function computeFillZoneSplitBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	options: FillZoneFontSizeOptions = {},
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const tokenEm = options.tokenEm ?? TOKEN_DISPLAY_FILL_TOKEN_EM;
	const bodyCol = options.bodyColumnFraction ?? 0.58;
	const statusCol = Math.max(0.28, 1 - bodyCol);
	const animationMargin = options.animationMargin ?? TOKEN_DISPLAY_FILL_ANIMATION_MARGIN;

	const layoutEm = hasHistoryStrip
		? TOKEN_DISPLAY_FILL_SPLIT_LAYOUT_EM + 1.4
		: TOKEN_DISPLAY_FILL_SPLIT_LAYOUT_EM;
	const STATUS_FACTOR = 4.6;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;
	const fromTokenWidth =
		(w * bodyCol) / (chars * tokenEm * 0.58 * animationMargin + 1.2);
	const fromStatusWidth = (w * statusCol) / STATUS_FACTOR;

	const base = Math.min(fromHeight, fromMinSide, fromTokenWidth, fromStatusWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** @deprecated Use computeFillZoneSplitBaseFontSize */
export const computeDigitalCrimsonFillBaseFontSize = computeFillZoneSplitBaseFontSize;

/** Pixel font sizes for fill-color zone overlays (Fabric canvas fallback). */
export function computeFillZoneTextSizes(
	width: number,
	height: number,
	tokenLength = 2,
) {
	const base = computeTokenDisplayFillBaseFontSize(width, height, tokenLength);
	return {
		base,
		queueName: Math.round(base),
		subtitle: Math.round(base * 0.9),
		token: Math.round(base * TOKEN_DISPLAY_FILL_TOKEN_EM),
		status: Math.round(base * 0.75),
		gap: Math.max(4, Math.round(base * 0.12)),
	};
}
