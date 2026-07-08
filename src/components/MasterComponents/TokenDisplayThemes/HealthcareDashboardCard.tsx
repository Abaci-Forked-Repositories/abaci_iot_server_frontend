import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import HealthcareDashboardClock from './HealthcareDashboardClock';
import HealthcareDashboardQueueTable from './HealthcareDashboardQueueTable';
import HealthcareToken from './HealthcareToken';

export interface HealthcareDashboardCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	assignedQueues?: AssignedQueueDisplay[];
}

const MedicalCrossIcon: React.FC = () => (
	<svg
		className='tdc-dh-topbar__icon'
		viewBox='0 0 24 24'
		aria-hidden='true'
		focusable='false'>
		<rect x='3' y='3' width='18' height='18' rx='4' fill='currentColor' opacity='0.22' />
		<path d='M11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7z' fill='currentColor' />
	</svg>
);

const HealthcareDashboardCard: React.FC<HealthcareDashboardCardProps> = ({
	queueName,
	displayToken,
	statusLabel,
	statusModifier,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;
	const skipCallRef = useRef(true);
	const [tokenCardActive, setTokenCardActive] = useState(false);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	useEffect(() => {
		if (isMultiQueue) return;
		if (skipCallRef.current) {
			skipCallRef.current = false;
			return;
		}
		setTokenCardActive(true);
	}, [displayToken, isMultiQueue]);

	if (isMultiQueue) {
		return (
			<div className='tdc-dh-layout tdc-dh-layout--table'>
				<header className='tdc-dh-table-header'>
					<MedicalCrossIcon />
					<div className='tdc-dh-table-header__copy' aria-live='polite'>
						<span className='tdc-dh-table-header__count'>
							{assignedQueues.length} queues
						</span>
					</div>
					<div className='tdc-dh-table-header__meta'>
						<HealthcareDashboardClock />
					</div>
				</header>

				<div className='tdc-dh-table-stage'>
					<HealthcareDashboardQueueTable rows={servingRows} />
				</div>
			</div>
		);
	}

	return (
		<div className='tdc-dh-layout'>
			<header className='tdc-dh-topbar'>
				<MedicalCrossIcon />
				{queueName ? (
					<span className='tdc-dh-topbar__queue' title={`Queue ${queueName}`}>
						{queueName}
					</span>
				) : null}
				<HealthcareDashboardClock />
				<span
					className={`tdc-dh-topbar__status tdc-dh-topbar__status--${statusModifier}`}
					aria-live='polite'>
					{statusLabel}
				</span>
			</header>

			<div className='tdc-dh-main'>
				<div
					className={[
						'tdc-dh-card',
						'tdc-dh-card--token',
						tokenCardActive ? 'tdc-dh-card--lift' : '',
					]
						.filter(Boolean)
						.join(' ')}
					aria-label={`Token ${displayToken}`}
					onAnimationEnd={() => setTokenCardActive(false)}>
					<div className='tdc-dh-pulse-rings' aria-hidden='true'>
						<span />
						<span />
						<span />
					</div>
					<span className='tdc-dh-card__eyebrow tdc-dh-card__eyebrow--token'>Now Calling</span>
					<div className='tdc-dh-token-wrap'>
						<HealthcareToken value={displayToken} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default HealthcareDashboardCard;
