import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import BlueprintAtelierClock from './BlueprintAtelierClock';
import BlueprintAtelierGridField from './BlueprintAtelierGridField';
import BlueprintAtelierQueueTable from './BlueprintAtelierQueueTable';
import BlueprintAtelierToken from './BlueprintAtelierToken';

export interface BlueprintAtelierCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier?: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const BlueprintAtelierCard: React.FC<BlueprintAtelierCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier = 'waiting',
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const [tokenDraw, setTokenDraw] = useState(false);
	const prevTokenRef = useRef(displayToken);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (prevTokenRef.current === displayToken) return;
		prevTokenRef.current = displayToken;
		setTokenDraw(true);
		const timer = window.setTimeout(() => setTokenDraw(false), 900);
		return () => window.clearTimeout(timer);
	}, [displayToken]);

	if (isMultiQueue) {
		return (
			<div className='tdc-ba-layout tdc-ba-layout--table'>
				<BlueprintAtelierGridField />
				<header className='tdc-ba-table-header'>
					{/* <div className='tdc-ba-sheet-stamp' aria-hidden='true'>
						<span className='tdc-ba-sheet-stamp__rev'>REV</span>
						<span className='tdc-ba-sheet-stamp__sheet'>SHEET 01</span>
					</div> */}
					<BlueprintAtelierClock />
					<span className='tdc-ba-table-header__count'>{assignedQueues.length} queues</span>
				</header>
				<div className='tdc-ba-table-stage'>
					<BlueprintAtelierQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-ba-layout'>
			<BlueprintAtelierGridField />

			<header className='tdc-ba-head'>
				{/* <div className='tdc-ba-sheet-stamp' aria-hidden='true'>
					<span className='tdc-ba-sheet-stamp__rev'>REV</span>
					<span className='tdc-ba-sheet-stamp__sheet'>SHEET 01</span>
				</div> */}
				{/* <span className='tdc-ba-head__title'>BLUEPRINT ATELIER</span> */}
				<BlueprintAtelierClock />
			</header>

			<div className='tdc-ba-stage'>
				<div className='tdc-ba-titleblock'>
					<div className='tdc-ba-titleblock__row'>
						{/* <span className='tdc-ba-titleblock__key'>QUEUE</span> */}
						{queueName ? (
							<span className='tdc-ba-titleblock__val' title={queueName}>
								{queueName}
							</span>
						) : (
							<span className='tdc-ba-titleblock__val tdc-ba-titleblock__val--empty' aria-hidden='true' />
						)}
					</div>
					{subtitle ? (
						<div className='tdc-ba-titleblock__row'>
							{/* <span className='tdc-ba-titleblock__key'>POINT</span> */}
							<span className='tdc-ba-titleblock__val tdc-ba-titleblock__val--sub' title={subtitle}>
								{subtitle}
							</span>
						</div>
					) : null}
					<div className='tdc-ba-titleblock__row tdc-ba-titleblock__row--status'>
						{/* <span className='tdc-ba-titleblock__key'>STATUS</span> */}
						<span
							className={['tdc-ba-status', `tdc-ba-status--${statusModifier}`].join(' ')}
							aria-live='polite'>
							<span className='tdc-ba-status__mark' aria-hidden='true' />
							{statusLabel}
						</span>
					</div>
				</div>

				<div className='tdc-ba-token-panel'>
					<BlueprintAtelierToken displayToken={displayToken} draw={tokenDraw} />
				</div>
			</div>
		</div>
	);
};

export default memo(BlueprintAtelierCard);
