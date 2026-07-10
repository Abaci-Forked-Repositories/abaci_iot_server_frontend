import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ACTIVE_TOKENS_MARQUEE_MIN_COUNT,
	computeAuroraNexusFillBaseFontSize,
	computeAirportArrivalFillBaseFontSize,
	computeAirportDepartureFillBaseFontSize,
	computeCarSpeedometerFillBaseFontSize,
	computeFillZoneSplitBaseFontSize,
	computeDigitalHealthcareFillBaseFontSize,
	computeGlassLobbyFillBaseFontSize,
	computeNeonPrismFillBaseFontSize,
	computeOledPulseFillBaseFontSize,
	computeSignalBoardFillBaseFontSize,
	computePaperFlipFillBaseFontSize,
	computeMonoFlipFillBaseFontSize,
	computePipboyFillBaseFontSize,
	computeRoyalTicketFillBaseFontSize,
	getFillZoneBodyColumnFraction,
	getFillZoneTokenEm,
	getStatusConfig,
	getZoneAppearanceFromSaved,
	resolveZoneCardStyle,
	TOKEN_DISPLAY_NO_TOKEN,
	type ZoneDisplayAppearance,
} from './tokenDisplayThemes';
import type { RecentQueueToken } from '../../../services/publicScreenApi';
import ImperialCourtBackdrop from './ImperialCourtBackdrop';
import TokenDisplayColumnSeparator from './TokenDisplayColumnSeparator';
import ArcticGlassBackdrop from './ArcticGlassBackdrop';
import VelvetCrownBackdrop from './VelvetCrownBackdrop';
import SunBentoCard from './SunBentoCard';
import RoyalTicketCard from './RoyalTicketCard';
import AirportArrivalCard from './AirportArrivalCard';
import AirportDepartureCard from './AirportDepartureCard';
import OledPulseCard from './OledPulseCard';
import OledPulseBorderCycle from './OledPulseBorderCycle';
import HealthcareDashboardCard from './HealthcareDashboardCard';
import GlassLobbyCard from './GlassLobbyCard';
import NeonPrismCard from './NeonPrismCard';
import NeonPrismEnergyScan from './NeonPrismEnergyScan';
import AuroraNexusCard from './AuroraNexusCard';
import AuroraNexusActiveTokens from './AuroraNexusActiveTokens';
import SignalBoardCard from './SignalBoardCard';
import PaperFlipCard from './PaperFlipCard';
import MonoFlipCard from './MonoFlipCard';
import SpeedometerCard from './SpeedometerCard';
import DigitalCrimsonClock from './DigitalCrimsonClock';
import OnyxGoldClock from './OnyxGoldClock';
import ModernQueueBoardClock from './ModernQueueBoardClock';
import ImperialCourtClock from './ImperialCourtClock';
import ArcticGlassClock from './ArcticGlassClock';
import VelvetCrownClock from './VelvetCrownClock';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { useRotatingQueueDisplay } from '../../../hooks/useRotatingQueueDisplay';
import { resolveZoneIsTabularView } from '../../../utils/zoneMultiQueueView';
import {
	PipboyTerminalBackdropLayer,
	PipboyTerminalClockRow,
	PipboyTerminalToken,
} from './PipboyTerminalCard';

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

	/** Template editor / theme picker — flat token numeral without glow panel. */
	previewMode?: boolean;

	/** When 2+ queues are assigned, themes with a live board show the tabular layout. */
	assignedQueues?: AssignedQueueDisplay[];

	/**
	 * Saved zone preference for board-capable themes (`is_tabular_view` from configuration).
	 * When false with multiple queues, the hero rotates every 6 seconds instead.
	 */
	isTabularView?: boolean;

	/**
	 * 0–1 opacity applied ONLY to the zone background (fill color or theme gradient).
	 * Text, borders, and decorations remain at full opacity.
	 * When omitted or 1, the card renders normally with no separate background layer.
	 */
	backgroundOpacity?: number;
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

function historyTokenKey(t: RecentQueueToken): string {
	return `${t.token_display}|${t.serving_point_name ?? ''}|${t.called_at ?? ''}`;
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
	previewMode = false,
	assignedQueues,
	isTabularView,
	backgroundOpacity,
}) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const seenHistoryKeysRef = useRef(new Set<string>());
	const [enteringHistoryKeys, setEnteringHistoryKeys] = useState<ReadonlySet<string>>(
		() => new Set(),
	);

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
	const isPipboyTerminal = resolved.themeClass === 'tdc--pipboy-terminal';
	const isVelvetCrown = resolved.themeClass === 'tdc--velvet-crown';
	const isSunBento = resolved.themeClass === 'tdc--sun-bento';
	const isRoyalTicket = resolved.themeClass === 'tdc--royal-ticket';
	const isAirportArrival = resolved.themeClass === 'tdc--airport-arrival';
	const isAirportDeparture = resolved.themeClass === 'tdc--airport-departure';
	const isOledPulse = resolved.themeClass === 'tdc--oled-pulse';
	const isDigitalHealthcare = resolved.themeClass === 'tdc--digital-healthcare';
	const isGlassLobby = resolved.themeClass === 'tdc--glass-lobby';
	const isNeonPrism = resolved.themeClass === 'tdc--neon-prism';
	const isAuroraNexus = resolved.themeClass === 'tdc--aurora-nexus';
	const isSignalBoard = resolved.themeClass === 'tdc--signal-board';
	const isPaperFlip = resolved.themeClass === 'tdc--paper-flip';
	const isMonoFlip = resolved.themeClass === 'tdc--mono-flip';
	const isCarSpeedometer = resolved.themeClass === 'tdc--car-speedometer';
	const multiQueueCount = assignedQueues?.length ?? 0;
	const useTabularMultiQueue = resolveZoneIsTabularView(
		appearance.displayTheme,
		isTabularView,
		multiQueueCount,
	);
	const isRotatingMultiQueue =
		multiQueueCount > 1 && !useTabularMultiQueue;
	const rotationQueues = useMemo(
		() => (isRotatingMultiQueue ? assignedQueues! : []),
		[isRotatingMultiQueue, assignedQueues],
	);
	const { active: rotatedQueue } = useRotatingQueueDisplay(rotationQueues);
	const cardAssignedQueues = useTabularMultiQueue ? assignedQueues : undefined;
	const showHeaderBeam =
		isDigitalCrimson || isOnyxGold || isImperialCourt || isArcticGlass;

	// Background-only opacity: when < 1 the background is painted in a separate
	// absolute layer (z-index -1) so text and borders stay fully opaque.
	const bgOpacity = backgroundOpacity ?? 1;
	const useBgLayer = bgOpacity < 1;

	const inlineStyle = useMemo<React.CSSProperties>(() => {
		// When using the bg layer, the root div is transparent — background is on the layer.
		if (useBgLayer) return {};
		if (!resolved.useFillBackground || !resolved.backgroundColor) return {};
		return { backgroundColor: resolved.backgroundColor };
	}, [resolved, useBgLayer]);

	const hasHistory =
		fillContainer && Boolean(recentTokens?.length) && !useTabularMultiQueue;
	const activeTokenCount = recentTokens?.length ?? 0;
	const useHistoryMarquee = activeTokenCount >= ACTIVE_TOKENS_MARQUEE_MIN_COUNT;

	const displayToken =
		tokenDisplay != null && tokenDisplay !== '' ? tokenDisplay : TOKEN_DISPLAY_NO_TOKEN;

	const heroLayout = useMemo(() => {
		if (isRotatingMultiQueue) {
			const token =
				rotatedQueue.tokenDisplay != null && rotatedQueue.tokenDisplay !== ''
					? rotatedQueue.tokenDisplay
					: TOKEN_DISPLAY_NO_TOKEN;
			return {
				queueName: rotatedQueue.queueName,
				subtitle: rotatedQueue.servingPointName,
				displayToken: token,
				statusConfig: getStatusConfig(rotatedQueue.statusModifier),
			};
		}
		return {
			queueName: queueName ?? '',
			subtitle: subtitle ?? '',
			displayToken,
			statusConfig,
		};
	}, [
		isRotatingMultiQueue,
		rotatedQueue,
		queueName,
		subtitle,
		displayToken,
		statusConfig,
	]);

	const rootClasses = [
		'tdc',
		resolved.themeClass,
		resolved.useFillBackground ? 'tdc--fill-mode' : '',
		resolved.useFillBackground ? `tdc--text-${resolved.textColor}` : '',
		fillContainer ? 'tdc--fill' : '',
		hasHistory ? 'tdc--has-history' : '',
		hasHistory && !useHistoryMarquee ? 'tdc--history-static' : '',
		previewMode ? 'tdc--preview' : '',
		bgOpacity < 1 ? 'tdc--zone-bg-fade' : '',
		isRotatingMultiQueue ? 'tdc--rotating-multi-queue' : '',
		`tdc--status-${heroLayout.statusConfig.modifier}`,
		className,
	]
		.filter(Boolean)
		.join(' ');

	useEffect(() => {
		if (!fillContainer) return;

		const el = rootRef.current;
		if (!el) return;

		const applyScale = () => {
			const width = el.clientWidth;
			const height = el.clientHeight;
			if (width < 1 || height < 1) return;
			const tokenLen = (isRotatingMultiQueue ? heroLayout.displayToken : displayToken).length;
			const hasHistory = el.classList.contains('tdc--has-history');
			const isPipboy = resolved.themeClass === 'tdc--pipboy-terminal';
			const isOledPulseTheme = resolved.themeClass === 'tdc--oled-pulse';
			const isDigitalHealthcareTheme = resolved.themeClass === 'tdc--digital-healthcare';
			const isGlassLobbyTheme = resolved.themeClass === 'tdc--glass-lobby';
			const isNeonPrismTheme = resolved.themeClass === 'tdc--neon-prism';
			const isAuroraNexusTheme = resolved.themeClass === 'tdc--aurora-nexus';
			const isSignalBoardTheme = resolved.themeClass === 'tdc--signal-board';
			const isPaperFlipTheme = resolved.themeClass === 'tdc--paper-flip';
			const isMonoFlipTheme = resolved.themeClass === 'tdc--mono-flip';
			const isAirportDepartureTheme = resolved.themeClass === 'tdc--airport-departure';
			const isAirportArrivalTheme = resolved.themeClass === 'tdc--airport-arrival';
			const isCarSpeedometerTheme = resolved.themeClass === 'tdc--car-speedometer';
			const neonPrismHasTable =
				isNeonPrismTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const auroraNexusHasTable =
				isAuroraNexusTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const signalBoardHasServingTable =
				isSignalBoardTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const paperFlipHasTable =
				isPaperFlipTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const monoFlipHasTable =
				isMonoFlipTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const airportDepartureHasTable =
				isAirportDepartureTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const airportArrivalHasTable =
				isAirportArrivalTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const carSpeedometerHasTable =
				isCarSpeedometerTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const glassLobbyHasTable =
				isGlassLobbyTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const digitalHealthcareHasTable =
				isDigitalHealthcareTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const oledPulseHasTable =
				isOledPulseTheme && (cardAssignedQueues?.length ?? 0) > 1;
			const isRoyalTicketTheme = resolved.themeClass === 'tdc--royal-ticket';
			const tokenEm = getFillZoneTokenEm(resolved.themeClass);
			const fontSize = isPipboy
				? computePipboyFillBaseFontSize(width, height, tokenLen)
				: isOledPulseTheme
					? computeOledPulseFillBaseFontSize(
							width,
							height,
							tokenLen,
							hasHistory,
							oledPulseHasTable,
						)
					: isDigitalHealthcareTheme
						? computeDigitalHealthcareFillBaseFontSize(
								width,
								height,
								tokenLen,
								hasHistory,
								digitalHealthcareHasTable,
							)
						: isGlassLobbyTheme
							? computeGlassLobbyFillBaseFontSize(
									width,
									height,
									tokenLen,
									hasHistory,
									activeTokenCount,
									glassLobbyHasTable,
								)
							: isNeonPrismTheme
								? computeNeonPrismFillBaseFontSize(
										width,
										height,
										tokenLen,
										hasHistory,
										activeTokenCount,
										neonPrismHasTable,
									)
								: isAuroraNexusTheme
									? computeAuroraNexusFillBaseFontSize(
											width,
											height,
											tokenLen,
											hasHistory,
											activeTokenCount,
											auroraNexusHasTable,
										)
									: isSignalBoardTheme
										? computeSignalBoardFillBaseFontSize(
												width,
												height,
												tokenLen,
												hasHistory,
												signalBoardHasServingTable,
											)
										: isPaperFlipTheme
											? computePaperFlipFillBaseFontSize(
													width,
													height,
													tokenLen,
													hasHistory,
													paperFlipHasTable,
												)
										: isMonoFlipTheme
											? computeMonoFlipFillBaseFontSize(
													width,
													height,
													tokenLen,
													hasHistory,
													monoFlipHasTable,
												)
										: isAirportDepartureTheme
											? computeAirportDepartureFillBaseFontSize(
													width,
													height,
													tokenLen,
													hasHistory,
													airportDepartureHasTable,
												)
										: isAirportArrivalTheme
											? computeAirportArrivalFillBaseFontSize(
													width,
													height,
													tokenLen,
													hasHistory,
													airportArrivalHasTable,
												)
										: isCarSpeedometerTheme
											? computeCarSpeedometerFillBaseFontSize(
													width,
													height,
													tokenLen,
													hasHistory,
													carSpeedometerHasTable,
												)
										: isRoyalTicketTheme
											? computeRoyalTicketFillBaseFontSize(width, height, tokenLen)
											: computeFillZoneSplitBaseFontSize(width, height, tokenLen, hasHistory, {
												tokenEm,
												bodyColumnFraction: getFillZoneBodyColumnFraction(resolved.themeClass),
											});
			el.style.fontSize = `${fontSize}px`;
			if (isPipboy) {
				el.style.setProperty('--tdc-token-chars', String(tokenLen));
			} else {
				el.style.setProperty('--tdc-token-fill-em', String(tokenEm));
				el.style.setProperty('--tdc-token-chars', String(tokenLen));
			}
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
			el.style.removeProperty('--tdc-token-fill-em');
			el.style.removeProperty('--tdc-token-chars');
		};
	}, [
		fillContainer,
		displayToken,
		heroLayout.displayToken,
		isRotatingMultiQueue,
		resolved.themeClass,
		activeTokenCount,
		cardAssignedQueues?.length,
	]);

	useEffect(() => {
		if (!recentTokens?.length) return;

		const added: string[] = [];
		for (const token of recentTokens) {
			const key = historyTokenKey(token);
			if (seenHistoryKeysRef.current.has(key)) continue;
			seenHistoryKeysRef.current.add(key);
			added.push(key);
		}

		if (!added.length) return;

		setEnteringHistoryKeys((prev) => {
			const next = new Set(prev);
			added.forEach((key) => next.add(key));
			return next;
		});
	}, [recentTokens]);

	const clearHistoryEnter = useCallback((key: string) => {
		setEnteringHistoryKeys((prev) => {
			if (!prev.has(key)) return prev;
			const next = new Set(prev);
			next.delete(key);
			return next;
		});
	}, []);

	// Marquee: double list for seamless scroll. Fewer than 5 tokens: show once, static + left-aligned.
	const historyDisplayTokens = useMemo(() => {
		if (!recentTokens?.length) return [];
		return useHistoryMarquee ? [...recentTokens, ...recentTokens] : recentTokens;
	}, [recentTokens, useHistoryMarquee]);

	return (
		<div
			ref={rootRef}
			className={rootClasses}
			style={{
				// When using the bg layer, override the CSS-class background with transparent
				// so only the dedicated background layer (below, z-index:-1) is visible.
				...(useBgLayer ? { isolation: 'isolate', background: 'transparent', backgroundColor: 'transparent' } : {}),
				// Fades in-zone Active Tokens strip backgrounds (themes 1–5) without dimming text.
				...(bgOpacity < 1
					? ({ '--tdc-zone-bg-opacity': bgOpacity } as React.CSSProperties)
					: {}),
				...inlineStyle,
				...style,
			}}>
			{/* ── Background-only opacity layer ─────────────────────────────────────
			    Rendered at z-index:-1 inside an isolate stacking context so that
			    opacity only affects the background, not text/borders/decorations.  */}
			{useBgLayer && (
				<div
					className={['tdc', resolved.themeClass].filter(Boolean).join(' ')}
					style={{
						position: 'absolute',
						inset: 0,
						opacity: bgOpacity,
						zIndex: -1,
						overflow: 'hidden',
						pointerEvents: 'none',
						borderRadius: 'inherit',
						// Fill mode: explicit color (CSS class has no gradient for fill mode)
						...(resolved.useFillBackground && resolved.backgroundColor
							? { background: resolved.backgroundColor }
							: {}),
					}}
					aria-hidden>
					{isImperialCourt && <ImperialCourtBackdrop />}
					{isArcticGlass && <ArcticGlassBackdrop />}
					{isPipboyTerminal && <PipboyTerminalBackdropLayer />}
					{isVelvetCrown && <VelvetCrownBackdrop />}
				</div>
			)}

			{/* Regular backdrop components (full opacity path) */}
			{!useBgLayer && isImperialCourt && <ImperialCourtBackdrop />}
			{!useBgLayer && isArcticGlass && <ArcticGlassBackdrop />}
			{!useBgLayer && isPipboyTerminal && <PipboyTerminalBackdropLayer />}
			{!useBgLayer && isVelvetCrown && <VelvetCrownBackdrop />}

			{isNeonPrism && <NeonPrismEnergyScan />}

			{(isOnyxGold || isArcticGlass || isImperialCourt) && fillContainer && (
				<TokenDisplayColumnSeparator />
			)}

			<div className='tdc__glow' aria-hidden='true' />

			{isOledPulse && <OledPulseBorderCycle />}

			{isSunBento ? (
				<SunBentoCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
				/>
			) : isRoyalTicket ? (
				<RoyalTicketCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
				/>
			) : isAirportArrival ? (
				<AirportArrivalCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					assignedQueues={cardAssignedQueues}
				/>
			) : isAirportDeparture ? (
				<AirportDepartureCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					previewMode={previewMode}
					assignedQueues={cardAssignedQueues}
				/>
			) : isOledPulse ? (
				<OledPulseCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					assignedQueues={cardAssignedQueues}
				/>
			) : isDigitalHealthcare ? (
				<HealthcareDashboardCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					assignedQueues={cardAssignedQueues}
				/>
			) : isGlassLobby ? (
				<GlassLobbyCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					previewMode={previewMode}
					assignedQueues={cardAssignedQueues}
				/>
			) : isNeonPrism ? (
				<div className='tdc-np-shell'>
					<NeonPrismCard
						queueName={heroLayout.queueName}
						subtitle={heroLayout.subtitle}
						displayToken={heroLayout.displayToken}
						statusLabel={heroLayout.statusConfig.label}
						statusModifier={heroLayout.statusConfig.modifier}
						assignedQueues={cardAssignedQueues}
					/>
					{hasHistory && recentTokens && recentTokens.length > 0 && (
						<div
							className={[
								'tdc-np-active',
								useHistoryMarquee ? 'tdc-np-active--marquee' : 'tdc-np-active--fit',
							]
								.filter(Boolean)
								.join(' ')}
							aria-label='Active tokens'
							style={
								{ '--tdc-np-active-count': activeTokenCount } as React.CSSProperties
							}>
							<span className='tdc-np-active__title' aria-hidden='true'>
								Active Tokens
							</span>
							<div className='tdc-np-active__viewport'>
								<div className='tdc-np-active__grid'>
									{(useHistoryMarquee ? historyDisplayTokens : recentTokens).map((t, i) => {
										const counter = shortCounterLabel(t.serving_point_name);
										const tokenKey = historyTokenKey(t);
										const isMarqueeDuplicate = useHistoryMarquee && i >= activeTokenCount;
										const isEntering =
											!isMarqueeDuplicate && enteringHistoryKeys.has(tokenKey);
										return (
											<div
												key={`${tokenKey}-${i}`}
												className={[
													'tdc-np-active__chip',
													isEntering ? 'tdc-np-active__chip--enter' : '',
												]
													.filter(Boolean)
													.join(' ')}
												aria-hidden={isMarqueeDuplicate}
												onAnimationEnd={() => {
													if (isEntering) clearHistoryEnter(tokenKey);
												}}>
												<span className='tdc-np-active__token'>{t.token_display}</span>
												{counter && (
													<span
														className='tdc-np-active__counter'
														title={`Counter ${counter}`}>
														{counter}
													</span>
												)}
												{showHistoryTime && t.called_at && (
													<span className='tdc-np-active__time'>{fmtTime(t.called_at)}</span>
												)}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}
				</div>
			) : isAuroraNexus ? (
				<div className='tdc-an-shell'>
					<AuroraNexusCard
						queueName={heroLayout.queueName}
						subtitle={heroLayout.subtitle}
						displayToken={heroLayout.displayToken}
						statusLabel={heroLayout.statusConfig.label}
						statusModifier={heroLayout.statusConfig.modifier}
						assignedQueues={cardAssignedQueues}
					/>
					{hasHistory && recentTokens && recentTokens.length > 0 && (
						<AuroraNexusActiveTokens
							tokens={recentTokens}
							showHistoryTime={showHistoryTime}
							enteringKeys={enteringHistoryKeys}
							onEnterEnd={clearHistoryEnter}
							tokenKeyFn={historyTokenKey}
							shortCounterLabel={shortCounterLabel}
							fmtTime={fmtTime}
						/>
					)}
				</div>
			) : isSignalBoard ? (
				<SignalBoardCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					assignedQueues={cardAssignedQueues}
				/>
			) : isPaperFlip ? (
				<PaperFlipCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					previewMode={previewMode}
					assignedQueues={cardAssignedQueues}
				/>
			) : isMonoFlip ? (
				<MonoFlipCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					previewMode={previewMode}
					assignedQueues={cardAssignedQueues}
				/>
			) : isCarSpeedometer ? (
				<SpeedometerCard
					queueName={heroLayout.queueName}
					subtitle={heroLayout.subtitle}
					displayToken={heroLayout.displayToken}
					statusLabel={heroLayout.statusConfig.label}
					statusModifier={heroLayout.statusConfig.modifier}
					assignedQueues={cardAssignedQueues}
				/>
			) : (
				<>
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
						{heroLayout.queueName ? (
							<span
								key={isRotatingMultiQueue ? heroLayout.queueName : undefined}
								className='tdc__queue-name'
								aria-live={isRotatingMultiQueue ? 'polite' : undefined}>
								{heroLayout.queueName}
							</span>
						) : (
							<span className='tdc__queue-name tdc__queue-name--empty' aria-hidden='true' />
						)}
						{isDigitalCrimson ? <DigitalCrimsonClock /> : null}
						{isOnyxGold ? <OnyxGoldClock /> : null}
						{isModernQueueBoard ? <ModernQueueBoardClock /> : null}
						{isImperialCourt ? <ImperialCourtClock /> : null}
						{isArcticGlass ? <ArcticGlassClock /> : null}
					</div>

					{isPipboyTerminal && <PipboyTerminalClockRow fillContainer={fillContainer} />}

					<div className='tdc__body'>
						{isModernQueueBoard && (
							<div className='tdc-cb-circles' aria-hidden='true'>
								<div className='tdc-cb-circle tdc-cb-circle--1' />
								<div className='tdc-cb-circle tdc-cb-circle--2' />
								<div className='tdc-cb-circle tdc-cb-circle--3' />
								<div className='tdc-cb-circle tdc-cb-circle--dots' />
							</div>
						)}
						{heroLayout.subtitle && !isPipboyTerminal && (
							<div
								className='tdc__subtitle'
								aria-live={isRotatingMultiQueue ? 'polite' : undefined}>
								{heroLayout.subtitle}
							</div>
						)}
						<div
							className='tdc__token'
							aria-label={`Token ${heroLayout.displayToken}`}
							aria-live={isRotatingMultiQueue ? 'polite' : undefined}>
							{isPipboyTerminal ? (
								<PipboyTerminalToken value={heroLayout.displayToken} />
							) : (
								heroLayout.displayToken
							)}
						</div>
						{isVelvetCrown ? <VelvetCrownClock /> : null}
					</div>

					<div className='tdc__footer'>
						<span
							className={`tdc__status-badge tdc__status-badge--${heroLayout.statusConfig.modifier}`}
							aria-live={isRotatingMultiQueue ? 'polite' : undefined}>
							<span className='tdc__status-icon' aria-hidden='true'>
								{isImperialCourt || isArcticGlass || isVelvetCrown
									? null
									: heroLayout.statusConfig.icon}
							</span>
							<span className='tdc__status-label'>{heroLayout.statusConfig.label}</span>
							{isPipboyTerminal && heroLayout.subtitle ? (
								<span className='tdc__status-subtitle'>{heroLayout.subtitle}</span>
							) : null}
						</span>
					</div>
				</>
			)}

			{/* Glass Lobby — frosted active token chips */}
			{isGlassLobby && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div
					className={[
						'tdc-gl-active',
						useHistoryMarquee ? 'tdc-gl-active--marquee' : 'tdc-gl-active--fit',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label='Active tokens'
					style={{ '--tdc-gl-active-count': activeTokenCount } as React.CSSProperties}>
					<span className='tdc-gl-active__title' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-gl-active__viewport'>
						<div className='tdc-gl-active__grid'>
							{(useHistoryMarquee ? historyDisplayTokens : recentTokens).map((t, i) => {
								const counter = shortCounterLabel(t.serving_point_name);
								const tokenKey = historyTokenKey(t);
								const isMarqueeDuplicate = useHistoryMarquee && i >= activeTokenCount;
								const isEntering =
									!isMarqueeDuplicate && enteringHistoryKeys.has(tokenKey);
								return (
									<div
										key={`${tokenKey}-${i}`}
										className={[
											'tdc-gl-active__chip',
											isEntering ? 'tdc-gl-active__chip--enter' : '',
										]
											.filter(Boolean)
											.join(' ')}
										aria-hidden={isMarqueeDuplicate}
										onAnimationEnd={() => {
											if (isEntering) clearHistoryEnter(tokenKey);
										}}>
										<span className='tdc-gl-active__token'>{t.token_display}</span>
										{counter && (
											<span
												className='tdc-gl-active__counter'
												title={`Counter ${counter}`}>
												{counter}
											</span>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Digital Healthcare — metric-style active token cards (no scrollbar) */}
			{isDigitalHealthcare && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div
					className={[
						'tdc-dh-metrics',
						useHistoryMarquee ? 'tdc-dh-metrics--marquee' : 'tdc-dh-metrics--fit',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label='Active tokens'
					style={{ '--tdc-dh-active-count': activeTokenCount } as React.CSSProperties}>
					<span className='tdc-dh-metrics__title' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-dh-metrics__viewport'>
						<div className='tdc-dh-metrics__grid'>
							{(useHistoryMarquee ? historyDisplayTokens : recentTokens).map((t, i) => {
								const counter = shortCounterLabel(t.serving_point_name);
								const tokenKey = historyTokenKey(t);
								const isMarqueeDuplicate = useHistoryMarquee && i >= activeTokenCount;
								const isEntering =
									!isMarqueeDuplicate && enteringHistoryKeys.has(tokenKey);
								return (
									<div
										key={`${tokenKey}-${i}`}
										className={[
											'tdc-dh-metric-card',
											isEntering ? 'tdc-dh-metric-card--enter' : '',
										]
											.filter(Boolean)
											.join(' ')}
										aria-hidden={isMarqueeDuplicate}
										onAnimationEnd={() => {
											if (isEntering) clearHistoryEnter(tokenKey);
										}}>
										<span className='tdc-dh-metric-card__icon' aria-hidden='true'>
											+
										</span>
										<div className='tdc-dh-metric-card__body'>
											<span className='tdc-dh-metric-card__token'>{t.token_display}</span>
											{counter && (
												<span
													className='tdc-dh-metric-card__counter'
													title={`Counter ${counter}`}>
													{counter}
												</span>
											)}
											{showHistoryTime && t.called_at && (
												<span className='tdc-dh-metric-card__time'>{fmtTime(t.called_at)}</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* OLED Pulse — minimal active-token chip rail */}
			{isOledPulse && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div className='tdc-op-active' aria-label='Active tokens'>
					<span className='tdc-op-active__label' aria-hidden='true'>
						Active
					</span>
					<div className='tdc-op-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-op-active__chip',
										isEntering ? 'tdc-op-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-op-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-op-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-op-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-op-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Signal Board — merged active-token chip rail */}
			{isSignalBoard && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div className='tdc-sig-active' aria-label='Active tokens'>
					<span className='tdc-sig-active__label' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-sig-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-sig-active__chip',
										isEntering ? 'tdc-sig-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-sig-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-sig-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-sig-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-sig-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Paper Flip — active-token chip rail */}
			{isPaperFlip && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div className='tdc-pf-active' aria-label='Active tokens'>
					<span className='tdc-pf-active__label' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-pf-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-pf-active__chip',
										isEntering ? 'tdc-pf-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-pf-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-pf-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-pf-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-pf-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Mono Flip — active-token chip rail */}
			{isMonoFlip && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div className='tdc-mf-active' aria-label='Active tokens'>
					<span className='tdc-mf-active__label' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-mf-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-mf-active__chip',
										isEntering ? 'tdc-mf-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-mf-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-mf-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-mf-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-mf-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Airport Departure — active-token chip rail */}
			{isAirportDeparture && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div className='tdc-ad-active' aria-label='Active tokens'>
					<span className='tdc-ad-active__label' aria-hidden='true'>
						Active Tokens
					</span>
					<div className='tdc-ad-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-ad-active__chip',
										isEntering ? 'tdc-ad-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-ad-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-ad-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-ad-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-ad-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Car Speedometer — active-token chip rail */}
			{isCarSpeedometer && hasHistory && recentTokens && recentTokens.length > 0 && (
				<div
					className={[
						'tdc-cs-active',
						!useHistoryMarquee ? 'tdc-cs-active--static' : '',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label='Active tokens'>
					<span className='tdc-cs-active__label' aria-hidden='true'>
						Active
					</span>
					<div className='tdc-cs-active__scroll'>
						{recentTokens.map((t) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = historyTokenKey(t);
							const isEntering = enteringHistoryKeys.has(tokenKey);
							return (
								<span
									key={tokenKey}
									className={[
										'tdc-cs-active__chip',
										isEntering ? 'tdc-cs-active__chip--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) clearHistoryEnter(tokenKey);
									}}>
									<span className='tdc-cs-active__chip-token'>{t.token_display}</span>
									{counter && (
										<>
											<span className='tdc-cs-active__chip-sep' aria-hidden='true'>
												·
											</span>
											<span className='tdc-cs-active__chip-counter'>{counter}</span>
										</>
									)}
									{showHistoryTime && t.called_at && (
										<span className='tdc-cs-active__chip-time'>{fmtTime(t.called_at)}</span>
									)}
								</span>
							);
						})}
					</div>
				</div>
			)}

			{/* Neon Prism active tokens — rendered inside .tdc-np-shell above */}

			{/* Active tokens strip — only rendered when tokens are provided. */}
			{!isOledPulse && !isDigitalHealthcare && !isGlassLobby && !isNeonPrism && !isSignalBoard && !isCarSpeedometer && hasHistory && historyDisplayTokens.length > 0 && (
				<div
					className={`tdc__history${useHistoryMarquee ? '' : ' tdc__history--static'}`}
					aria-label='Active tokens'
					style={{ '--tdc-history-count': activeTokenCount } as React.CSSProperties}>
					{isDigitalCrimson && <div className='tdc-dc-history-beam' aria-hidden='true' />}
					{isOnyxGold && <div className='tdc-og-history-beam' aria-hidden='true' />}
					{isArcticGlass && <div className='tdc-aw-history-beam' aria-hidden='true' />}
					{isImperialCourt && <div className='tdc-ic-history-beam' aria-hidden='true' />}
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
								const tokenKey = historyTokenKey(t);
								const isMarqueeDuplicate = useHistoryMarquee && i >= activeTokenCount;
								const isEntering =
									!isMarqueeDuplicate && enteringHistoryKeys.has(tokenKey);
								return (
									<div
										key={`${tokenKey}-${i}`}
										className={[
											'tdc__history-card',
											isEntering ? 'tdc__history-card--enter' : '',
										]
											.filter(Boolean)
											.join(' ')}
										aria-hidden={isMarqueeDuplicate}
										onAnimationEnd={() => {
											if (isEntering) clearHistoryEnter(tokenKey);
										}}>
										<span className='tdc__history-token'>{t.token_display}</span>
										{counter && (
											<>
												<span className='tdc__history-counter-label'>
													<span className='tdc__history-counter-label__long'>
														Counter
													</span>
													<span className='tdc__history-counter-label__short'>
														Ctr
													</span>
												</span>
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
