import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live DATE · TIME in the Paper Flip hero header. */
const PaperFlipClock: React.FC = () => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const dateLabel = formatThemeDisplayClockDate(now);
	const timeLabel = formatThemeDisplayClockTimeWithSeconds(now);

	return (
		<div className='tdc-pf-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-pf-clock__text' aria-hidden='true'>
				<span className='tdc-pf-clock__date'>{dateLabel}</span>
				<span className='tdc-pf-clock__sep' aria-hidden='true'>
					·
				</span>
				<time className='tdc-pf-clock__time' dateTime={now.toISOString()}>
					{timeLabel}
				</time>
			</span>
		</div>
	);
};

export default PaperFlipClock;
