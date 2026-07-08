import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date/time below the token — Velvet Crown only. */
const VelvetCrownClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-vc-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-vc-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			<time className='tdc-vc-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default VelvetCrownClock;
