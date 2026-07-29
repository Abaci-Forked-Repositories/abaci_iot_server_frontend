import React from 'react';
import AirportDepartureToken from './AirportDepartureToken';

export interface AirportDepartureHeroProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const AirportDepartureHero: React.FC<AirportDepartureHeroProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => (
	<div className='tdc-ad-hero' aria-live='polite'>
		<div className='tdc-ad-hero__meta'>
			<span className='tdc-ad-hero__eyebrow'>Queue</span>
			{queueName ? (
				<span className='tdc-ad-hero__queue'>{queueName}</span>
			) : (
				<span className='tdc-ad-hero__queue tdc-ad-hero__queue--empty' aria-hidden='true' />
			)}
			{subtitle ? (
				<>
					<span className='tdc-ad-hero__eyebrow tdc-ad-hero__eyebrow--counter'>Counter</span>
					<span className='tdc-ad-hero__counter'>{subtitle}</span>
				</>
			) : null}
		</div>

		<div className='tdc-ad-hero__stage' aria-label={`Token ${displayToken}`}>
			<AirportDepartureToken value={displayToken} size='hero' />
		</div>

		<footer className='tdc-ad-hero__footer'>
			<span className='tdc-ad-hero__eyebrow tdc-ad-hero__eyebrow--status'>Status</span>
			<span
				className={[
					'tdc-ad-hero__status',
					`tdc-ad-hero__status--${statusModifier}`,
				].join(' ')}>
				<span className='tdc-ad-hero__status-dot' aria-hidden='true' />
				<span className='tdc-ad-hero__status-label'>{statusLabel}</span>
			</span>
		</footer>
	</div>
);

export default AirportDepartureHero;
