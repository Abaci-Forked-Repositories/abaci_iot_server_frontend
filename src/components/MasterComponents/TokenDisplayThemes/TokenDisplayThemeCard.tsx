import React, { useEffect, useMemo, useRef } from 'react';
import {
	ACTIVE_TOKENS_MARQUEE_MIN_COUNT,
	computeFillZoneSplitBaseFontSize,
	getStatusConfig,
	getZoneAppearanceFromSaved,
	resolveZoneCardStyle,
	TOKEN_DISPLAY_NO_TOKEN,
	type ZoneDisplayAppearance,
} from './tokenDisplayThemes';
import type { RecentQueueToken } from '../../../services/publicScreenApi';
import ImperialCourtBackdrop from './ImperialCourtBackdrop';
import ArcticGlassBackdrop from './ArcticGlassBackdrop';

export interface TokenDisplayThemeCardProps {
	queueName?: string;
	subtitle?: string;
	tokenDisplay?: string | null;
	status?: string | null;
	fillContainer?: boolean;
	className?: string;
	style?: React.CSSProperties;

	/**
	 * Preferred: unified fill vs theme mode.
	 * Use this when the zone editor already resolved appearance.
	 */
	appearance?: ZoneDisplayAppearance;

	/**
	 * Saved theme id from backend (`display_theme`).
	 * Used when `appearance` is omitted. Valid slugs: deep-blue, high-contrast, etc.
	 */
	displayTheme?: string | null;

	/**
	 * Zone fill color from backend (`background_color`).
	 * Used when no valid `display_theme` is set (fill mode).
	 */
	backgroundColor?: string | null;

	/**
	 * Other active tokens for this zone's queue (`other_current_tokens` from API).
	 * When provided the card shows a scrolling strip at the bottom.
	 */
	recentTokens?: RecentQueueToken[];

	/** Show called-at time on mini cards (off in template editor preview). */
	showHistoryTime?: boolean;
}

/** Short counter label: "Counter 03" → "03", "COUNTER 4" → "04". */
function shortCounterLabel(name: string | undefined): string | null {
	if (!name) return null;
	const m = name.match(/\d+$/);
	return m ? m[0].padStart(2, '0') : name;
}

function fmtTime(iso: string | undefined): string {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		return Number.isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	} catch { return iso; }
}

const TokenDisplayThemeCard: React.FC<TokenDisplayThemeCardProps> = ({
	queueName,
	subtitle,
	tokenDisplay,
	status,
	fillContainer = false,
	className = '',
	style,
	appearance: appearanceProp,
	displayTheme,
	backgroundColor,
	recentTokens,
	showHistoryTime = true,
}) => {
	const rootRef = useRef<HTMLDivElement>(null);

	const appearance = useMemo(
		() =>
			appearanceProp ??
			getZoneAppearanceFromSaved({
				display_theme: displayTheme,
				background_color: backgroundColor,
			}),
		[appearanceProp, displayTheme, backgroundColor],
	);

	const resolved = useMemo(() => resolveZoneCardStyle(appearance), [appearance]);
	const statusConfig = getStatusConfig(status);
	const isDigitalCrimson = resolved.themeClass === 'tdc--digital-crimson';
	const isOnyxGold = resolved.themeClass === 'tdc--onyx-gold';
	const isModernQueueBoard = resolved.themeClass === 'tdc--crimson-banner';
	const isImperialCourt = resolved.themeClass === 'tdc--imperial-court';
	const isArcticGlass = resolved.themeClass === 'tdc--arctic-white';
	const showEnergyDivider = fillContainer && (isDigitalCrimson || isOnyxGold);
	const showHeaderBeam =
		isDigitalCrimson || isOnyxGold || isImperialCourt || isArcticGlass;

	const inlineStyle = useMemo<React.CSSProperties>(() => {
		if (!resolved.useFillBackground || !resolved.backgroundColor) return {};
		return { backgroundColor: resolved.backgroundColor };
	}, [resolved]);

	const hasHistory = fillContainer && Boolean(recentTokens?.length);
	const activeTokenCount = recentTokens?.length ?? 0;
	const useHistoryMarquee = activeTokenCount >= ACTIVE_TOKENS_MARQUEE_MIN_COUNT;

	const rootClasses = [
		'tdc',
		resolved.themeClass,
		resolved.useFillBackground ? 'tdc--fill-mode' : '',
		resolved.useFillBackground ? `tdc--text-${resolved.textColor}` : '',
		fillContainer ? 'tdc--fill' : '',
		hasHistory ? 'tdc--has-history' : '',
		hasHistory && !useHistoryMarquee ? 'tdc--history-static' : '',
		`tdc--status-${statusConfig.modifier}`,
		className,
	]
		.filter(Boolean)
		.join(' ');

	const displayToken =
		tokenDisplay != null && tokenDisplay !== '' ? tokenDisplay : TOKEN_DISPLAY_NO_TOKEN;

	useEffect(() => {
		if (!fillContainer) return;

		const el = rootRef.current;
		if (!el) return;

		const applyScale = () => {
			const width = el.clientWidth;
			const height = el.clientHeight;
			if (width < 1 || height < 1) return;
			const tokenLen = displayToken.length;
			const hasHistory = el.classList.contains('tdc--has-history');
			const fontSize = computeFillZoneSplitBaseFontSize(
				width,
				height,
				tokenLen,
				hasHistory,
			);
			el.style.fontSize = `${fontSize}px`;
		};

		applyScale();
		const raf = requestAnimationFrame(applyScale);

		const observer = new ResizeObserver(() => {
			applyScale();
		});
		observer.observe(el);

		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
			el.style.fontSize = '';
		};
	}, [fillContainer, displayToken, resolved.themeClass]);

	// Marquee: double list for seamless scroll. Fewer than 5 tokens: show once, static + left-aligned.
	const historyDisplayTokens = useMemo(() => {
		if (!recentTokens?.length) return [];
		return useHistoryMarquee ? [...recentTokens, ...recentTokens] : recentTokens;
	}, [recentTokens, useHistoryMarquee]);

	return (
		<div ref={rootRef} className={rootClasses} style={{ ...inlineStyle, ...style }}>
			{isImperialCourt && <ImperialCourtBackdrop />}
			{isArcticGlass && <ArcticGlassBackdrop />}
			{isArcticGlass && (
				<div className='tdc-aw-divider' aria-hidden='true'>
					<span />
				</div>
			)}
			{showEnergyDivider && (
				<div className='tdc-be-divider' aria-hidden='true'>
					<span />
				</div>
			)}

			<div className='tdc__glow' aria-hidden='true' />

			<div className='tdc__header'>
				{showHeaderBeam && (
					<div
						className={
							isImperialCourt
								? 'tdc-ic-header-beam'
								: isArcticGlass
									? 'tdc-aw-header-beam'
									: 'tdc-be-header-beam'
						}
						aria-hidden='true'
					/>
				)}
				{queueName ? (
					<span className='tdc__queue-name'>{queueName}</span>
				) : (
					<span className='tdc__queue-name tdc__queue-name--empty' aria-hidden='true' />
				)}
			</div>

			<div className='tdc__body'>
				{isModernQueueBoard && (
					<div className='tdc-cb-circles' aria-hidden='true'>
						<div className='tdc-cb-circle tdc-cb-circle--1' />
						<div className='tdc-cb-circle tdc-cb-circle--2' />
						<div className='tdc-cb-circle tdc-cb-circle--3' />
						<div className='tdc-cb-circle tdc-cb-circle--dots' />
					</div>
				)}
				{subtitle && <div className='tdc__subtitle'>{subtitle}</div>}
				<div className='tdc__token' aria-label={`Token ${displayToken}`}>
					{displayToken}
				</div>
			</div>

			<div className='tdc__footer'>
				<span className={`tdc__status-badge tdc__status-badge--${statusConfig.modifier}`}>
					<span className='tdc__status-icon' aria-hidden='true'>
						{isImperialCourt || isArcticGlass ? null : statusConfig.icon}
					</span>
					<span className='tdc__status-label'>{statusConfig.label}</span>
				</span>
			</div>

			{/* Active tokens strip — only rendered when tokens are provided. */}
			{hasHistory && historyDisplayTokens.length > 0 && (
				<div
					className={`tdc__history${useHistoryMarquee ? '' : ' tdc__history--static'}`}
					aria-label='Active tokens'
					style={{ '--tdc-history-count': activeTokenCount } as React.CSSProperties}>
					<div className='tdc__history-label' aria-hidden>
						<span className='tdc__history-label-divider' />
						<span className='tdc__history-label-text'>
							<span className='tdc__history-label-word'>Active</span>
							<span className='tdc__history-label-word'>Tokens</span>
						</span>
						<span className='tdc__history-label-divider' />
					</div>
					<div className='tdc__history-track'>
						<div className='tdc__history-scroll'>
							{historyDisplayTokens.map((t, i) => {
								const counter = shortCounterLabel(t.serving_point_name);
								return (
									<div
										key={`${t.token_display}-${t.serving_point_name ?? ''}-${i}`}
										className='tdc__history-card'
										aria-hidden={useHistoryMarquee && i >= activeTokenCount}>
										<span className='tdc__history-token'>{t.token_display}</span>
										{counter && (
											<>
												<span className='tdc__history-counter-label'>Counter</span>
												<span className='tdc__history-counter-num'>{counter}</span>
											</>
										)}
										{showHistoryTime && t.called_at && (
											<span className='tdc__history-time'>{fmtTime(t.called_at)}</span>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TokenDisplayThemeCard;
