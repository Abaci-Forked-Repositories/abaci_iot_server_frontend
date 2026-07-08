import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

export interface PipboyLiveClockProps {
	fillContainer?: boolean;
}

const PipboyLiveClock: React.FC<PipboyLiveClockProps> = ({ fillContainer = false }) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const rootClass = ['tdc-pipboy-clock', fillContainer ? 'tdc-pipboy-clock--fill' : '']
		.filter(Boolean)
		.join(' ');

	const displayTime = formatThemeDisplayClockTimeWithSeconds(now);

	return (
		<div className={rootClass} aria-label={`Current time ${displayTime}`}>
			<span className='tdc-pipboy-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now, { uppercase: true })}
			</span>
			<span className='tdc-pipboy-clock__divider' aria-hidden='true'>
				~
			</span>
			<time className='tdc-pipboy-clock__time' dateTime={now.toISOString()}>
				{displayTime}
			</time>
		</div>
	);
};

export default PipboyLiveClock;
