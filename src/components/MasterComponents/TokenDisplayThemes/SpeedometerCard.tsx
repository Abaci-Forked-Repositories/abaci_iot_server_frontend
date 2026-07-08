import React, { memo, useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import SpeedometerClock from './SpeedometerClock';
import SpeedometerGauge from './SpeedometerGauge';
import SpeedometerQueueTable from './SpeedometerQueueTable';
import SpeedometerStatusGauge from './SpeedometerStatusGauge';
import SpeedometerToken from './SpeedometerToken';

export interface SpeedometerCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const SpeedometerCard: React.FC<SpeedometerCardProps> = ({
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
			<div className='tdc-cs-layout tdc-cs-layout--table'>
				<header className='tdc-cs-table-header'>
					<div className='tdc-cs-table-header__copy' aria-live='polite'>
						<span className='tdc-cs-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-cs-table-header__meta'>
						<SpeedometerClock />
					</div>
				</header>

				<div className='tdc-cs-table-stage'>
					<SpeedometerQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-cs-layout'>
			<SpeedometerClock queueName={queueName} />

			<div className='tdc-cs-body'>
				<div className='tdc-cs-digital'>
					<div className='tdc-cs-digital__nav' aria-hidden='true'>
						<span className='tdc-cs-digital__nav-dot' />
						<span className='tdc-cs-digital__nav-dot' />
						<span className='tdc-cs-digital__nav-dot tdc-cs-digital__nav-dot--active' />
						<span className='tdc-cs-digital__nav-dot' />
						<span className='tdc-cs-digital__nav-dot' />
					</div>

					<div className='tdc-cs-digital__screen'>
						{subtitle ? <span className='tdc-cs-digital__subtitle'>{subtitle}</span> : null}

						<SpeedometerStatusGauge
							statusModifier={statusModifier}
							statusLabel={statusLabel}
							className='tdc-cs-digital__status-gauge'
						/>
					</div>
				</div>

				<div className='tdc-cs-gauge-wrap' aria-label={`Token ${displayToken}`}>
					<SpeedometerGauge token={displayToken} />
					<div className='tdc-cs-gauge__token' aria-hidden='true'>
						<SpeedometerToken value={displayToken} className='tdc-cs-token--gauge' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(SpeedometerCard);
