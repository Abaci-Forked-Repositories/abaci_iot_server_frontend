import React from 'react';

export interface AirportArrivalHeroProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
}

const AirportArrivalHero: React.FC<AirportArrivalHeroProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
}) => (
	<>
		<div className='tdc-aa-left'>
			<div className='tdc-aa-drift-track tdc-aa-queue-track'>
				{queueName ? (
					<span className='tdc-aa-queue'>{queueName}</span>
				) : (
					<span className='tdc-aa-queue tdc-aa-queue--empty' aria-hidden='true' />
				)}
			</div>
			{subtitle ? (
				<div className='tdc-aa-drift-track tdc-aa-subtitle-track'>
					<span className='tdc-aa-subtitle'>{subtitle}</span>
				</div>
			) : null}
			<div className='tdc-aa-drift-track tdc-aa-status-track' aria-live='polite'>
				<span className='tdc-aa-status'>{statusLabel}</span>
			</div>
		</div>
		<div className='tdc-aa-token-track'>
			<div className='tdc-aa-token' aria-label={`Token ${displayToken}`}>
				{displayToken}
			</div>
		</div>
	</>
);

export default AirportArrivalHero;
