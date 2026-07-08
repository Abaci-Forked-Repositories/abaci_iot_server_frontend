import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date/time for Digital Crimson header — top-right. */
const DigitalCrimsonClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-dc-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-dc-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			<time className='tdc-dc-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default DigitalCrimsonClock;
