import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

const TerracottaOliveSandClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-tos-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-tos-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now, { uppercase: true })}
			</span>
			<span className='tdc-tos-clock__sep' aria-hidden='true'>
				·
			</span>
			<time className='tdc-tos-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default TerracottaOliveSandClock;
