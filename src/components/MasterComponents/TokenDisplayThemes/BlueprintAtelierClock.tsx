import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

const BlueprintAtelierClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-ba-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-ba-clock__date-group'>
				
				<span className='tdc-ba-clock__date' aria-hidden='true'>
					{formatThemeDisplayClockDate(now, { uppercase: true })}
				</span>
			</span>
			<time className='tdc-ba-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default BlueprintAtelierClock;
