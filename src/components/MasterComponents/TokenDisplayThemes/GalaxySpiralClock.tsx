import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

const GalaxySpiralClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-gs-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-gs-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now, { uppercase: true })}
			</span>
			<span className='tdc-gs-clock__sep' aria-hidden='true'>
				·
			</span>
			<time className='tdc-gs-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default GalaxySpiralClock;
