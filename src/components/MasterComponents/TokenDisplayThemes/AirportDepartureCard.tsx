import React, { useMemo } from 'react';
import type { AssignedQueueDisplay } from '../../../utils/zoneQueueResolution';
import { buildPageTurnServingRows } from '../../../utils/zoneQueueResolution';
import AirportDepartureClock from './AirportDepartureClock';
import AirportDepartureHero from './AirportDepartureHero';
import AirportDepartureQueueTable from './AirportDepartureQueueTable';

export interface AirportDepartureCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
	previewMode?: boolean;
	assignedQueues?: AssignedQueueDisplay[];
}

/** Minimal departure-plane glyph in a square frame — FIDS header icon. */
const DepartureIcon: React.FC = () => (
	<svg
		className='tdc-ad-header__icon-svg'
		viewBox='0 0 48 48'
		aria-hidden='true'
		focusable='false'>
		<rect x='3' y='3' width='42' height='42' fill='currentColor' />
		<path
			d='M12 28 L24 22 L30 30 L38 26 L34 20 L28 22 L22 14 L14 18 Z'
			fill='#f5c518'
		/>
	</svg>
);

const AirportDepartureCard: React.FC<AirportDepartureCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
	assignedQueues = [],
}) => {
	const isMultiQueue = assignedQueues.length > 1;

	const active = useMemo<AssignedQueueDisplay>(() => {
		if (assignedQueues.length === 1) return assignedQueues[0];
		const point = subtitle?.trim() || 'Counter 01';
		return {
			queueName: queueName?.trim() || 'Queue',
			servingPointName: point,
			tokenDisplay: displayToken,
			statusLabel,
			statusModifier,
			subtitle: point,
			recentTokens: [],
		};
	}, [assignedQueues, queueName, displayToken, statusLabel, statusModifier, subtitle]);

	const servingRows = useMemo(
		() => (isMultiQueue ? buildPageTurnServingRows(assignedQueues) : []),
		[assignedQueues, isMultiQueue],
	);

	return (
		<div
			className={[
				'tdc-ad-layout',
				isMultiQueue ? 'tdc-ad-layout--multi' : 'tdc-ad-layout--single',
			]
				.filter(Boolean)
				.join(' ')}>
			<header className='tdc-ad-header'>
				<div className='tdc-ad-header__icon' aria-hidden='true'>
					<DepartureIcon />
				</div>
				<div className='tdc-ad-header__copy'>
					<AirportDepartureClock />
					{isMultiQueue ? (
						<span className='tdc-ad-header__meta'>
							{assignedQueues.length} queues
						</span>
					) : null}
				</div>
			</header>

			<div className='tdc-ad-board'>
				{isMultiQueue ? (
					<AirportDepartureQueueTable rows={servingRows} />
				) : (
					<AirportDepartureHero
						queueName={active.queueName}
						subtitle={active.servingPointName || active.subtitle}
						displayToken={active.tokenDisplay}
						statusLabel={active.statusLabel}
						statusModifier={active.statusModifier}
					/>
				)}
			</div>
		</div>
	);
};

export default AirportDepartureCard;
