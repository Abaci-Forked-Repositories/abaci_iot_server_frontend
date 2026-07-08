import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTime,
} from '../../../utils/themeDisplayClock';

/** Live date (left) and time (right) — Car Speedometer header only. */
const SpeedometerClock: React.FC = () => {
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
			<time className='tdc-cs-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTime(now)}
			</time>
		</div>
	);
};

export default SpeedometerClock;
