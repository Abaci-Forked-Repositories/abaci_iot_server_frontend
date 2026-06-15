import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Queue } from '../../../services/queueManagementApi';
import { TokenDisplayThemeCard } from '../TokenDisplayThemes';
import ActiveTokensTicker from '../../PublicPages/ActiveTokensTicker';
import {
	type FabricZoneOverlayRect,
	getZoneAppearanceFromRect,
	getZoneOverlayBounds,
} from '../../../utils/zoneAppearanceFabric';
import {
	resolveTemplateActiveTokensTickerClass,
	resolveTemplateActiveTokensTickerSlug,
} from '../../../utils/resolveTemplateTickerTheme';
import { parseTemplateLayoutFromHtml } from '../../../utils/parseTemplateZones';
import type { RecentQueueToken } from '../../../services/publicScreenApi';

/** Cycles 01→15 in the template editor so Pipboy flip digits are visible without live queue data. */
const PREVIEW_FLIP_TOKENS = Array.from({ length: 15 }, (_, i) =>
	String(i + 1).padStart(2, '0'),
);
const PREVIEW_FLIP_INTERVAL_MS = 2800;
const PREVIEW_ACTIVE_TOKEN_INTERVAL_MS = 6500;
const MAX_PREVIEW_ACTIVE_TOKENS = 12;

function mockActiveToken(
	tokenDisplay: string,
	counter: string,
	minutesAgo: number,
): RecentQueueToken {
	return {
		token_display: tokenDisplay,
		serving_point_name: `Counter ${counter}`,
		called_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
	};
}

const INITIAL_MOCK_ACTIVE_TOKENS: RecentQueueToken[] = Array.from(
	{ length: MAX_PREVIEW_ACTIVE_TOKENS },
	(_, i) =>
		mockActiveToken(
			`B${String(26 - i).padStart(3, '0')}`,
			String((i % 5) + 1).padStart(2, '0'),
			2 + i * 2,
		),
);

const MOCK_ACTIVE_TOKEN_POOL: Omit<RecentQueueToken, 'called_at'>[] = [
	{ token_display: 'B014', serving_point_name: 'Counter 04' },
	{ token_display: 'B013', serving_point_name: 'Counter 03' },
	{ token_display: 'B012', serving_point_name: 'Counter 02' },
	{ token_display: 'B011', serving_point_name: 'Counter 01' },
	{ token_display: 'B010', serving_point_name: 'Counter 05' },
	{ token_display: 'B009', serving_point_name: 'Counter 04' },
	{ token_display: 'B008', serving_point_name: 'Counter 03' },
	{ token_display: 'B007', serving_point_name: 'Counter 02' },
];

export interface TemplateZoneThemeOverlaysProps {
	zones: FabricZoneOverlayRect[];
	queuesById: Map<number, Queue>;
	/** Bump when canvas zones move/resize so bounds recompute. */
	revision?: number;
	configuration?: Record<string, unknown> | string | null;
	htmlContent?: string | null;
}

const TemplateZoneThemeOverlays: React.FC<TemplateZoneThemeOverlaysProps> = ({
	zones,
	queuesById,
	revision = 0,
	configuration = null,
	htmlContent = null,
}) => {
	const parsedHtmlZones = useMemo(
		() => parseTemplateLayoutFromHtml(htmlContent ?? '')?.zones ?? [],
		[htmlContent],
	);

	const tickerThemeSlug = useMemo(
		() => resolveTemplateActiveTokensTickerSlug(zones, configuration, parsedHtmlZones),
		[zones, configuration, parsedHtmlZones, revision],
	);

	const tickerClassName = useMemo(() => {
		const themeClass = resolveTemplateActiveTokensTickerClass(
			zones,
			configuration,
			parsedHtmlZones,
		);
		return ['pct-bar--compact', themeClass].filter(Boolean).join(' ');
	}, [zones, configuration, parsedHtmlZones, revision]);

	const [previewToken, setPreviewToken] = useState(PREVIEW_FLIP_TOKENS[0]);
	const [activeTokens, setActiveTokens] = useState(INITIAL_MOCK_ACTIVE_TOKENS);
	const activeTokenPoolRef = useRef(0);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setPreviewToken((current) => {
				const index = PREVIEW_FLIP_TOKENS.indexOf(current);
				const nextIndex = index >= 0 ? (index + 1) % PREVIEW_FLIP_TOKENS.length : 0;
				return PREVIEW_FLIP_TOKENS[nextIndex];
			});
		}, PREVIEW_FLIP_INTERVAL_MS);

		return () => window.clearInterval(timer);
	}, []);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const incoming = MOCK_ACTIVE_TOKEN_POOL[activeTokenPoolRef.current % MOCK_ACTIVE_TOKEN_POOL.length];
			activeTokenPoolRef.current += 1;
			setActiveTokens((prev) => [
				{
					...incoming,
					called_at: new Date().toISOString(),
				},
				...prev.filter((t) => t.token_display !== incoming.token_display),
			].slice(0, MAX_PREVIEW_ACTIVE_TOKENS));
		}, PREVIEW_ACTIVE_TOKEN_INTERVAL_MS);

		return () => window.clearInterval(timer);
	}, []);

	return (
		<div
			className={[
				'tdc-canvas-preview-stack',
				tickerThemeSlug ? `tdc-canvas-preview-stack--${tickerThemeSlug}-ticker` : '',
			]
				.filter(Boolean)
				.join(' ')}
			data-ticker-theme={tickerThemeSlug}>
			<div className='tdc-zone-overlays' aria-hidden>
				{zones.map((rect) => {
					const appearance = getZoneAppearanceFromRect(rect);
					if (appearance.mode === 'theme' && !appearance.displayTheme) return null;

					const bounds = getZoneOverlayBounds(rect);
					const queueIds = Array.isArray(rect.queueIds) ? rect.queueIds : [];
					const queueName =
						(queueIds[0] != null ? queuesById.get(queueIds[0])?.name : null) ??
						(Array.isArray(rect.queueChipNames) ? rect.queueChipNames[0] : null) ??
						rect.name ??
						'Queue';
					const zoneOpacity = typeof (rect as any).opacity === 'number' ? (rect as any).opacity : 1;

					return (
						<div
							key={rect.id ?? `${bounds.left}-${bounds.top}`}
							className='tdc-zone-theme-overlay'
							style={{
								left: bounds.left,
								top: bounds.top,
								width: bounds.width,
								height: bounds.height,
								borderRadius: bounds.borderRadius,
								opacity: zoneOpacity,
							}}>
							<TokenDisplayThemeCard
								appearance={appearance}
								queueName={queueName}
								tokenDisplay={previewToken}
								status='waiting'
								fillContainer
							/>
						</div>
					);
				})}
			</div>
			<ActiveTokensTicker
				mockMode={false}
				tokens={activeTokens}
				className={tickerClassName}
			/>
		</div>
	);
};

export default TemplateZoneThemeOverlays;
