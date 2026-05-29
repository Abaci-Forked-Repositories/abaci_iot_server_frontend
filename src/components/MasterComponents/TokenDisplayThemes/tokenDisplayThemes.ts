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
 *   crimson-banner   — two-tone crimson header band / deep-navy body
 *   imperial-court   — emerald stripes + gold rules framing royal magenta
 *   arctic-white     — clean bright white + cobalt token + dark text
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
		previewGradient: 'linear-gradient(160deg, #1a1200 0%, #000000 50%)',
	},
	'crimson-banner': {
		id: 'crimson-banner',
		label: 'Crimson Banner',
		description: 'Bold crimson header band over deep navy — authoritative',
		textColor: 'light',
		previewGradient: 'linear-gradient(180deg, #D90429 0% 45%, #112233 45% 100%)',
	},
	'imperial-court': {
		id: 'imperial-court',
		label: 'Imperial Court',
		description: 'Emerald & gold stripes framing royal magenta — premium',
		textColor: 'light',
		previewGradient:
			'linear-gradient(to bottom, #004b23 0% 14%, #d4af37 14% 17%, #7209b7 17% 83%, #d4af37 83% 86%, #004b23 86% 100%)',
	},
	'arctic-white': {
		id: 'arctic-white',
		label: 'Arctic White',
		description: 'Clean white with cobalt-blue token — maximum readability',
		textColor: 'dark',
		previewGradient: 'linear-gradient(160deg, #ffffff 0%, #e8f0fb 100%)',
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

/**
 * Token size in fill-container mode (see `.tdc--fill .tdc__token` in SCSS).
 * Keep in sync with TOKEN_DISPLAY_FILL_LAYOUT_EM.
 */
export const TOKEN_DISPLAY_FILL_TOKEN_EM = 3;

/** Header + token + footer + gaps ≈ this many `em` vertically in fill mode. */
export const TOKEN_DISPLAY_FILL_LAYOUT_EM = 7;

/**
 * Base font-size (px) for `.tdc--fill` so queue/token/badge fit inside the zone box.
 * Uses height, width, and token length so shrinking either dimension reduces text.
 */
export function computeTokenDisplayFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const fromHeight = h / TOKEN_DISPLAY_FILL_LAYOUT_EM;
	// Shrink when either width or height gets smaller (not only the shorter axis at the end).
	const fromMinSide = Math.min(w, h) / TOKEN_DISPLAY_FILL_LAYOUT_EM;
	// Bold digits ≈ 0.62 × (token em) × char count.
	const fromTokenWidth =
		w / (chars * TOKEN_DISPLAY_FILL_TOKEN_EM * 0.62 + 1.6);

	const base = Math.min(fromHeight, fromMinSide, fromTokenWidth, 48);

	return Math.round(Math.max(5, base));
}

/**
 * Base font-size (px) for the `digital-crimson` fill layout which uses CSS Grid:
 *   - Row 1: full-width header (queue name)
 *   - Row 2 left (58%): serving-point subtitle + token number
 *   - Row 2 right (42%): status badge (flex-column: icon stacked above label)
 *
 * The formula accounts for each column's effective width so the token never
 * overflows the left column and the status badge never overflows the right column.
 */
export function computeDigitalCrimsonFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	// Grid header (~1.5em) + two-column body row (~4em) ≈ 5.5em total
	const LAYOUT_EM = 5.5;
	// Effective left-column fraction after column padding (58% - padding ≈ 55%)
	const TOKEN_COL = 0.55;
	// Empirical divisor so the widest status word ("Postponed", 9 chars) fits
	// in the 42% right column with badge padding (factor verified numerically)
	const STATUS_FACTOR = 4.8;

	const fromHeight = h / LAYOUT_EM;
	const fromMinSide = Math.min(w, h) / LAYOUT_EM;
	const fromTokenWidth =
		(w * TOKEN_COL) / (chars * TOKEN_DISPLAY_FILL_TOKEN_EM * 0.62 + 1.6);
	// Status column: badge font is 0.66em of root, label is 0.88em of badge
	const fromStatusWidth = (w * 0.42) / STATUS_FACTOR;

	const base = Math.min(fromHeight, fromMinSide, fromTokenWidth, fromStatusWidth, 48);
	return Math.round(Math.max(5, base));
}

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
