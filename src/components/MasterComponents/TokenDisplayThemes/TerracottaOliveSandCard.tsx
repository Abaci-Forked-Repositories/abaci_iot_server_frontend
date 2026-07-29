import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import TerracottaOliveSandAperture from './TerracottaOliveSandAperture';
import TerracottaOliveSandClock from './TerracottaOliveSandClock';
import TerracottaOliveSandMosaicField from './TerracottaOliveSandMosaicField';
import TerracottaOliveSandQueueTable from './TerracottaOliveSandQueueTable';

export interface TerracottaOliveSandCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const TerracottaOliveSandCard: React.FC<TerracottaOliveSandCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier = 'waiting',
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const [tokenReveal, setTokenReveal] = useState(false);
	const prevTokenRef = useRef(displayToken);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (prevTokenRef.current === displayToken) return;
		prevTokenRef.current = displayToken;
		setTokenReveal(true);
		const timer = window.setTimeout(() => setTokenReveal(false), 820);
		return () => window.clearTimeout(timer);
	}, [displayToken]);

	if (isMultiQueue) {
		return (
			<div className='tdc-tos-layout tdc-tos-layout--table'>
				<TerracottaOliveSandMosaicField />
				<header className='tdc-tos-table-header'>
					<TerracottaOliveSandClock />
					<span className='tdc-tos-table-header__count'>{assignedQueues.length} queues</span>
				</header>
				<div className='tdc-tos-table-stage'>
					<TerracottaOliveSandQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-tos-mosaic-layout'>
			<TerracottaOliveSandMosaicField />

			<header className='tdc-tos-mosaic-head'>
				<TerracottaOliveSandClock />
				{queueName ? (
					<span className='tdc-tos-mosaic-queue tdc-tos-mosaic-queue--header' title={queueName}>
						{queueName}
					</span>
				) : (
					<span
						className='tdc-tos-mosaic-queue tdc-tos-mosaic-queue--header tdc-tos-mosaic-queue--empty'
						aria-hidden='true'
					/>
				)}
			</header>

			<div className='tdc-tos-mosaic-stage'>
				<div className='tdc-tos-mosaic-aperture-wrap'>
					<TerracottaOliveSandAperture displayToken={displayToken} reveal={tokenReveal} />
				</div>

				<div className='tdc-tos-mosaic-meta'>
					{subtitle ? (
						<span className='tdc-tos-mosaic-subtitle' title={subtitle}>
							{subtitle}
						</span>
					) : null}
					<span
						className={[
							'tdc-tos-mosaic-status',
							`tdc-tos-mosaic-status--${statusModifier}`,
						].join(' ')}
						aria-live='polite'>
						<span className='tdc-tos-status__dot' aria-hidden='true' />
						{statusLabel}
					</span>
				</div>
			</div>
		</div>
	);
};

export default memo(TerracottaOliveSandCard);
