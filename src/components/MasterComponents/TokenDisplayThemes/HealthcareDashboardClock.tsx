import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date/time in the blue top bar — Health Dashboard only. */
export type HealthcareDashboardClockPart = 'both' | 'date' | 'time';

export interface HealthcareDashboardClockProps {
	/** Split date/time for custom top-bar placement; default renders both together. */
	part?: HealthcareDashboardClockPart;
}

const HealthcareDashboardClock: React.FC<HealthcareDashboardClockProps> = ({ part = 'both' }) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const ariaLabel = formatThemeDisplayClockAriaLabel(now);
	const dateText = formatThemeDisplayClockDate(now);
	const timeText = formatThemeDisplayClockTimeWithSeconds(now);

	if (part === 'date') {
		return (
			<span className='tdc-dh-clock__date' aria-hidden='true'>
				{dateText}
			</span>
		);
	}

	if (part === 'time') {
		return (
			<time className='tdc-dh-clock__time' dateTime={now.toISOString()} aria-label={ariaLabel}>
				{timeText}
			</time>
		);
	}

	return (
		<div className='tdc-dh-clock' aria-label={ariaLabel}>
			<span className='tdc-dh-clock__date' aria-hidden='true'>
				{dateText}
			</span>
			<time className='tdc-dh-clock__time' dateTime={now.toISOString()}>
				{timeText}
			</time>
		</div>
	);
};

export default HealthcareDashboardClock;
