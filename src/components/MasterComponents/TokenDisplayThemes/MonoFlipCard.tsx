import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import MonoFlipCardStack from './MonoFlipCardStack';
import MonoFlipClock from './MonoFlipClock';
import MonoFlipQueueTable from './MonoFlipQueueTable';

export interface MonoFlipCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	previewMode?: boolean;
	assignedQueues?: AssignedQueueDisplay[];
}

const MonoFlipCard: React.FC<MonoFlipCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	previewMode = false,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	if (isMultiQueue) {
		return (
			<div className='tdc-mf-layout tdc-mf-layout--table'>
				<header className='tdc-mf-table-header'>
					<div className='tdc-mf-table-header__copy'>
						<MonoFlipClock />
						<span className='tdc-mf-table-header__title'>Live Board</span>
					</div>
					<div className='tdc-mf-table-header__meta' aria-live='polite'>
						<span className='tdc-mf-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
				</header>

				<div className='tdc-mf-table-stage'>
					<MonoFlipQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<MonoFlipCardStack
			token={displayToken}
			queueName={queueName}
			subtitle={subtitle}
			statusLabel={statusLabel}
			statusModifier={statusModifier}
			previewMode={previewMode}
		/>
	);
};

export default MonoFlipCard;
