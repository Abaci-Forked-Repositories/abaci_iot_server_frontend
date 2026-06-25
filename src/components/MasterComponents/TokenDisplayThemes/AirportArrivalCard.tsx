import React, { useEffect, useState } from 'react';
export interface AirportArrivalCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
}

/** Landing-plane glyph in a square frame — Schiphol-style arrival signage. */
const ArrivalIcon: React.FC = () => (
	<svg
		className='tdc-aa-icon__svg'
		viewBox='0 0 48 48'
		aria-hidden='true'
		focusable='false'>
		<rect x='2' y='2' width='44' height='44' fill='none' stroke='currentColor' strokeWidth='2.5' />
		<path
			d='M10 30 L22 26 L28 32 L38 28 L34 24 L28 26 L22 20 L14 22 Z'
			fill='currentColor'
		/>
		<line x1='8' y1='36' x2='40' y2='36' stroke='currentColor' strokeWidth='2' />
	</svg>
);

// const AirportArrivalCard: React.FC<AirportArrivalCardProps> = ({
// 	queueName,
// 	subtitle,
// 	displayToken,
// 	statusLabel,
// }) => (
const AirportArrivalCard: React.FC<AirportArrivalCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
}) => {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const currentDate = now.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

	const currentTime = now.toLocaleTimeString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});

	return (
		<div className='tdc-aa-layout'>
			{/* <div className='tdc-aa-header'>
				{currentDate} | {currentTime}
			</div> */}
			<div className='tdc-aa-header'>
				<span className='tdc-aa-header-text'>
					{currentDate} | {currentTime}
				</span>
			</div>
			<div className='tdc-aa-main'>
				<div className='tdc-aa-left'>
					<div className='tdc-aa-icon'>
						<ArrivalIcon />
					</div>
					<div className='tdc-aa-labels'>
						{queueName ? (
							<span className='tdc-aa-queue'>{queueName}</span>
						) : (
							<span className='tdc-aa-queue tdc-aa-queue--empty' aria-hidden='true' />
						)}
						{subtitle ? <span className='tdc-aa-subtitle'>{subtitle}</span> : null}
					</div>
					<div className='tdc-aa-status-track' aria-live='polite'>
						<span className='tdc-aa-status'>{statusLabel}</span>
					</div>
				</div>
				<div className='tdc-aa-token-track'>
					<div className='tdc-aa-token' aria-label={`Token ${displayToken}`}>
						{displayToken}
					</div>
				</div>
			</div>
		</div>
	)
};

export default AirportArrivalCard;
