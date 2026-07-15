import React, { memo, useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import RoyalLuxuryBackdrop from './RoyalLuxuryBackdrop';
import RoyalLuxuryClock from './RoyalLuxuryClock';
import RoyalLuxuryQueueTable from './RoyalLuxuryQueueTable';

export interface RoyalLuxuryCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const RoyalLuxuryCard: React.FC<RoyalLuxuryCardProps> = ({
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
			<div className='tdc-rl-layout tdc-rl-layout--table'>
				<RoyalLuxuryBackdrop />
				<header className='tdc-rl-table-header'>
					<RoyalLuxuryClock />
					<span className='tdc-rl-table-header__count'>{assignedQueues.length} queues</span>
				</header>
				<div className='tdc-rl-table-stage'>
					<RoyalLuxuryQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-rl-layout'>
			<RoyalLuxuryBackdrop />

			<header className='tdc-rl-header'>
				{/* <div className='tdc-rl-brand'>
					<span className='tdc-rl-brand__eyebrow'>The Luxury</span>
					<span className='tdc-rl-brand__title'>Gilded Court</span>
				</div> */}
				<RoyalLuxuryClock />
			</header>

			<div className='tdc-rl-body'>
				<div className='tdc-rl-meta'>
					{queueName ? (
						<span className='tdc-rl-queue' title={queueName}>
							{queueName}
						</span>
					) : (
						<span className='tdc-rl-queue tdc-rl-queue--empty' aria-hidden='true' />
					)}
					{subtitle ? (
						<span className='tdc-rl-subtitle' title={subtitle}>
							{subtitle}
						</span>
					) : null}
					<span
						className={[
							'tdc-rl-status',
							`tdc-rl-status--${statusModifier}`,
						].join(' ')}
						aria-live='polite'>
						{statusLabel}
					</span>
				</div>

				<div className='tdc-rl-diamond' aria-label={`Token ${displayToken}`}>
					<div className='tdc-rl-diamond__frame'>
						<div className='tdc-rl-diamond__inner'>
							<span className='tdc-rl-diamond__caption'>Now Serving</span>
							<span className='tdc-rl-token'>{displayToken}</span>
							<span className='tdc-rl-diamond__flare' aria-hidden='true' />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(RoyalLuxuryCard);
