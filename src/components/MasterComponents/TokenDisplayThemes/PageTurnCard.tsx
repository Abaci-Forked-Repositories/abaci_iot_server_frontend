import React, { useMemo } from 'react';
import { useRotatingQueueDisplay } from '../../../hooks/useRotatingQueueDisplay';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import PageTurnQueueTable from './PageTurnQueueTable';
import PageTurnToken from './PageTurnToken';

export interface PageTurnCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const PageTurnCard: React.FC<PageTurnCardProps> = ({
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

	return (
		<div className='tdc-pt-layout'>
			<header
				className={['tdc-pt-meta', isMultiQueue ? 'tdc-pt-meta--multi' : '']
					.filter(Boolean)
					.join(' ')}>
				{isMultiQueue ? (
					<div className='tdc-pt-meta__cards'>
						<span className='tdc-pt-meta__eyebrow'>Queues</span>
						<div className='tdc-pt-queue-cards' role='list' aria-label='Assigned queues'>
							{rotationSource.map((queue) => {
								const isActive = queue.queueName === active.queueName;
								return (
									<div
										key={queue.queueName}
										role='listitem'
										className={[
											'tdc-pt-queue-card',
											isActive ? 'tdc-pt-queue-card--active' : '',
										]
											.filter(Boolean)
											.join(' ')}
										aria-current={isActive ? 'true' : undefined}
										title={queue.queueName}>
										<span className='tdc-pt-queue-card__name'>{queue.queueName}</span>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className='tdc-pt-meta__copy'>
						<span className='tdc-pt-meta__eyebrow'>Queue</span>
						<span className='tdc-pt-meta__queue'>{active.queueName}</span>
						{active.servingPointName ? (
							<span className='tdc-pt-meta__sub'>{active.servingPointName}</span>
						) : null}
					</div>
				)}
				<div
					className={[
						'tdc-pt-status',
						`tdc-pt-status--${isMultiQueue ? 'waiting' : active.statusModifier}`,
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'>
					<span className='tdc-pt-status__dot' aria-hidden='true' />
					<span className='tdc-pt-status__label'>
						{isMultiQueue ? 'Live board' : active.statusLabel}
					</span>
				</div>
			</header>

			<div
				className={[
					'tdc-pt-stage',
					isMultiQueue ? 'tdc-pt-stage--table-only' : 'tdc-pt-stage--token-only',
				]
					.filter(Boolean)
					.join(' ')}>
				{isMultiQueue ? (
					<div className='tdc-pt-panel tdc-pt-panel--table'>
						<PageTurnQueueTable
							rows={servingRows}
							activeQueueName={queueCount > 1 ? active.queueName : undefined}
						/>
					</div>
				) : (
					<div className='tdc-pt-panel tdc-pt-panel--hero tdc-pt-panel--hero-focus tdc-pt-panel--hero-single'>
						<div className='tdc-pt-hero__cap'>
							<span className='tdc-pt-hero__eyebrow'>Now Calling</span>
						</div>
						<div className='tdc-pt-hero__main'>
							<PageTurnToken value={displayToken} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PageTurnCard;
