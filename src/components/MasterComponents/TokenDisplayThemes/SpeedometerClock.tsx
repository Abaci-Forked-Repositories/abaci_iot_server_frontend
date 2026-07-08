import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTime,
} from '../../../utils/themeDisplayClock';

/** Live date (left), optional queue (center), and time (right) — Car Speedometer header. */
export interface SpeedometerClockProps {
	queueName?: string;
}

const SpeedometerClock: React.FC<SpeedometerClockProps> = ({ queueName }) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-cs-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-cs-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			{queueName ? (
				<span className='tdc-cs-clock__queue' title={`Queue ${queueName}`}>
					{queueName}
				</span>
			) : (
				<span className='tdc-cs-clock__queue tdc-cs-clock__queue--empty' aria-hidden='true' />
			)}
			<time className='tdc-cs-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTime(now)}
			</time>
		</div>
	);
};

export default SpeedometerClock;
