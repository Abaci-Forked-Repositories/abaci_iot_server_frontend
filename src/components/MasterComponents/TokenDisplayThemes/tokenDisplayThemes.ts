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
 *   pipboy-terminal  — retro CRT terminal with scanlines, flip digits, and green glow
 *   velvet-crown     — royal burgundy lacquer with champagne gold emboss
 *   sun-bento        — neo-brutalist cream card with bold corners and lightning accent
 *   royal-ticket     — perforated royal ticket with gold grid and barcode stub
 *   airport-arrival   — Schiphol-style black wayfinding sign with yellow typography
 *   airport-departure — FIDS split-flap departure board with yellow header bar and rolling digits
 *   oled-pulse        — pure OLED black with violet accent sweep and oversized minimal token
 *   digital-healthcare — clinical white dashboard with blue header and green pulse token
 *   glass-lobby        — frosted glass lobby with floating cards and glowing token
 *   neon-prism         — cyberpunk 3D LED stage with five neon-framed panels and magenta floor glow
 *   aurora-nexus       — aurora cyber dashboard with gradient token digits, glass status, and neon pills
 *   signal-board       — transit LED board with charcoal base, dot-grid hero, cyan LED token, and multi-queue rotation
 *   paper-flip         — book-style paper page with diagonal corner curl on token change
 *   mono-flip          — centered black & white flip card with alternating L/R rotateY and tone inversion on token change
 *   car-speedometer    — automotive dashboard with digital readout, red gauge needle, and responsive token field
 *   royal-luxury       — gilded court diamond lattice on matte black with metallic gold and entrance reveal
 *   galaxy-spiral      — deep-space nebula with twinkling stars and dual dashed orbit rings around the token
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
	'pipboy-terminal',
	'velvet-crown',
	'sun-bento',
	'royal-ticket',
	'airport-arrival',
	'airport-departure',
	'oled-pulse',
	'digital-healthcare',
	'glass-lobby',
	'neon-prism',
	'aurora-nexus',
	'signal-board',
	'paper-flip',
	'mono-flip',
	'car-speedometer',
	'royal-luxury',
	'galaxy-spiral',
] as const;

/** Themes 6–9: active tokens render in a screen-level ticker, not inside each zone card. */
export const SCREEN_TICKER_ZONE_THEME_IDS = [
	'pipboy-terminal',
	'velvet-crown',
	'sun-bento',
	'royal-ticket',
] as const;

export type ScreenTickerZoneThemeId = (typeof SCREEN_TICKER_ZONE_THEME_IDS)[number];

export type ZoneDisplayThemeId = (typeof ZONE_DISPLAY_THEME_IDS)[number];

const SCREEN_TICKER_THEME_SET = new Set<string>(SCREEN_TICKER_ZONE_THEME_IDS);

export function zoneUsesScreenLevelActiveTokensTicker(
	themeId: ZoneDisplayThemeId | null | undefined,
): boolean {
	return themeId != null && SCREEN_TICKER_THEME_SET.has(themeId);
}

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
		description:
			'Dark crimson with scan-line animation, header beam, and split token/status layout',
		textColor: 'light',
		previewGradient: 'linear-gradient(145deg, #6d0b0b 0%, #3a0404 55%, #180000 100%)',
	},
	'onyx-gold': {
		id: 'onyx-gold',
		label: 'Onyx Gold',
		description: 'Pure black with liquid-gold token, header beam, and animated gold column separator',
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
		description:
			'Dark luxury broadcast board with header beam, animated column separator, status border flow, and active-tokens line sweep',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 38%, rgba(80, 200, 150, 0.5) 0%, rgba(12, 72, 52, 0.85) 38%, #02140f 72%, #010806 100%)',
	},
	'arctic-white': {
		id: 'arctic-white',
		label: 'Glass Panel',
		description:
			'Premium glassmorphism with header beam, animated column separator, status border flow, and active-tokens line sweep',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.42) 0%, rgba(200, 210, 220, 0.18) 32%, #3a3f45 52%, #141618 100%)',
	},
	'pipboy-terminal': {
		id: 'pipboy-terminal',
		label: 'Pipboy Terminal',
		description: 'Retro futuristic fallout inspired terminal with CRT scanlines and green glow',
		textColor: 'light',
		previewGradient: 'linear-gradient(135deg, #020a02 0%, #001a00 100%)',
	},
	'velvet-crown': {
		id: 'velvet-crown',
		label: 'Velvet Crown',
		description: 'Royal burgundy lacquer with champagne gold emboss and glossy shimmer',
		textColor: 'light',
		previewGradient: 'linear-gradient(155deg, #3a1228 0%, #1a0a12 55%, #0e0509 100%)',
	},
	'sun-bento': {
		id: 'sun-bento',
		label: 'Sun Bento',
		description: 'Neo-brutalist cream card with bold corners, lightning accent, and playful hover lift',
		textColor: 'dark',
		previewGradient: 'linear-gradient(180deg, #fff492 0%, #ffe566 100%)',
	},
	'royal-ticket': {
		id: 'royal-ticket',
		label: 'Royal Pass',
		description: 'Perforated royal ticket with gold grid, barcode stub, and 3D hover lift',
		textColor: 'light',
		previewGradient: 'linear-gradient(165deg, #1f1830 0%, #14101f 55%, #0a0812 100%)',
	},
	'airport-arrival': {
		id: 'airport-arrival',
		label: 'Arrival Sign',
		description:
			'Airport wayfinding sign with black field, yellow typography, single-queue hero, and multi-queue serving table',
		textColor: 'light',
		previewGradient: 'linear-gradient(180deg, #1a1a1a 0%, #000000 55%, #000000 100%)',
	},
	'airport-departure': {
		id: 'airport-departure',
		label: 'Departure Board',
		description:
			'Airport-style split-flap board with queue, counter, token, and status columns plus rolling digit animation',
		textColor: 'light',
		previewGradient:
			'linear-gradient(180deg, #f5c518 0%, #f5c518 14%, #0c1424 18%, #000000 55%, #000000 100%)',
	},
	'oled-pulse': {
		id: 'oled-pulse',
		label: 'OLED Pulse',
		description:
			'Pure OLED black with continuous violet-mint border glow cycle, oversized token, and minimal status dot',
		textColor: 'light',
		previewGradient: 'linear-gradient(180deg, #141414 0%, #000000 55%, #000000 100%)',
	},
	'digital-healthcare': {
		id: 'digital-healthcare',
		label: 'Health Dashboard',
		description:
			'Clinical white dashboard with blue header, pulsing token card, metric-style active tokens, and multi-queue live board table',
		textColor: 'dark',
		previewGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)',
	},
	'glass-lobby': {
		id: 'glass-lobby',
		label: 'Glass Lobby',
		description:
			'Frosted glassmorphism with hospital lobby blur, floating cards, token glow, and multi-queue live board table',
		textColor: 'light',
		previewGradient:
			'linear-gradient(145deg, #fbcfe8 0%, #c4b5fd 38%, #a78bfa 62%, #6366f1 100%)',
	},
	'neon-prism': {
		id: 'neon-prism',
		label: 'Neon Prism',
		description:
			'Cyberpunk 3D LED stage with five neon-framed dot-matrix panels, cyan rims, magenta floor glow, and multi-queue live board table',
		textColor: 'light',
		previewGradient:
			'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(0, 255, 255, 0.18) 0%, #010820 55%, #000510 100%)',
	},
	'aurora-nexus': {
		id: 'aurora-nexus',
		label: 'Aurora Nexus',
		description:
			'Aurora cyber dashboard with flowing neon ribbons, per-digit gradient token, glass status panel, glowing active-token pills, and multi-queue live board table',
		textColor: 'light',
		previewGradient:
			'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(0, 240, 255, 0.22) 0%, rgba(192, 38, 255, 0.12) 38%, #030510 72%, #010308 100%)',
	},
	'signal-board': {
		id: 'signal-board',
		label: 'Signal Board',
		description:
			'Transit LED board with charcoal base, dot-grid hero, cyan LED token, live clock, and multi-queue rotation',
		textColor: 'light',
		previewGradient:
			'linear-gradient(135deg, #101014 0%, #1c1c22 42%, #25252c 58%, rgba(0, 212, 255, 0.28) 100%)',
	},
	'paper-flip': {
		id: 'paper-flip',
		label: 'Paper Flip',
		description:
			'Book-style paper page with warm desk background, 3D corner peel on token change, and live board table for multiple queues',
		textColor: 'dark',
		previewGradient:
			'linear-gradient(165deg, #d4c4a8 0%, #c8b89a 42%, #a89472 100%)',
	},
	'mono-flip': {
		id: 'mono-flip',
		label: 'Mono Flip',
		description:
			'Authentic black and white signage with a centered flip card that alternates direction and inverts tone when the token changes',
		textColor: 'light',
		previewGradient:
			'radial-gradient(ellipse 120% 90% at 50% 18%, #1c1c1c 0%, #141414 58%, #050505 100%)',
	},
	'car-speedometer': {
		id: 'car-speedometer',
		label: 'Car Speedometer',
		description:
			'Automotive dashboard with OLED black field, digital readout panel, animated red gauge needle, responsive token display, and multi-queue live dashboard table',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 72% 50%, rgba(255, 0, 0, 0.12) 0%, #000000 45%, #000000 100%)',
	},
	'royal-luxury': {
		id: 'royal-luxury',
		label: 'Royal Luxury',
		description:
			'Gilded court diamond lattice on matte black, metallic gold typography, entrance reveal animation, and multi-queue live serving board',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 50% 42%, rgba(212, 175, 55, 0.28) 0%, #121212 42%, #050505 72%, #000000 100%)',
	},
	'galaxy-spiral': {
		id: 'galaxy-spiral',
		label: 'Galaxy Spiral',
		description:
			'Deep-space nebula with twinkling starfield, cyan/magenta dual dashed orbit rings, and multi-queue live serving board',
		textColor: 'light',
		previewGradient:
			'radial-gradient(circle at 68% 38%, rgba(192, 132, 252, 0.35) 0%, rgba(30, 64, 175, 0.25) 38%, #03010c 70%, #000000 100%)',
	},
};

// ─── Parse / map backend values ─────────────────────────────────────────────

const THEME_ID_SET = new Set<string>(ZONE_DISPLAY_THEME_IDS);

/** Legacy slugs still stored on older zones — resolve to the current theme id. */
const DISPLAY_THEME_LEGACY_ALIASES: Partial<Record<string, ZoneDisplayThemeId>> = {
	'page-turn': 'signal-board',
};

/** Normalize API/editor string to a valid theme id, or null if unknown. */
export function parseDisplayThemeId(
	value: string | null | undefined,
): ZoneDisplayThemeId | null {
	if (value == null) return null;
	const normalized = String(value).trim().toLowerCase();
	if (!normalized) return null;
	const resolved = DISPLAY_THEME_LEGACY_ALIASES[normalized] ?? normalized;
	if (!THEME_ID_SET.has(resolved)) return null;
	return resolved as ZoneDisplayThemeId;
}

export function isSignalBoardTheme(value: string | null | undefined): boolean {
	return parseDisplayThemeId(value) === 'signal-board';
}

export function isDisplayThemeId(
	value: string | null | undefined,
): value is ZoneDisplayThemeId {
	return parseDisplayThemeId(value) != null;
}

/** Active Tokens bar modifier — ONLY used when zone theme is pipboy-terminal. */
export const PIPBOY_ACTIVE_TOKENS_TICKER_CLASS = 'pct-bar--pipboy';

export const VELVET_CROWN_ACTIVE_TOKENS_TICKER_CLASS = 'pct-bar--velvet-crown';

export const SUN_BENTO_ACTIVE_TOKENS_TICKER_CLASS = 'pct-bar--sun-bento';

export const ROYAL_TICKET_ACTIVE_TOKENS_TICKER_CLASS = 'pct-bar--royal-ticket';

const ACTIVE_TOKENS_TICKER_THEME_CLASSES: Partial<Record<ZoneDisplayThemeId, string>> = {
	'pipboy-terminal': PIPBOY_ACTIVE_TOKENS_TICKER_CLASS,
	'velvet-crown': VELVET_CROWN_ACTIVE_TOKENS_TICKER_CLASS,
	'sun-bento': SUN_BENTO_ACTIVE_TOKENS_TICKER_CLASS,
	'royal-ticket': ROYAL_TICKET_ACTIVE_TOKENS_TICKER_CLASS,
};

/** CSS modifier for ticker root (empty string when theme has no variant). */
export function getActiveTokensTickerClassForTheme(
	themeId: ZoneDisplayThemeId | null | undefined,
): string {
	if (!themeId) return '';
	return ACTIVE_TOKENS_TICKER_THEME_CLASSES[themeId] ?? '';
}

/** First valid theme slug in list — used for screen-level ticker styling. */
export function resolvePrimaryZoneDisplayTheme(
	themeCandidates: Array<string | null | undefined>,
): ZoneDisplayThemeId | null {
	for (const raw of themeCandidates) {
		const id = parseDisplayThemeId(raw);
		if (id) return id;
	}
	return null;
}

/** Root CSS class(es) for ticker based on the template's primary zone theme. */
export function resolveActiveTokensTickerClass(
	themeCandidates: Array<string | null | undefined>,
): string {
	return getActiveTokensTickerClassForTheme(resolvePrimaryZoneDisplayTheme(themeCandidates));
}

/** True when any candidate resolves to the Pipboy Terminal zone theme. */
export function templateUsesPipboyTerminal(
	themeCandidates: Array<string | null | undefined>,
): boolean {
	return resolvePrimaryZoneDisplayTheme(themeCandidates) === 'pipboy-terminal';
}

export function resolvePipboyActiveTokensTickerClassOnly(
	themeCandidates: Array<string | null | undefined>,
): string {
	return resolveUniformThemedActiveTokensTickerClass(themeCandidates);
}

/**
 * When every themed zone shares one slug that has an Active Tokens bar variant, return its class.
 * Returns '' for mixed templates or themes without a ticker variant.
 */
export function resolveUniformThemedActiveTokensTickerClass(
	themeCandidates: Array<string | null | undefined>,
): string {
	const themes = themeCandidates
		.map(parseDisplayThemeId)
		.filter((t): t is ZoneDisplayThemeId => t != null);

	if (!themes.length) return '';

	const unique = Array.from(new Set(themes));
	if (unique.length !== 1) return '';

	return getActiveTokensTickerClassForTheme(unique[0]);
}

/** Theme slug when template uses a themed Active Tokens bar, else undefined. */
export function resolveUniformThemedActiveTokensTickerSlug(
	themeCandidates: Array<string | null | undefined>,
): ZoneDisplayThemeId | undefined {
	const themes = themeCandidates
		.map(parseDisplayThemeId)
		.filter((t): t is ZoneDisplayThemeId => t != null);

	if (!themes.length) return undefined;

	const unique = Array.from(new Set(themes));
	if (unique.length !== 1) return undefined;

	const slug = unique[0];
	return getActiveTokensTickerClassForTheme(slug) ? slug : undefined;
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
		case 'tdc--pipboy-terminal':
			return 3.1;
		case 'tdc--airport-arrival':
			return 4.4;
		case 'tdc--airport-departure':
			return 4.6;
		case 'tdc--oled-pulse':
			return 4.8;
		case 'tdc--digital-healthcare':
			return 4.2;
		case 'tdc--glass-lobby':
			return 4.6;
		case 'tdc--neon-prism':
			return 4.4;
		case 'tdc--aurora-nexus':
			return 5.2;
		case 'tdc--signal-board':
			return 4.6;
		case 'tdc--paper-flip':
			return 4.4;
		case 'tdc--mono-flip':
			return 4.6;
		case 'tdc--car-speedometer':
			return 4.2;
		case 'tdc--royal-luxury':
			return 4.4;
		case 'tdc--galaxy-spiral':
			return 4.4;
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

/** Pipboy fill layout: header + clock + flip row + status — not the 58/42 split grid. */
export const PIPBOY_FILL_LAYOUT_EM = 9.2;

/** Matches `.tdc--fill.tdc--pipboy-terminal .tdc__body .tdc__token { font-size: 4.5em }`. */
export const PIPBOY_FILL_FLIP_TOKEN_EM = 4.5;

export function computePipboyFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	/** Reserve bottom band for screen-level Active Tokens ticker (editor + live). */
	tickerHeightPx = 0,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height - Math.max(0, tickerHeightPx));
	const chars = Math.max(1, tokenLength);

	const fromHeight = h / PIPBOY_FILL_LAYOUT_EM;
	const fromMinSide = Math.min(w, h) / PIPBOY_FILL_LAYOUT_EM;
	const fromFlipWidth =
		w / (chars * PIPBOY_FILL_FLIP_TOKEN_EM * 0.85 + 2.8);

	const base = Math.min(fromHeight, fromMinSide, fromFlipWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Royal Ticket fill layout: header + large title + perforated stub (not the 58/42 split grid). */
export const ROYAL_TICKET_FILL_LAYOUT_EM = 10.2;

/** Matches `.tdc--fill.tdc--royal-ticket .tdc-rt-title { font-size: … }` cap in fill overrides. */
export const ROYAL_TICKET_FILL_TITLE_EM = 2.2;

export function computeRoyalTicketFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const fromHeight = h / ROYAL_TICKET_FILL_LAYOUT_EM;
	const fromMinSide = Math.min(w, h) / ROYAL_TICKET_FILL_LAYOUT_EM;
	const fromTitleHeight = h / (ROYAL_TICKET_FILL_TITLE_EM + 6.4);
	const fromTitleWidth = w / (chars * ROYAL_TICKET_FILL_TITLE_EM * 0.52 + 1.6);
	const fromStubWidth = w / 11.5;

	const base = Math.min(
		fromHeight,
		fromMinSide,
		fromTitleHeight,
		fromTitleWidth,
		fromStubWidth,
	);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** OLED Pulse fill layout: accent bar + meta row + hero token [+ chip rail]. */
export const OLED_PULSE_FILL_LAYOUT_EM = 8.4;

export const OLED_PULSE_FILL_TABLE_LAYOUT_EM = 9.6;

/** Matches `.tdc-op-token` cap in _oled-pulse.scss. */
export const OLED_PULSE_FILL_TOKEN_EM = 4.8;

export function computeOledPulseFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? OLED_PULSE_FILL_TABLE_LAYOUT_EM
		: OLED_PULSE_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.15 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.2 : 0;
	const metaFraction = 0.16;
	const mainHeight = h * (1 - historyFraction - metaFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = mainHeight / 5.6;
		const fromTableWidth = w / 9;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = mainHeight / (OLED_PULSE_FILL_TOKEN_EM * 1.02);
	const fromTokenWidth = w / (chars * OLED_PULSE_FILL_TOKEN_EM * 0.5 + 0.85);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Digital Healthcare fill layout: topbar + card grid + metric rail. */
export const DIGITAL_HEALTHCARE_FILL_LAYOUT_EM = 9.2;

export const DIGITAL_HEALTHCARE_FILL_TABLE_LAYOUT_EM = 10;

export const DIGITAL_HEALTHCARE_FILL_TOKEN_EM = 4.2;

export function computeDigitalHealthcareFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? DIGITAL_HEALTHCARE_FILL_TABLE_LAYOUT_EM
		: DIGITAL_HEALTHCARE_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.25 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.22 : 0;
	const topbarFraction = 0.12;
	const mainHeight = h * (1 - historyFraction - topbarFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = mainHeight / 5.6;
		const fromTableWidth = w / 9;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = mainHeight / (DIGITAL_HEALTHCARE_FILL_TOKEN_EM * 1.05);
	const fromTokenWidth = (w * 0.88) / (chars * DIGITAL_HEALTHCARE_FILL_TOKEN_EM * 0.52 + 0.75);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Glass Lobby fill layout: floating glass stage + active chip rail. */
export const GLASS_LOBBY_FILL_LAYOUT_EM = 9.4;

export const GLASS_LOBBY_FILL_TABLE_LAYOUT_EM = 10.2;

export const GLASS_LOBBY_FILL_TOKEN_EM = 4.6;

export function computeGlassLobbyFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	activeTokenCount = 4,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);
	const tokens = Math.max(1, activeTokenCount);
	const aspect = w / h;
	const minSide = Math.min(w, h);

	const historyFraction = hasHistoryStrip
		? Math.min(
				0.44,
				0.11 +
					Math.ceil(tokens / 2) * 0.038 +
					(h < 360 ? 0.07 : 0) +
					(aspect > 1.55 ? 0.05 : 0),
			)
		: 0;

	const stageHeight = h * (1 - historyFraction);

	if (hasMultiQueueTable) {
		const layoutBase = hasHistoryStrip
			? GLASS_LOBBY_FILL_TABLE_LAYOUT_EM + 0.85 + Math.ceil(tokens / 2) * 0.28
			: GLASS_LOBBY_FILL_TABLE_LAYOUT_EM;
		const fromHeight = h / layoutBase;
		const fromMinSide = minSide / layoutBase;
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	// Keep in sync with CSS: side-by-side only when wide AND tall enough.
	const sideBySide = w >= 681 && h >= 300;
	const stackedLayout = !sideBySide;

	const layoutEm =
		(hasHistoryStrip
			? GLASS_LOBBY_FILL_LAYOUT_EM + 0.85 + Math.ceil(tokens / 2) * 0.28
			: GLASS_LOBBY_FILL_LAYOUT_EM) +
		(stackedLayout ? 0.55 : 0) +
		(h < 240 ? 1 : h < 360 ? 0.55 : h < 480 ? 0.3 : 0) +
		(aspect > 1.75 ? 0.35 : 0);

	const tokenWidthFraction = stackedLayout ? 0.92 : 0.56;

	let heightFactor = 1;
	if (h < 220) heightFactor = 0.7;
	else if (h < 320) heightFactor = 0.8;
	else if (h < 480) heightFactor = 0.9;

	const fromHeight = (h / layoutEm) * heightFactor;
	const fromMinSide = (minSide / layoutEm) * heightFactor;
	const fromTokenHeight =
		stageHeight / (GLASS_LOBBY_FILL_TOKEN_EM * (stackedLayout ? 1.18 : 1.06));
	const fromTokenWidth =
		(w * tokenWidthFraction) / (chars * GLASS_LOBBY_FILL_TOKEN_EM * 0.52 + 0.85);
	const fromQueueRow = stackedLayout ? w / (2 * 4.6 + 1) : w / (4.6 + 1.1);
	const fromStageOnly = stageHeight / (stackedLayout ? 7.4 : 6.5);

	const base = Math.min(
		fromHeight,
		fromMinSide,
		fromTokenHeight,
		fromTokenWidth,
		fromQueueRow,
		fromStageOnly,
	);

	let result = applyFillZoneFontSizeBoost(base, w, h);
	if (minSide < 520) result = Math.min(result, base * 1.03);
	if (h < 400) result = Math.min(result, base * 1.02);
	if (h < 280) result = Math.max(5, Math.min(result, base));
	return Math.max(5, Math.round(result));
}

/** Neon Prism fill layout: 3D stage panels + neon active-token rail. */
export const NEON_PRISM_FILL_LAYOUT_EM = 8.8;

export const NEON_PRISM_FILL_TABLE_LAYOUT_EM = 10.4;

export const NEON_PRISM_FILL_TOKEN_EM = 4.4;

export function computeNeonPrismFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	activeTokenCount = 4,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);
	const tokens = Math.max(1, activeTokenCount);

	const historyFraction = hasHistoryStrip
		? Math.min(0.34, 0.12 + tokens * 0.038)
		: 0;
	const layoutBase = hasMultiQueueTable
		? NEON_PRISM_FILL_TABLE_LAYOUT_EM
		: NEON_PRISM_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip
		? layoutBase + 1.35 + tokens * 0.08
		: layoutBase;
	const stageHeight = h * (1 - historyFraction);

	const aspect = w / h;
	let narrowFactor = 1;
	if (aspect < 0.38) narrowFactor = 0.72;
	else if (aspect < 0.55) narrowFactor = 0.82;
	else if (aspect < 0.75) narrowFactor = 0.9;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (NEON_PRISM_FILL_TOKEN_EM * 1.08);
	const centerCol = aspect < 0.55 ? 0.52 : 0.36;
	const fromTokenWidth = (w * centerCol) / (chars * NEON_PRISM_FILL_TOKEN_EM * 0.52 + 0.7);
	const wingCol = aspect < 0.55 ? 0.22 : 0.16;
	const fromWingWidth = (w * wingCol) / 3.4;

	const base = Math.min(
		fromHeight,
		fromMinSide,
		fromTokenHeight,
		fromTokenWidth,
		fromWingWidth,
	) * narrowFactor;
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Aurora Nexus fill layout: header + hero/status row + active pill rail. */
export const AURORA_NEXUS_FILL_LAYOUT_EM = 9.2;

export const AURORA_NEXUS_FILL_TABLE_LAYOUT_EM = 10.8;

export const AURORA_NEXUS_FILL_TOKEN_EM = 5.2;

export function computeAuroraNexusFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	activeTokenCount = 4,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);
	const tokens = Math.max(1, activeTokenCount);

	const historyFraction = hasHistoryStrip
		? Math.min(0.32, 0.14 + tokens * 0.032)
		: 0;
	const layoutBase = hasMultiQueueTable
		? AURORA_NEXUS_FILL_TABLE_LAYOUT_EM
		: AURORA_NEXUS_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip
		? layoutBase + 1.2 + tokens * 0.06
		: layoutBase;
	const stageHeight = h * (1 - historyFraction);

	const aspect = w / h;
	let narrowFactor = 1;
	if (aspect < 0.38) narrowFactor = 0.74;
	else if (aspect < 0.55) narrowFactor = 0.84;
	else if (aspect < 0.75) narrowFactor = 0.92;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (AURORA_NEXUS_FILL_TOKEN_EM * 1.02);
	const tokenCol = aspect < 0.55 ? 0.58 : 0.48;
	const fromTokenWidth = (w * tokenCol) / (chars * AURORA_NEXUS_FILL_TOKEN_EM * 0.5 + 0.65);
	const statusCol = aspect < 0.55 ? 0.38 : 0.34;
	const fromStatusWidth = (w * statusCol) / 4.8;

	const base = Math.min(
		fromHeight,
		fromMinSide,
		fromTokenHeight,
		fromTokenWidth,
		fromStatusWidth,
	) * narrowFactor;
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Signal Board fill layout: meta + LED hero stage + active rail. */
export const SIGNAL_BOARD_FILL_LAYOUT_EM = 9.4;

export const SIGNAL_BOARD_FILL_TABLE_LAYOUT_EM = 11.2;

export const SIGNAL_BOARD_FILL_TOKEN_EM = 4.6;

export function computeSignalBoardFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasServingTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasServingTable
		? SIGNAL_BOARD_FILL_TABLE_LAYOUT_EM
		: SIGNAL_BOARD_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + (hasServingTable ? 1.15 : 1.65) : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.2 : 0;
	const stageHeight = h * (1 - historyFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (!hasServingTable) {
		// Single-queue hero: meta row + "Now Calling" cap + active rail eat vertical space.
		const metaFraction = 0.13;
		const heroCapFraction = 0.11;
		const heroMainHeight = stageHeight * (1 - metaFraction - heroCapFraction);
		const fromTokenHeight = heroMainHeight / (SIGNAL_BOARD_FILL_TOKEN_EM * 1.18);
		const fromTokenWidth = (w * 0.82) / (chars * SIGNAL_BOARD_FILL_TOKEN_EM * 0.52 + 0.65);
		const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (SIGNAL_BOARD_FILL_TOKEN_EM * 1.04);
	const fromTokenWidth = (w * 0.52) / (chars * SIGNAL_BOARD_FILL_TOKEN_EM * 0.5 + 0.7);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Paper Flip fill layout: desk padding + paper page + active rail. */
export const PAPER_FLIP_FILL_LAYOUT_EM = 9.2;

export const PAPER_FLIP_FILL_TABLE_LAYOUT_EM = 10.6;

export const PAPER_FLIP_FILL_TOKEN_EM = 4.4;

/** Mono Flip fill layout: header + centered card stage + active rail. */
export const MONO_FLIP_FILL_LAYOUT_EM = 9;

export const MONO_FLIP_FILL_TABLE_LAYOUT_EM = 10.4;

export const MONO_FLIP_FILL_TOKEN_EM = 4.6;

export function computeMonoFlipFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? MONO_FLIP_FILL_TABLE_LAYOUT_EM
		: MONO_FLIP_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.1 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.22 : 0;
	const stageHeight = h * (1 - historyFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (MONO_FLIP_FILL_TOKEN_EM * 1.1);
	const fromTokenWidth = (w * 0.72) / (chars * MONO_FLIP_FILL_TOKEN_EM * 0.54 + 0.48);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

export function computePaperFlipFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? PAPER_FLIP_FILL_TABLE_LAYOUT_EM
		: PAPER_FLIP_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.15 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.22 : 0;
	const pageHeight = h * (1 - historyFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = pageHeight / 5.9;
		const fromTableWidth = w / 9.4;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = pageHeight / (PAPER_FLIP_FILL_TOKEN_EM * 1.12);
	const fromTokenWidth = (w * 0.78) / (chars * PAPER_FLIP_FILL_TOKEN_EM * 0.52 + 0.65);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Airport Arrival fill layout: hazard header + sign hero. */
export const AIRPORT_ARRIVAL_FILL_LAYOUT_EM = 9.2;

export const AIRPORT_ARRIVAL_FILL_TABLE_LAYOUT_EM = 11.4;

export const AIRPORT_ARRIVAL_FILL_TOKEN_EM = 4.4;

export function computeAirportArrivalFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? AIRPORT_ARRIVAL_FILL_TABLE_LAYOUT_EM
		: AIRPORT_ARRIVAL_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip
		? layoutBase + 1.15
		: layoutBase;
	const historyFraction = hasHistoryStrip ? 0.22 : 0;
	const boardHeight = h * (1 - historyFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = boardHeight / 6.1;
		const fromTableWidth = w / 10.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = boardHeight / (AIRPORT_ARRIVAL_FILL_TOKEN_EM * 1.08);
	const fromTokenWidth =
		(w * 0.58) / (chars * AIRPORT_ARRIVAL_FILL_TOKEN_EM * 0.54 + 0.38);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Airport Departure fill layout: yellow header + FIDS table + active rail. */
export const AIRPORT_DEPARTURE_FILL_LAYOUT_EM = 9.2;

export const AIRPORT_DEPARTURE_FILL_TABLE_LAYOUT_EM = 11.6;

export const AIRPORT_DEPARTURE_FILL_TOKEN_EM = 4.6;

export function computeAirportDepartureFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? AIRPORT_DEPARTURE_FILL_TABLE_LAYOUT_EM
		: AIRPORT_DEPARTURE_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.1 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.2 : 0;
	const boardHeight = h * (1 - historyFraction);

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = boardHeight / 6.2;
		const fromTableWidth = w / 10.4;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = boardHeight / (AIRPORT_DEPARTURE_FILL_TOKEN_EM * 1.15);
	const fromTokenWidth = (w * 0.24) / (chars * AIRPORT_DEPARTURE_FILL_TOKEN_EM * 0.52 + 0.42);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth);
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Car Speedometer fill layout: digital panel + gauge + active rail. */
export const CAR_SPEEDOMETER_FILL_LAYOUT_EM = 9;

export const CAR_SPEEDOMETER_FILL_TABLE_LAYOUT_EM = 10.6;

export const CAR_SPEEDOMETER_FILL_TOKEN_EM = 4.2;

export function computeCarSpeedometerFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? CAR_SPEEDOMETER_FILL_TABLE_LAYOUT_EM
		: CAR_SPEEDOMETER_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 1.1 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.2 : 0;
	const stageHeight = h * (1 - historyFraction);

	const aspect = w / h;
	let narrowFactor = 1;
	if (aspect < 0.38) narrowFactor = 0.76;
	else if (aspect < 0.55) narrowFactor = 0.86;
	else if (aspect < 0.75) narrowFactor = 0.94;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (CAR_SPEEDOMETER_FILL_TOKEN_EM * 1.05);
	const gaugeFraction = aspect < 1.1 ? 0.62 : 0.68;
	const tokenInnerFraction = 0.44;
	const fromTokenWidth =
		(w * gaugeFraction * tokenInnerFraction) /
		(chars * CAR_SPEEDOMETER_FILL_TOKEN_EM * 0.54 + 0.35);

	const base = Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth) * narrowFactor;
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Royal Luxury fill layout: brand header + diamond hero / table + active rail. */
export const ROYAL_LUXURY_FILL_LAYOUT_EM = 9.2;

export const ROYAL_LUXURY_FILL_TABLE_LAYOUT_EM = 10.8;

export const ROYAL_LUXURY_FILL_TOKEN_EM = 4.4;

export function computeRoyalLuxuryFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? ROYAL_LUXURY_FILL_TABLE_LAYOUT_EM
		: ROYAL_LUXURY_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 0.85 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.14 : 0;
	const stageHeight = h * (1 - historyFraction);

	const aspect = w / h;
	let narrowFactor = 1;
	if (aspect < 0.38) narrowFactor = 0.72;
	else if (aspect < 0.55) narrowFactor = 0.82;
	else if (aspect < 0.75) narrowFactor = 0.9;
	else if (aspect > 2.4) narrowFactor = 0.88;
	else if (aspect > 1.8) narrowFactor = 0.94;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (ROYAL_LUXURY_FILL_TOKEN_EM * 1.12);
	const diamondFraction = aspect < 1.1 ? 0.48 : aspect > 1.8 ? 0.5 : 0.56;
	const fromTokenWidth =
		(w * diamondFraction) / (chars * ROYAL_LUXURY_FILL_TOKEN_EM * 0.56 + 0.4);
	// Keep counter / subtitle readable: base font tied to meta column share
	const fromMetaWidth = (w * 0.42) / 7.2;

	const base =
		Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth, fromMetaWidth) *
		narrowFactor;
	return applyFillZoneFontSizeBoost(base, w, h);
}

/** Galaxy Spiral fill layout: clock + orbit hero / table + active rail. */
export const GALAXY_SPIRAL_FILL_LAYOUT_EM = 9.0;

export const GALAXY_SPIRAL_FILL_TABLE_LAYOUT_EM = 10.6;

export const GALAXY_SPIRAL_FILL_TOKEN_EM = 4.4;

export function computeGalaxySpiralFillBaseFontSize(
	width: number,
	height: number,
	tokenLength = 2,
	hasHistoryStrip = false,
	hasMultiQueueTable = false,
): number {
	const w = Math.max(1, width);
	const h = Math.max(1, height);
	const chars = Math.max(1, tokenLength);

	const layoutBase = hasMultiQueueTable
		? GALAXY_SPIRAL_FILL_TABLE_LAYOUT_EM
		: GALAXY_SPIRAL_FILL_LAYOUT_EM;
	const layoutEm = hasHistoryStrip ? layoutBase + 0.85 : layoutBase;
	const historyFraction = hasHistoryStrip ? 0.14 : 0;
	const stageHeight = h * (1 - historyFraction);

	const aspect = w / h;
	let narrowFactor = 1;
	if (aspect < 0.38) narrowFactor = 0.72;
	else if (aspect < 0.55) narrowFactor = 0.82;
	else if (aspect < 0.75) narrowFactor = 0.9;
	else if (aspect < 1.05) narrowFactor = 0.92; // near-square stacks meta above orbit
	else if (aspect > 2.4) narrowFactor = 0.88;
	else if (aspect > 1.8) narrowFactor = 0.94;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;

	if (hasMultiQueueTable) {
		const fromTableHeight = stageHeight / 5.8;
		const fromTableWidth = w / 9.2;
		const base = Math.min(fromHeight, fromMinSide, fromTableHeight, fromTableWidth);
		return applyFillZoneFontSizeBoost(base, w, h);
	}

	const fromTokenHeight = stageHeight / (GALAXY_SPIRAL_FILL_TOKEN_EM * 1.12);
	// Near-square / portrait stacks: token uses full width. Wide: ~orbit fraction.
	const orbitFraction = aspect < 1.05 ? 0.72 : aspect > 1.8 ? 0.52 : 0.58;
	const fromTokenWidth =
		(w * orbitFraction) / (chars * GALAXY_SPIRAL_FILL_TOKEN_EM * 0.56 + 0.4);
	// Meta is full-width when stacked; side column only when landscape
	const metaFraction = aspect < 1.05 ? 0.85 : 0.4;
	const fromMetaWidth = (w * metaFraction) / 7.2;

	const base =
		Math.min(fromHeight, fromMinSide, fromTokenHeight, fromTokenWidth, fromMetaWidth) *
		narrowFactor;
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
	const STATUS_STACK_EM = 3.35;
	const historyRowFraction = hasHistoryStrip ? 0.26 : 0;
	const headerRowFraction = 0.11;
	const mainRowHeight = h * (1 - historyRowFraction - headerRowFraction);
	const fromStatusStackHeight = mainRowHeight / STATUS_STACK_EM;

	const fromHeight = h / layoutEm;
	const fromMinSide = Math.min(w, h) / layoutEm;
	const fromTokenWidth =
		(w * bodyCol) / (chars * tokenEm * 0.58 * animationMargin + 1.2);
	const fromStatusWidth = (w * statusCol) / STATUS_FACTOR;

	const base = Math.min(
		fromHeight,
		fromMinSide,
		fromTokenWidth,
		fromStatusWidth,
		fromStatusStackHeight,
	);
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
