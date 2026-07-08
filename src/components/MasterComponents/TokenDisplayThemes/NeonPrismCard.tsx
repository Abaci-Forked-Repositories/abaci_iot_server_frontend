import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import { NeonPrismDateDisplay, NeonPrismHeaderClock, NeonPrismTimeDisplay } from './NeonPrismClock';
import NeonPrismQueueTable from './NeonPrismQueueTable';
import NeonPrismToken from './NeonPrismToken';

export interface NeonPrismCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const NeonPrismCard: React.FC<NeonPrismCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	if (isMultiQueue) {
		return (
			<div className='tdc-np-layout tdc-np-layout--table'>
				<div className='tdc-np-ambient' aria-hidden='true'>
					<div className='tdc-np-ambient__glow tdc-np-ambient__glow--left' />
					<div className='tdc-np-ambient__glow tdc-np-ambient__glow--right' />
					<div className='tdc-np-ambient__floor' />
				</div>

				<header className='tdc-np-table-header'>
					<div className='tdc-np-table-header__copy' aria-live='polite'>
						<span className='tdc-np-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-np-table-header__meta'>
						<NeonPrismHeaderClock />
					</div>
				</header>

				<div className='tdc-np-table-stage'>
					<NeonPrismQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-np-layout'>
			<div className='tdc-np-ambient' aria-hidden='true'>
				<div className='tdc-np-ambient__glow tdc-np-ambient__glow--left' />
				<div className='tdc-np-ambient__glow tdc-np-ambient__glow--right' />
				<div className='tdc-np-ambient__floor' />
			</div>

			<div className='tdc-np-stage'>
				<div className='tdc-np-panel tdc-np-panel--edge tdc-np-panel--far-left' aria-hidden='true'>
					<div className='tdc-np-panel__grid' />
					<div className='tdc-np-panel__rim' />
					<div className='tdc-np-panel__floor-glow' />
				</div>

				<div className='tdc-np-panel tdc-np-panel--wing tdc-np-panel--near-left'>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-wing'>
						<div className='tdc-np-wing__main'>
							<span className='tdc-np-wing__label'>Queue</span>
							<div className='tdc-np-wing__queue-body'>
								{queueName ? (
									<span className='tdc-np-wing__value tdc-np-wing__value--queue'>{queueName}</span>
								) : (
									<span
										className='tdc-np-wing__value tdc-np-wing__value--queue tdc-np-wing__value--empty'
										aria-hidden='true'
									/>
								)}
							</div>
							{subtitle ? <span className='tdc-np-wing__sub'>{subtitle}</span> : null}
						</div>
						<div className='tdc-np-wing__foot'>
							<NeonPrismDateDisplay />
						</div>
					</div>
				</div>

				<div
					className='tdc-np-panel tdc-np-panel--center'
					aria-label={`Token ${displayToken}`}>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-hero'>
						<span className='tdc-np-hero__label'>Now Serving</span>
						<NeonPrismToken value={displayToken} />
					</div>
				</div>

				<div
					className={[
						'tdc-np-panel',
						'tdc-np-panel--wing',
						'tdc-np-panel--near-right',
						`tdc-np-panel--status-${statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					<div className='tdc-np-panel__grid' aria-hidden='true' />
					<div className='tdc-np-panel__rim' aria-hidden='true' />
					<div className='tdc-np-panel__floor-glow' aria-hidden='true' />
					<div className='tdc-np-wing tdc-np-wing--status'>
						<div className='tdc-np-wing__main'>
							<span className='tdc-np-wing__label'>Status</span>
							<div className='tdc-np-wing__status-body'>
								<span className='tdc-np-wing__value tdc-np-wing__value--status'>
									<span className='tdc-np-status-dot' aria-hidden='true' />
									<span className='tdc-np-status-text'>{statusLabel}</span>
								</span>
							</div>
						</div>
						<div className='tdc-np-wing__foot'>
							<NeonPrismTimeDisplay />
						</div>
					</div>
				</div>

				<div className='tdc-np-panel tdc-np-panel--edge tdc-np-panel--far-right' aria-hidden='true'>
					<div className='tdc-np-panel__grid' />
					<div className='tdc-np-panel__rim' />
					<div className='tdc-np-panel__floor-glow' />
				</div>
			</div>
		</div>
	);
};

export default NeonPrismCard;
