import React, { useMemo } from 'react';
import { useRotatingQueueDisplay } from '../../../hooks/useRotatingQueueDisplay';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import SignalBoardClock from './SignalBoardClock';
import SignalBoardQueueTable from './SignalBoardQueueTable';
import SignalBoardToken from './SignalBoardToken';

export interface SignalBoardCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const SignalBoardCard: React.FC<SignalBoardCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	assignedQueues = [],
}) => {
	const rotationSource = useMemo<AssignedQueueDisplay[]>(() => {
		if (assignedQueues.length > 0) return assignedQueues;
		const point = subtitle?.trim() || 'Counter 01';
		return [
			{
				queueName: queueName?.trim() || 'Queue',
				servingPointName: point,
				tokenDisplay: displayToken,
				statusLabel,
				statusModifier,
				subtitle: point,
				recentTokens: [],
			},
		];
	}, [assignedQueues, queueName, displayToken, statusLabel, statusModifier, subtitle]);

	const isMultiQueue = assignedQueues.length > 1;

	const { active, queueCount } = useRotatingQueueDisplay(rotationSource);

	const servingRows = useMemo(
		() => buildPageTurnServingRows(rotationSource),
		[rotationSource],
	);

	const statusModifierClass = isMultiQueue ? 'waiting' : active.statusModifier;

	return (
		<div className='tdc-sig-layout'>
			<header
				className={['tdc-sig-meta', isMultiQueue ? 'tdc-sig-meta--multi' : '']
					.filter(Boolean)
					.join(' ')}>
				{isMultiQueue ? (
					<div className='tdc-sig-meta__cards'>
						<span className='tdc-sig-meta__eyebrow'>Queues</span>
						<div className='tdc-sig-queue-cards' role='list' aria-label='Assigned queues'>
							{rotationSource.map((queue) => {
								const isActive = queue.queueName === active.queueName;
								return (
									<div
										key={queue.queueName}
										role='listitem'
										className={[
											'tdc-sig-queue-card',
											isActive ? 'tdc-sig-queue-card--active' : '',
										]
											.filter(Boolean)
											.join(' ')}
										aria-current={isActive ? 'true' : undefined}
										title={queue.queueName}>
										<span className='tdc-sig-queue-card__name'>{queue.queueName}</span>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className='tdc-sig-meta__copy'>
						<span className='tdc-sig-meta__eyebrow'>Queue</span>
						<span className='tdc-sig-meta__queue'>{active.queueName}</span>
						{active.servingPointName ? (
							<span className='tdc-sig-meta__sub'>{active.servingPointName}</span>
						) : null}
					</div>
				)}
				{isMultiQueue ? (
					<SignalBoardClock />
				) : (
					<div
						className={['tdc-sig-status', `tdc-sig-status--${statusModifierClass}`]
							.filter(Boolean)
							.join(' ')}
						aria-live='polite'>
						<span className='tdc-sig-status__dot' aria-hidden='true' />
						<span className='tdc-sig-status__label'>{active.statusLabel}</span>
					</div>
				)}
			</header>

			<div
				className={[
					'tdc-sig-stage',
					isMultiQueue ? 'tdc-sig-stage--table-only' : 'tdc-sig-stage--token-only',
				]
					.filter(Boolean)
					.join(' ')}>
				{isMultiQueue ? (
					<div className='tdc-sig-panel tdc-sig-panel--table'>
						<SignalBoardQueueTable
							rows={servingRows}
							activeQueueName={queueCount > 1 ? active.queueName : undefined}
						/>
					</div>
				) : (
					<div className='tdc-sig-panel tdc-sig-panel--hero tdc-sig-panel--hero-focus tdc-sig-panel--hero-single'>
						<div className='tdc-sig-hero__cap'>
							<SignalBoardClock />
						</div>
						<div className='tdc-sig-hero__main'>
							<SignalBoardToken value={displayToken} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SignalBoardCard;
