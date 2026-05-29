import React, { useEffect, useMemo, useRef } from 'react';
import {
	computeDigitalCrimsonFillBaseFontSize,
	computeTokenDisplayFillBaseFontSize,
	getStatusConfig,
	getZoneAppearanceFromSaved,
	resolveZoneCardStyle,
	TOKEN_DISPLAY_NO_TOKEN,
	type ZoneDisplayAppearance,
} from './tokenDisplayThemes';

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

	const inlineStyle = useMemo<React.CSSProperties>(() => {
		if (!resolved.useFillBackground || !resolved.backgroundColor) return {};
		return { backgroundColor: resolved.backgroundColor };
	}, [resolved]);

	const rootClasses = [
		'tdc',
		resolved.themeClass,
		resolved.useFillBackground ? 'tdc--fill-mode' : '',
		resolved.useFillBackground ? `tdc--text-${resolved.textColor}` : '',
		fillContainer ? 'tdc--fill' : '',
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

		const isDigitalCrimson = resolved.themeClass === 'tdc--digital-crimson';

		const applyScale = () => {
			const width = el.clientWidth;
			const height = el.clientHeight;
			if (width < 1 || height < 1) return;
			const tokenLen = displayToken.length;
			const fontSize = isDigitalCrimson
				? computeDigitalCrimsonFillBaseFontSize(width, height, tokenLen)
				: computeTokenDisplayFillBaseFontSize(width, height, tokenLen);
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

	return (
		<div ref={rootRef} className={rootClasses} style={{ ...inlineStyle, ...style }}>
			<div className='tdc__glow' aria-hidden='true' />

			<div className='tdc__header'>
				{queueName ? (
					<span className='tdc__queue-name'>{queueName}</span>
				) : (
					<span className='tdc__queue-name tdc__queue-name--empty' aria-hidden='true' />
				)}
			</div>

			<div className='tdc__body'>
				{subtitle && <div className='tdc__subtitle'>{subtitle}</div>}
				<div className='tdc__token' aria-label={`Token ${displayToken}`}>
					{displayToken}
				</div>
			</div>

			<div className='tdc__footer'>
				<span className={`tdc__status-badge tdc__status-badge--${statusConfig.modifier}`}>
					<span className='tdc__status-icon' aria-hidden='true'>
						{statusConfig.icon}
					</span>
					<span className='tdc__status-label'>{statusConfig.label}</span>
				</span>
			</div>
		</div>
	);
};

export default TokenDisplayThemeCard;
