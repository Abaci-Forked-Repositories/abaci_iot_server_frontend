import React, { memo, useEffect, useState } from 'react';
import SpeedometerGauge from './SpeedometerGauge';
import SpeedometerToken from './SpeedometerToken';

export interface SpeedometerCardProps {
	queueName?: string;
	subtitle?: string;
	displayToken: string;
	statusLabel: string;
	statusModifier: string;
}

const SpeedometerCard: React.FC<SpeedometerCardProps> = ({
	queueName,
	subtitle,
	displayToken,
	statusLabel,
	statusModifier,
}) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

	return (
		<div className='tdc-cs-layout'>
			<div className='tdc-cs-digital'>
				<div className='tdc-cs-digital__nav' aria-hidden='true'>
					<span className='tdc-cs-digital__nav-dot' />
					<span className='tdc-cs-digital__nav-dot' />
					<span className='tdc-cs-digital__nav-dot tdc-cs-digital__nav-dot--active' />
					<span className='tdc-cs-digital__nav-dot' />
					<span className='tdc-cs-digital__nav-dot' />
				</div>

				<div className='tdc-cs-digital__screen'>
					{queueName ? (
						<span className='tdc-cs-digital__queue'>{queueName}</span>
					) : (
						<span className='tdc-cs-digital__queue tdc-cs-digital__queue--empty' aria-hidden='true' />
					)}

					<div className='tdc-cs-digital__readout' aria-label={`Token ${displayToken}`}>
						<SpeedometerToken value={displayToken} />
					</div>

					{subtitle ? <span className='tdc-cs-digital__subtitle'>{subtitle}</span> : null}

					<div className='tdc-cs-digital__bar' aria-hidden='true'>
						<div className='tdc-cs-digital__bar-track'>
							{[0, 1, 2, 3, 4].map((i) => (
								<span key={i} className='tdc-cs-digital__bar-tick' />
							))}
						</div>
					</div>
				</div>

				<footer className='tdc-cs-digital__footer'>
					<span
						className={`tdc-cs-digital__status tdc-cs-digital__status--${statusModifier}`}
						aria-live='polite'>
						{statusLabel}
					</span>
					<span className='tdc-cs-digital__clock' aria-hidden='true'>
						{timeStr}
					</span>
				</footer>
			</div>

			<div className='tdc-cs-gauge-wrap'>
				<SpeedometerGauge token={displayToken} />
			</div>
		</div>
	);
};

export default memo(SpeedometerCard);
