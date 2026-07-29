import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

function useLiveNow(): Date {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return now;
}

/** Live date in the Queue panel — Neon Prism only. */
export const NeonPrismDateDisplay: React.FC = () => {
	const now = useLiveNow();
	const dateLabel = formatThemeDisplayClockDate(now);

	return (
		<time
			className='tdc-np-wing__live-date'
			dateTime={now.toISOString()}
			aria-label={`Current date ${dateLabel}`}>
			{dateLabel}
		</time>
	);
};

/** Live time in the Status panel — Neon Prism only. */
export const NeonPrismTimeDisplay: React.FC = () => {
	const now = useLiveNow();
	const timeLabel = formatThemeDisplayClockTimeWithSeconds(now);

	return (
		<time
			className='tdc-np-wing__live-time'
			dateTime={now.toISOString()}
			aria-label={`Current time ${timeLabel}`}>
			{timeLabel}
		</time>
	);
};

/** Combined date + time for multi-queue table header. */
export const NeonPrismHeaderClock: React.FC = () => {
	const now = useLiveNow();
	const dateLabel = formatThemeDisplayClockDate(now);
	const timeLabel = formatThemeDisplayClockTimeWithSeconds(now);

	return (
		<div className='tdc-np-table-clock' aria-label={`Current date and time ${dateLabel} ${timeLabel}`}>
			<time className='tdc-np-table-clock__date' dateTime={now.toISOString()}>
				{dateLabel}
			</time>
			<span className='tdc-np-table-clock__sep' aria-hidden='true'>
				·
			</span>
			<time className='tdc-np-table-clock__time' dateTime={now.toISOString()}>
				{timeLabel}
			</time>
		</div>
	);
};
