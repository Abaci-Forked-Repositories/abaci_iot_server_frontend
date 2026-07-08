import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date/time for Sun Bento bottom-left caption area. */
const SunBentoClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-sb-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-sb-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			<time className='tdc-sb-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default SunBentoClock;
