import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

const MetroMosaicClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-mm-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-mm-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now, { uppercase: true })}
			</span>
			<span className='tdc-mm-clock__sep' aria-hidden='true'>
				·
			</span>
			<time className='tdc-mm-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default MetroMosaicClock;
