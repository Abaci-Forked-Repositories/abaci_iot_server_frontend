import React, { useEffect, useRef, useState } from 'react';
import GlassLobbyBackdrop from './GlassLobbyBackdrop';
import GlassLobbyToken from './GlassLobbyToken';

export interface GlassLobbyCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const GlassLobbyCard: React.FC<GlassLobbyCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => {
	const skipGlowRef = useRef(true);
	const [tokenGlow, setTokenGlow] = useState(false);

	useEffect(() => {
		if (skipGlowRef.current) {
			skipGlowRef.current = false;
			return;
		}
		setTokenGlow(true);
		const timer = window.setTimeout(() => setTokenGlow(false), 1200);
		return () => window.clearTimeout(timer);
	}, [displayToken]);

	return (
		<div className='tdc-gl-layout'>
			<GlassLobbyBackdrop />

			<div className='tdc-gl-stage'>
				<div className='tdc-gl-card tdc-gl-card--queue tdc-gl-float tdc-gl-float--delay-1'>
					<span className='tdc-gl-card__label'>Queue</span>
					{queueName ? (
						<span className='tdc-gl-card__value'>{queueName}</span>
					) : (
						<span className='tdc-gl-card__value tdc-gl-card__value--empty' aria-hidden='true' />
					)}
					{subtitle ? <span className='tdc-gl-card__sub'>{subtitle}</span> : null}
				</div>

				<div
					className={[
						'tdc-gl-card',
						'tdc-gl-card--token',
						'tdc-gl-float',
						'tdc-gl-float--delay-2',
						tokenGlow ? 'tdc-gl-card--glow' : '',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label={`Token ${displayToken}`}>
					<span className='tdc-gl-card__label'>Now Calling</span>
					<GlassLobbyToken value={displayToken} />
				</div>

				<div
					className={[
						'tdc-gl-card',
						'tdc-gl-card--status',
						`tdc-gl-card--status-${statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					<span className='tdc-gl-card__label'>Status</span>
					<span className='tdc-gl-card__value tdc-gl-card__value--status'>{statusLabel}</span>
				</div>
			</div>
		</div>
	);
};

export default GlassLobbyCard;
