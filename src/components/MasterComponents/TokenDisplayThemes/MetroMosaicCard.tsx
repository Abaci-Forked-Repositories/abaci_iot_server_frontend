import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import MetroMosaicClock from './MetroMosaicClock';
import MetroMosaicMapField from './MetroMosaicMapField';
import MetroMosaicQueueTable from './MetroMosaicQueueTable';
import MetroMosaicToken from './MetroMosaicToken';

export interface MetroMosaicCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const LINE_RIBBONS = ['orange', 'red', 'sky', 'green', 'silver', 'gold'] as const;

const MetroMosaicCard: React.FC<MetroMosaicCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier = 'waiting',
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const [tokenSlide, setTokenSlide] = useState(false);
	const prevTokenRef = useRef(displayToken);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (prevTokenRef.current === displayToken) return;
		prevTokenRef.current = displayToken;
		setTokenSlide(true);
		const timer = window.setTimeout(() => setTokenSlide(false), 720);
		return () => window.clearTimeout(timer);
	}, [displayToken]);

	if (isMultiQueue) {
		return (
			<div className='tdc-mm-layout tdc-mm-layout--table'>
				<MetroMosaicMapField />
				<header className='tdc-mm-table-header'>
					<div className='tdc-mm-line-ribbons' aria-hidden='true'>
						{LINE_RIBBONS.map((line) => (
							<span key={line} className={`tdc-mm-line-ribbon tdc-mm-line-ribbon--${line}`} />
						))}
					</div>
					<MetroMosaicClock />
					<span className='tdc-mm-table-header__count'>{assignedQueues.length} queues</span>
				</header>
				<div className='tdc-mm-table-stage'>
					<MetroMosaicQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-mm-layout'>
			<MetroMosaicMapField />

			<header className='tdc-mm-head'>
				<div className='tdc-mm-line-ribbons' aria-hidden='true'>
					{LINE_RIBBONS.map((line) => (
						<span key={line} className={`tdc-mm-line-ribbon tdc-mm-line-ribbon--${line}`} />
					))}
				</div>
				<MetroMosaicClock />
			</header>

			<div className='tdc-mm-stage'>
				<div className='tdc-mm-meta-panel'>
					<span className='tdc-mm-meta-panel__eyebrow'>Queue</span>
					{queueName ? (
						<span className='tdc-mm-queue' title={queueName}>
							{queueName}
						</span>
					) : (
						<span className='tdc-mm-queue tdc-mm-queue--empty' aria-hidden='true' />
					)}
					{subtitle ? (
						<span className='tdc-mm-subtitle' title={subtitle}>
							{subtitle}
						</span>
					) : null}
					<span
						className={['tdc-mm-status', `tdc-mm-status--${statusModifier}`].join(' ')}
						aria-live='polite'>
						<span className='tdc-mm-status__dot' aria-hidden='true' />
						{statusLabel}
					</span>
				</div>

				<div className='tdc-mm-token-panel'>
					<MetroMosaicToken displayToken={displayToken} slide={tokenSlide} />
				</div>
			</div>
		</div>
	);
};

export default memo(MetroMosaicCard);
