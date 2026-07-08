import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import OledPulseClock from './OledPulseClock';
import OledPulseQueueTable from './OledPulseQueueTable';
import OledPulseToken from './OledPulseToken';

export interface OledPulseCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const OledPulseCard: React.FC<OledPulseCardProps> = ({
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
			<div className='tdc-op-layout tdc-op-layout--table'>
				<header className='tdc-op-table-header'>
					<div className='tdc-op-table-header__copy' aria-live='polite'>
						<span className='tdc-op-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-op-table-header__meta'>
						<OledPulseClock />
					</div>
				</header>

				<div className='tdc-op-table-stage'>
					<OledPulseQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-op-layout'>
			<header className='tdc-op-meta'>
				<div className='tdc-op-meta__copy'>
					<div className='tdc-op-meta__lead'>
						{queueName ? (
							<span className='tdc-op-queue' title={`Queue ${queueName}`}>
								{queueName}
							</span>
						) : null}
						<OledPulseClock />
					</div>
					{subtitle ? <span className='tdc-op-subtitle'>{subtitle}</span> : null}
				</div>
				<div className='tdc-op-status' aria-live='polite'>
					<span
						className={`tdc-op-status__dot tdc-op-status__dot--${statusModifier}`}
						aria-hidden='true'
					/>
					<span className='tdc-op-status__label'>{statusLabel}</span>
				</div>
			</header>

			<div className='tdc-op-hero' aria-label={`Token ${displayToken}`}>
				<OledPulseToken value={displayToken} />
			</div>
		</div>
	);
};

export default OledPulseCard;
