import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import PaperFlipClock from './PaperFlipClock';
import PaperFlipPageStack from './PaperFlipPageStack';
import PaperFlipQueueTable from './PaperFlipQueueTable';

export interface PaperFlipCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	previewMode?: boolean;
	assignedQueues?: AssignedQueueDisplay[];
}

const PaperFlipCard: React.FC<PaperFlipCardProps> = ({
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
			<div className='tdc-pf-layout tdc-pf-layout--table'>
				<div className='tdc-pf-book tdc-pf-book--table'>
					<div className='tdc-pf-book__desk' aria-hidden='true' />
					<div className='tdc-pf-book__stack tdc-pf-book__stack--table'>
						<div className='tdc-pf-page tdc-pf-page--base tdc-pf-page--table'>
							<header className='tdc-pf-table-header'>
								<div className='tdc-pf-table-header__copy'>
									<PaperFlipClock />
									<span className='tdc-pf-table-header__title'>Live Board</span>
								</div>
								<span className='tdc-pf-table-header__count'>
									{assignedQueues.length} queues
								</span>
							</header>
							<div className='tdc-pf-table-stage'>
								<PaperFlipQueueTable rows={servingRows} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-pf-layout'>
			<PaperFlipPageStack
				token={displayToken}
				queueName={queueName}
				subtitle={subtitle}
				statusLabel={statusLabel}
				statusModifier={statusModifier}
				previewMode={previewMode}
			/>
		</div>
	);
};

export default PaperFlipCard;
