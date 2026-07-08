import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

/** Live date (left), optional queue (center), and time (right) — Mono Flip header. */
export interface MonoFlipClockProps {
	queueName?: string;
}

const MonoFlipClock: React.FC<MonoFlipClockProps> = ({ queueName }) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className='tdc-mf-clock' aria-label={formatThemeDisplayClockAriaLabel(now)}>
			<span className='tdc-mf-clock__date' aria-hidden='true'>
				{formatThemeDisplayClockDate(now)}
			</span>
			{queueName ? (
				<span className='tdc-mf-clock__queue' title={`Queue ${queueName}`}>
					{queueName}
				</span>
			) : (
				<span className='tdc-mf-clock__queue tdc-mf-clock__queue--empty' aria-hidden='true' />
			)}
			<time className='tdc-mf-clock__time' dateTime={now.toISOString()}>
				{formatThemeDisplayClockTimeWithSeconds(now)}
			</time>
		</div>
	);
};

export default MonoFlipClock;
