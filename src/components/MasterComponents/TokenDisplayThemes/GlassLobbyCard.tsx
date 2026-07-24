import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import GlassLobbyBackdrop from './GlassLobbyBackdrop';
import GlassLobbyClock from './GlassLobbyClock';
import GlassLobbyQueueTable from './GlassLobbyQueueTable';
import GlassLobbyToken from './GlassLobbyToken';
import GlassLobbyTokenParticles from './GlassLobbyTokenParticles';

export interface GlassLobbyCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	previewMode?: boolean;
	assignedQueues?: AssignedQueueDisplay[];
}

const GlassLobbyCard: React.FC<GlassLobbyCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	previewMode = false,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const skipGlowRef = useRef(true);
	const [tokenGlow, setTokenGlow] = useState(false);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (isMultiQueue) return;
		if (skipGlowRef.current) {
			skipGlowRef.current = false;
			return;
		}
		setTokenGlow(true);
		const timer = window.setTimeout(() => setTokenGlow(false), 1200);
		return () => window.clearTimeout(timer);
	}, [displayToken, isMultiQueue]);

	if (isMultiQueue) {
		return (
			<div className='tdc-gl-layout tdc-gl-layout--table'>
				<GlassLobbyBackdrop />

				<header className='tdc-gl-table-header'>
					<div className='tdc-gl-table-header__copy' aria-live='polite'>
						<span className='tdc-gl-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-gl-table-header__meta'>
						<GlassLobbyClock />
					</div>
				</header>

				<div className='tdc-gl-table-stage'>
					<GlassLobbyTokenParticles previewMode={previewMode} density='stage' />
					<GlassLobbyQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-gl-layout'>
			<GlassLobbyBackdrop />

			<div className='tdc-gl-stage'>
				<GlassLobbyTokenParticles previewMode={previewMode} density='stage' />
				<div className='tdc-gl-card tdc-gl-card--queue tdc-gl-float tdc-gl-float--delay-1'>
					<span className='tdc-gl-card__label'>Queue</span>
					<div className='tdc-gl-card__queue-body'>
						{queueName ? (
							<span className='tdc-gl-card__value tdc-gl-card__value--queue'>{queueName}</span>
						) : (
							<span
								className='tdc-gl-card__value tdc-gl-card__value--queue tdc-gl-card__value--empty'
								aria-hidden='true'
							/>
						)}
						<GlassLobbyClock />
					</div>
				</div>

				<div
					className={[
						'tdc-gl-card',
						'tdc-gl-card--token',
						'tdc-gl-float',
						'tdc-gl-float--delay-2',
						tokenGlow ? 'tdc-gl-card--token-glow' : '',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label={`Token ${displayToken}`}>
					<span className='tdc-gl-card__label'>Now Calling</span>
					<div className='tdc-gl-card__token-body'>
						<GlassLobbyToken value={displayToken} previewMode={previewMode} />
					</div>
				</div>

				<div
					className={[
						'tdc-gl-card',
						'tdc-gl-card--status',
						'tdc-gl-float',
						'tdc-gl-float--delay-3',
						`tdc-gl-card--status-${statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					{/* <span className='tdc-gl-card__label'>Status</span> */}
					<div className='tdc-gl-card__status-body'>
						{subtitle ? (
							<span className='tdc-gl-card__sub' title={subtitle}>
								{subtitle}
							</span>
						) : null}
						<span className='tdc-gl-card__value tdc-gl-card__value--status'>{statusLabel}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GlassLobbyCard;
