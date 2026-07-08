import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import AuroraNexusBackdrop from './AuroraNexusBackdrop';
import AuroraNexusClock from './AuroraNexusClock';
import AuroraNexusQueueTable from './AuroraNexusQueueTable';
import AuroraNexusToken from './AuroraNexusToken';

export interface AuroraNexusCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const ClockIcon: React.FC = () => (
	<svg className='tdc-an-status__icon' viewBox='0 0 24 24' aria-hidden='true'>
		<circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' strokeWidth='1.6' />
		<path
			d='M12 7v5.2l3.2 2'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.6'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);

const AuroraNexusCard: React.FC<AuroraNexusCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const queueLabel = queueName?.trim() || '';
	const pointLabel = subtitle?.trim() || '';
	const hasHeader = Boolean(queueLabel || pointLabel);
	const skipStatusFxRef = useRef(true);
	const [statusEnterFx, setStatusEnterFx] = useState<'completed-enter' | 'alert-enter' | null>(
		null,
	);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (isMultiQueue) return;
		if (skipStatusFxRef.current) {
			skipStatusFxRef.current = false;
			return;
		}
		if (statusModifier === 'completed') {
			setStatusEnterFx('completed-enter');
			return;
		}
		if (statusModifier === 'cancelled' || statusModifier === 'no-show') {
			setStatusEnterFx('alert-enter');
			return;
		}
		setStatusEnterFx(null);
	}, [isMultiQueue, statusModifier]);

	if (isMultiQueue) {
		return (
			<div className='tdc-an-layout tdc-an-layout--table'>
				<AuroraNexusBackdrop />

				<header className='tdc-an-table-header'>
					<div className='tdc-an-table-header__copy' aria-live='polite'>
						<span className='tdc-an-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-an-table-header__meta'>
						<AuroraNexusClock />
					</div>
				</header>

				<div className='tdc-an-table-stage'>
					<AuroraNexusQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-an-layout'>
			<AuroraNexusBackdrop />

			<header className='tdc-an-header'>
				<span className='tdc-an-header__line' aria-hidden='true' />
				<span className='tdc-an-header__dot' aria-hidden='true' />
				{hasHeader ? (
					<span className='tdc-an-header__text'>
						{queueLabel ? (
							<span className='tdc-an-header__queue' title={`Queue ${queueLabel}`}>
								{queueLabel}
							</span>
						) : null}
						{queueLabel && pointLabel ? (
							<span className='tdc-an-header__sep' aria-hidden='true'>
								·
							</span>
						) : null}
						{pointLabel ? (
							<span className='tdc-an-header__point' title={pointLabel}>
								{pointLabel}
							</span>
						) : null}
					</span>
				) : (
					<span className='tdc-an-header__text tdc-an-header__text--empty' aria-hidden='true' />
				)}
				<span className='tdc-an-header__dot' aria-hidden='true' />
				<span className='tdc-an-header__line' aria-hidden='true' />
			</header>

			<div className='tdc-an-main'>
				<div className='tdc-an-hero' aria-label={`Token ${displayToken}`}>
					<AuroraNexusToken value={displayToken} />
				</div>

				<div className='tdc-an-separator' aria-hidden='true'>
					<span className='tdc-an-separator__line' />
					<span className='tdc-an-separator__spark' />
					<span className='tdc-an-separator__line' />
				</div>

				<div
					className={[
						'tdc-an-status',
						`tdc-an-status--${statusModifier}`,
						statusEnterFx ? `tdc-an-status--${statusEnterFx}` : '',
					]
						.filter(Boolean)
						.join(' ')}
					aria-live='polite'
					onAnimationEnd={
						statusEnterFx
							? () => {
									setStatusEnterFx(null);
								}
							: undefined
					}>
					<ClockIcon />
					<span className='tdc-an-status__label'>{statusLabel}</span>
					<AuroraNexusClock />
				</div>
			</div>
		</div>
	);
};

export default AuroraNexusCard;
