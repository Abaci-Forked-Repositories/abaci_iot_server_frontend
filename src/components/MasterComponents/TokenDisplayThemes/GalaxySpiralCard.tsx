import React, { memo, useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import GalaxySpiralBackdrop from './GalaxySpiralBackdrop';
import GalaxySpiralClock from './GalaxySpiralClock';
import GalaxySpiralQueueTable from './GalaxySpiralQueueTable';

export interface GalaxySpiralCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const GalaxySpiralCard: React.FC<GalaxySpiralCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier = 'waiting',
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	if (isMultiQueue) {
		return (
			<div className='tdc-gs-layout tdc-gs-layout--table'>
				<GalaxySpiralBackdrop />
				<header className='tdc-gs-table-header'>
					<GalaxySpiralClock />
					<span className='tdc-gs-table-header__count'>{assignedQueues.length} queues</span>
				</header>
				<div className='tdc-gs-table-stage'>
					<GalaxySpiralQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	/**
	 * Stacked by default: clock → meta (queue / counter / status) → orbit.
	 * Side-by-side only kicks in for wide landscape via CSS container query.
	 * Meta must stay a sibling of the orbit (not a crushed grid track).
	 */
	return (
		<div className='tdc-gs-layout'>
			<GalaxySpiralBackdrop />

			<header className='tdc-gs-header'>
				<GalaxySpiralClock />
			</header>

			<div className='tdc-gs-meta'>
				{queueName ? (
					<span className='tdc-gs-queue' title={queueName}>
						{queueName}
					</span>
				) : (
					<span className='tdc-gs-queue tdc-gs-queue--empty' aria-hidden='true' />
				)}
				{subtitle ? (
					<span className='tdc-gs-subtitle' title={subtitle}>
						{subtitle}
					</span>
				) : null}
				<span
					className={['tdc-gs-status', `tdc-gs-status--${statusModifier}`].join(' ')}
					aria-live='polite'>
					{statusLabel}
				</span>
			</div>

			<div className='tdc-gs-orbit' aria-label={`Token ${displayToken}`}>
				<div className='tdc-gs-orbit__rings' aria-hidden='true'>
					<svg className='tdc-gs-orbit__ring tdc-gs-orbit__ring--outer' viewBox='0 0 100 100'>
						<circle cx='50' cy='50' r='46' pathLength='100' />
					</svg>
					<svg className='tdc-gs-orbit__ring tdc-gs-orbit__ring--inner' viewBox='0 0 100 100'>
						<circle cx='50' cy='50' r='46' pathLength='100' />
					</svg>
					<span className='tdc-gs-orbit__core-glow' />
				</div>
				<div className='tdc-gs-orbit__inner'>
					<span className='tdc-gs-token'>{displayToken}</span>
				</div>
			</div>
		</div>
	);
};

export default memo(GalaxySpiralCard);
