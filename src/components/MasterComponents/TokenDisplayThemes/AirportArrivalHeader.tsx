import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

const AirportArrivalHeader: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const currentDate = formatThemeDisplayClockDate(now, { uppercase: true });
	const currentTime = formatThemeDisplayClockTimeWithSeconds(now);

	return (
		<div className='tdc-aa-header' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-aa-header-text' aria-hidden='true'>
				{currentDate} | {currentTime}
			</span>
		</div>
	);
};

export default AirportArrivalHeader;
