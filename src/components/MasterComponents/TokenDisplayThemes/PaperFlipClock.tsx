import React, { useEffect, useState } from 'react';
import {
	formatThemeDisplayClockAriaLabel,
	formatThemeDisplayClockDate,
	formatThemeDisplayClockTimeWithSeconds,
} from '../../../utils/themeDisplayClock';

export interface PaperFlipClockProps {
	/** `split` — date left / queue center / time right on the desk header; `inline` — DATE · TIME together. */
	layout?: 'inline' | 'split';
	queueName?: string;
}

/** Live date and time for Paper Flip — desk header or compact table copy. */
const PaperFlipClock: React.FC<PaperFlipClockProps> = ({
	layout = 'inline',
	queueName,
}) => {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 1000);
		return () => window.clearInterval(timer);
	}, []);

	const dateLabel = formatThemeDisplayClockDate(now);
	const timeLabel = formatThemeDisplayClockTimeWithSeconds(now);
	const ariaLabel = formatThemeDisplayClockAriaLabel(now);

	if (layout === 'split') {
		return (
			<div
				className='tdc-pf-clock tdc-pf-clock--split'
				aria-label={ariaLabel}>
				<span className='tdc-pf-clock__date' aria-hidden='true'>
					{dateLabel}
				</span>
				{queueName ? (
					<span className='tdc-pf-clock__queue' title={`Queue ${queueName}`}>
						{queueName}
					</span>
				) : (
					<span className='tdc-pf-clock__queue tdc-pf-clock__queue--empty' aria-hidden='true' />
				)}
				<time className='tdc-pf-clock__time' dateTime={now.toISOString()}>
					{timeLabel}
				</time>
			</div>
		);
	}

	return (
		<div className='tdc-pf-clock' aria-label={ariaLabel}>
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
