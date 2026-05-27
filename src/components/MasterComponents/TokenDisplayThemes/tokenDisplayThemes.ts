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

/** Built-in theme ids — stable slugs stored in the database. */
export const ZONE_DISPLAY_THEME_IDS = [
	'deep-blue',
	'high-contrast',
	'amber',
	'emerald',
	'crimson',
	'midnight',
	'royal-purple',
	'slate',
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
export const DEFAULT_ZONE_DISPLAY_THEME: ZoneDisplayThemeId = 'deep-blue';

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
	'deep-blue': {
		id: 'deep-blue',
		label: 'Deep Blue',
		description: 'Dark navy gradient — elegant and professional',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #1e3a5f 0%, #0d1b3e 60%, #080f20 100%)',
	},
	'high-contrast': {
		id: 'high-contrast',
		label: 'High Contrast',
		description: 'Platinum silver — maximum readability',
		textColor: 'dark',
		previewGradient: 'linear-gradient(145deg, #e8edf2 0%, #c8d0da 55%, #a8b5c2 100%)',
	},
	amber: {
		id: 'amber',
		label: 'Amber',
		description: 'Dark copper/amber — warm and distinctive',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #4a2200 0%, #2a1000 60%, #140800 100%)',
	},
	emerald: {
		id: 'emerald',
		label: 'Emerald',
		description: 'Deep forest green — calm and natural',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #0d3320 0%, #061a10 60%, #030d08 100%)',
	},
	crimson: {
		id: 'crimson',
		label: 'Crimson',
		description: 'Deep crimson — bold and urgent',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #4a0a0a 0%, #2a0505 60%, #140202 100%)',
	},
	midnight: {
		id: 'midnight',
		label: 'Midnight',
		description: 'Pure dark — minimal and bold',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1e 60%, #06060e 100%)',
	},
	'royal-purple': {
		id: 'royal-purple',
		label: 'Royal Purple',
		description: 'Deep violet — modern and premium',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #2e0d4a 0%, #170625 60%, #0a0212 100%)',
	},
	slate: {
		id: 'slate',
		label: 'Slate',
		description: 'Charcoal slate — neutral and versatile',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #2d3748 0%, #1a202c 60%, #0d1117 100%)',
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
