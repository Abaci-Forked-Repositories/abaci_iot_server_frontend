import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import AirportArrivalHeader from './AirportArrivalHeader';
import AirportArrivalHero from './AirportArrivalHero';
import AirportArrivalQueueTable from './AirportArrivalQueueTable';

export interface AirportArrivalCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const AirportArrivalCard: React.FC<AirportArrivalCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier = 'waiting',
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;

	const active = useMemo<AssignedQueueDisplay>(() => {
		if (assignedQueues.length === 1) return assignedQueues[0];
		return {
			queueName: queueName?.trim() || 'Queue',
			servingPointName: subtitle?.trim() || '',
			tokenDisplay: displayToken,
			statusLabel,
			statusModifier,
			subtitle: subtitle?.trim() || '',
			recentTokens: [],
		};
	}, [assignedQueues, queueName, displayToken, statusLabel, statusModifier, subtitle]);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	return (
		<div
			className={['tdc-aa-layout', isMultiQueue ? 'tdc-aa-layout--multi' : '']
				.filter(Boolean)
				.join(' ')}>
			<AirportArrivalHeader />
			<div className='tdc-aa-main'>
				{isMultiQueue ? (
					<AirportArrivalQueueTable rows={servingRows} />
				) : (
					<AirportArrivalHero
						queueName={active.queueName}
						subtitle={active.servingPointName || active.subtitle || undefined}
						displayToken={active.tokenDisplay}
						statusLabel={active.statusLabel}
					/>
				)}
			</div>
		</div>
	);
};

export default AirportArrivalCard;
