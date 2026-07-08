import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date/time in the blue top bar — Health Dashboard only. */
const HealthcareDashboardClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-dh-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-dh-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			<time className='tdc-dh-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default HealthcareDashboardClock;
